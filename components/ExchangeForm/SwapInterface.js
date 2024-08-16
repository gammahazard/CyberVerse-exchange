import { useState, useCallback } from 'react';
import useChangelly from '../../hooks/useChangelly';
import styles from '../../styles/Home.module.css';

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
}

export default function SwapInterface({ sendCurrency, receiveCurrency, onSwap }) {
    const [amount, setAmount] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [rateType, setRateType] = useState('floating');
    const [estimatedAmount, setEstimatedAmount] = useState('');
    const [error, setError] = useState('');
    const [isAddressValid, setIsAddressValid] = useState(true);
    const [isEstimationSuccessful, setIsEstimationSuccessful] = useState(false);

    const { estimateFloatingRate, estimateFixedRate, validateAddress } = useChangelly();

    const validateRecipientAddress = useCallback(
        async (address) => {
            if (address && receiveCurrency) {
                try {
                    const validationResult = await validateAddress(receiveCurrency, address);
                    if (validationResult.result) {
                        setIsAddressValid(true);
                        setError(''); // Clear error if the address is valid
                    } else {
                        setIsAddressValid(false);
                        setError(validationResult.message || 'Invalid address');
                    }
                } catch (err) {
                    setIsAddressValid(false);
                    setError(err.message || 'Failed to validate address');
                }
            }
        },
        [receiveCurrency, validateAddress]
    );

    const debouncedValidateAddress = useCallback(debounce(validateRecipientAddress, 500), [
        validateRecipientAddress,
    ]);

    const handleAddressChange = (e) => {
        const address = e.target.value;
        setRecipientAddress(address);
        debouncedValidateAddress(address);
    };

    const handleAddressBlur = () => {
        validateRecipientAddress(recipientAddress);
    };

    const handleAmountChange = async (e) => {
        setAmount(e.target.value);
        console.log('Amount changed:', e.target.value);
        console.log('Selected rate type:', rateType);
        console.log('Send currency:', sendCurrency);
        console.log('Receive currency:', receiveCurrency);
    
        if (sendCurrency && receiveCurrency && e.target.value) {
            try {
                let estimation;
                if (rateType === 'floating') {
                    console.log('Calling estimateFloatingRate...');
                    estimation = await estimateFloatingRate(sendCurrency, receiveCurrency, e.target.value);
                } else {
                    console.log('Calling estimateFixedRate...');
                    estimation = await estimateFixedRate(sendCurrency, receiveCurrency, e.target.value);
                }
                console.log('Estimated amount received:', estimation);
                setEstimatedAmount(estimation.amountTo);
                setError('');
                setIsEstimationSuccessful(true);
            } catch (err) {
                console.error('Error during estimation:', err.message || err);
                setError(err.message);
                setEstimatedAmount('');
                setIsEstimationSuccessful(false);
            }
        } else {
            setEstimatedAmount('');
            setError('');
            setIsEstimationSuccessful(false);
        }
    };

    const handleRateTypeChange = async (e) => {
        setRateType(e.target.value);
        console.log('Rate type changed to:', e.target.value);
        setEstimatedAmount('');
        setError(''); // Clear any previous error
        setIsEstimationSuccessful(false);

        if (amount && sendCurrency && receiveCurrency) {
            handleAmountChange({ target: { value: amount } });
        }
    };

    const handleSwapClick = () => {
        console.log('Initiating swap with amount:', amount, 'and recipientAddress:', recipientAddress);
        if (!amount || !recipientAddress || !isAddressValid || !isEstimationSuccessful) {
            alert('Please fill in all fields with valid data and ensure estimation is successful.');
            return;
        }

        onSwap(amount, recipientAddress, rateType);
    };

    return (
        <div className={styles.swapInterface}>
            <h2 className={styles.prompt}>Swap {sendCurrency.toUpperCase()} for {receiveCurrency.toUpperCase()}</h2>
            <div className={styles.inputGroup}>
                <input
                    type="number"
                    placeholder={`Enter amount of ${sendCurrency.toUpperCase()} you want to send`}
                    value={amount}
                    onChange={handleAmountChange}
                    className={styles.inputField}
                />
            </div>
            <div className={styles.inputGroup}>
                <input
                    type="text"
                    placeholder={`Enter your ${receiveCurrency.toUpperCase()} address`}
                    value={recipientAddress}
                    onChange={handleAddressChange}
                    onBlur={handleAddressBlur}
                    className={styles.inputField}
                />
            </div>
            <div className={styles.inputGroup}>
                <select value={rateType} onChange={handleRateTypeChange} className={styles.inputField}>
                    <option value="floating">Floating Rate</option>
                    <option value="fixed">Fixed Rate</option>
                </select>
            </div>
            {estimatedAmount && (
                <div className={styles.estimatedAmount}>
                    Estimated Amount to Receive: {estimatedAmount} {receiveCurrency.toUpperCase()} for {amount} {sendCurrency.toUpperCase()}
                </div>
            )}
            {error && <div className={styles.error}>{error}</div>}
            <button
                onClick={handleSwapClick}
                className={styles.swapButton}
                disabled={!isAddressValid || !amount || !recipientAddress || !isEstimationSuccessful}
            >
                Swap Now
            </button>
        </div>
    );
}