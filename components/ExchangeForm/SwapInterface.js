import { useState, useCallback, useEffect } from 'react';
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
    const [isVisible, setIsVisible] = useState(false); // State to manage visibility

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

    const estimateAmount = useCallback(async () => {
        if (sendCurrency && receiveCurrency && amount) {
            try {
                let estimation;
                if (rateType === 'floating') {
                    estimation = await estimateFloatingRate(sendCurrency, receiveCurrency, amount);
                } else {
                    estimation = await estimateFixedRate(sendCurrency, receiveCurrency, amount);
                }
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
    }, [sendCurrency, receiveCurrency, amount, rateType, estimateFloatingRate, estimateFixedRate]);

    useEffect(() => {
        const interval = setInterval(() => {
            estimateAmount();
        }, 1000); // 600 ms interval for updating the estimation

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [estimateAmount]);

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
        estimateAmount();
    };

    const handleRateTypeChange = async (e) => {
        const newRateType = e.target.value;
        setRateType(newRateType);
        setEstimatedAmount('');
        setError(''); // Clear any previous error
        setIsEstimationSuccessful(false);

        if (amount && sendCurrency && receiveCurrency) {
            estimateAmount();
        }
    };

    const handleSwapClick = () => {
        if (!amount || !recipientAddress || !isAddressValid || !isEstimationSuccessful) {
            alert('Please fill in all fields with valid data and ensure estimation is successful.');
            return;
        }

        onSwap(amount, recipientAddress, rateType);
    };

    const RateTypeOptionBar = ({ rateType, onChange }) => (
        <div className={styles.rateTypeOptionBar}>
            <label className={rateType === 'floating' ? styles.active : ''}>
                <input
                    type="radio"
                    value="floating"
                    checked={rateType === 'floating'}
                    onChange={onChange}
                    hidden
                />
                Floating Rate
            </label>
            <label className={rateType === 'fixed' ? styles.active : ''}>
                <input
                    type="radio"
                    value="fixed"
                    checked={rateType === 'fixed'}
                    onChange={onChange}
                    hidden
                />
                Fixed Rate
            </label>
        </div>
    );

    useEffect(() => {
        // Trigger the fade-in effect by setting the visibility state to true
        setIsVisible(true);
    }, []);

    return (
        <div className={`${styles.swapInterface} ${isVisible ? styles.fadeIn : styles.fadeOut}`}>
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
                <RateTypeOptionBar rateType={rateType} onChange={handleRateTypeChange} />
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
