import { useState, useCallback, useEffect } from 'react';
import useChangelly from '../../hooks/useChangelly';
import { FaQuestionCircle } from 'react-icons/fa'; // Import the question mark icon
import styles from '../../styles/Home.module.css';

export default function SwapInterface({ sendCurrency, receiveCurrency, onSwap }) {
    const [amount, setAmount] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [refundAddress, setRefundAddress] = useState('');
    const [rateType, setRateType] = useState('floating');
    const [estimatedAmount, setEstimatedAmount] = useState('');
    const [error, setError] = useState(''); // For estimation errors only
    const [recipientValidationError, setRecipientValidationError] = useState(''); // For recipient address validation errors
    const [refundValidationError, setRefundValidationError] = useState(''); // For refund address validation errors
    const [isAddressValid, setIsAddressValid] = useState(true);
    const [isRefundAddressValid, setIsRefundAddressValid] = useState(true);
    const [isEstimationSuccessful, setIsEstimationSuccessful] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const { estimateFloatingRate, estimateFixedRate, validateAddress } = useChangelly();

    const validateRecipientAddress = useCallback(
        async (address) => {
            if (address && receiveCurrency) {
                try {
                    const validationResult = await validateAddress(receiveCurrency, address);
                    if (validationResult.result) {
                        setIsAddressValid(true);
                        setRecipientValidationError(''); // Clear validation error if the address is valid
                    } else {
                        setIsAddressValid(false);
                        setRecipientValidationError(validationResult.message || 'Invalid address');
                    }
                } catch (err) {
                    setIsAddressValid(false);
                    setRecipientValidationError(err.message || 'Failed to validate address');
                }
            }
        },
        [receiveCurrency, validateAddress]
    );

    const validateRefundAddress = useCallback(
        async (address) => {
            if (address && sendCurrency) {
                try {
                    const validationResult = await validateAddress(sendCurrency, address);
                    if (validationResult.result) {
                        setIsRefundAddressValid(true);
                        setRefundValidationError(''); // Clear validation error if the refund address is valid
                    } else {
                        setIsRefundAddressValid(false);
                        setRefundValidationError(validationResult.message || 'Invalid refund address');
                    }
                } catch (err) {
                    setIsRefundAddressValid(false);
                    setRefundValidationError(err.message || 'Failed to validate refund address');
                }
            }
        },
        [sendCurrency, validateAddress]
    );

    const handleAddressChange = (e) => {
        const address = e.target.value;
        setRecipientAddress(address);
        validateRecipientAddress(address);
    };

    const handleRefundAddressChange = (e) => {
        const address = e.target.value;
        setRefundAddress(address);
        validateRefundAddress(address);
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
                setError(''); // Clear estimation error if successful
                setIsEstimationSuccessful(true);
            } catch (err) {
                console.error('Error during estimation:', err.message || err);
                setError(err.message); // Set error for estimation issues
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


    const handleSwapClick = () => {
        if (!amount || !recipientAddress || !isAddressValid || !isEstimationSuccessful || !isRefundAddressValid) {
            alert('Please fill in all fields with valid data and ensure estimation is successful.');
            return;
        }

        onSwap(amount, recipientAddress, refundAddress, rateType, refundAddress);
    };

    const handleRateTypeChange = async (e) => {
        const newRateType = e.target.value;
        setRateType(newRateType);
        setEstimatedAmount('');
        setError(''); // Clear any previous estimation error
        setIsEstimationSuccessful(false);

        if (amount && sendCurrency && receiveCurrency) {
            estimateAmount();
        }
    };

    const RateTypeOptionBar = ({ rateType, onChange }) => (
        <div className={styles.inputGroup}>
            <div className={styles.inputWithTooltip}>
                <FaQuestionCircle className={styles.tooltipIcon} />
                <div className={`${styles.tooltip} ${styles.rateTypeTooltip}`}>
                    Floating rates might change any other second. As a result, you might receive more or less than you thought you would.<br /><br />
                    A fixed exchange rate is a rate that totally matches the amount displayed to the user at the beginning of the exchange, independently from the further rate volatility.
                </div>
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
            </div>
        </div>
    );

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className={`${styles.swapInterface} ${isVisible ? styles.fadeIn : styles.fadeOut}`}>
            <h2 className={styles.prompt}>Swap {sendCurrency.toUpperCase()} for {receiveCurrency.toUpperCase()}</h2>

            <div className={styles.inputGroup}>
                {/* Amount input with tooltip */}
                <div className={styles.inputWithTooltip}>
                    <FaQuestionCircle className={styles.tooltipIcon} />
                    <div className={styles.tooltip}>
                        Enter the amount of {sendCurrency.toUpperCase()} you want to exchange for {receiveCurrency.toUpperCase()}
                    </div>
                    <input
                        type="number"
                        placeholder={`Enter amount of ${sendCurrency.toUpperCase()} you want to send`}
                        value={amount}
                        onChange={handleAmountChange}
                        className={styles.inputField}
                    />
                </div>
            </div>
            <div className={styles.inputGroup}>
                {/* Recipient address input with tooltip */}
                <div className={styles.inputWithTooltip}>
                    <FaQuestionCircle className={styles.tooltipIcon} />
                    <div className={styles.tooltip}>
                        Enter your {receiveCurrency.toUpperCase()} address to receive funds on
                    </div>
                    <input
                        type="text"
                        placeholder={`Enter your ${receiveCurrency.toUpperCase()} address`}
                        value={recipientAddress}
                        onChange={handleAddressChange}
                        className={`${styles.inputField} ${!isAddressValid ? styles.invalid : ''}`}
                    />
                    {!isAddressValid && <div className={styles.error}>{recipientValidationError}</div>}
                </div>
            </div>
            <div className={styles.inputGroup}>
                {/* Refund address input with tooltip */}
                <div className={styles.inputWithTooltip}>
                    <FaQuestionCircle className={styles.tooltipIcon} />
                    <div className={styles.tooltip}>
                        Enter your {sendCurrency.toUpperCase()} address, in case of transaction failure funds will be refunded here
                    </div>
                    <input
                        type="text"
                        placeholder={`Enter your ${sendCurrency.toUpperCase()} REFUND address`}
                        value={refundAddress}
                        onChange={handleRefundAddressChange}
                        className={`${styles.inputField} ${!isRefundAddressValid ? styles.invalid : ''}`}
                    />
                    {!isRefundAddressValid && <div className={styles.error}>{refundValidationError}</div>}
                </div>
            </div>

            {/* Rate type option bar with tooltip */}
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
                disabled={!isAddressValid || !amount || !recipientAddress || !isEstimationSuccessful || !isRefundAddressValid}
            >
                Swap Now
            </button>
        </div>
    );
}