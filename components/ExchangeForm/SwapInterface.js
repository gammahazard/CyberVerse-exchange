import { useState, useCallback, useEffect, useMemo } from 'react';
import useChangelly from '../../hooks/useChangelly';
import { FaQuestionCircle, FaArrowRight } from 'react-icons/fa';
import styles from '../../styles/Home.module.css';
import DetailedCurrencyInfo from './DetailedCurrencyInfo';

export default function SwapInterface({ sendCurrency, receiveCurrency, onSwap, connectedWalletAddress, onSent }) { // Add onSent prop here
    const [amount, setAmount] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [refundAddress, setRefundAddress] = useState('');
    const [rateType, setRateType] = useState('floating');
    const [estimatedAmount, setEstimatedAmount] = useState('');
    const [error, setError] = useState('');
    const [recipientValidationError, setRecipientValidationError] = useState('');
    const [refundValidationError, setRefundValidationError] = useState('');
    const [isAddressValid, setIsAddressValid] = useState(true);
    const [isRefundAddressValid, setIsRefundAddressValid] = useState(true);
    const [isEstimationSuccessful, setIsEstimationSuccessful] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [rateId, setRateId] = useState(null);
    const [isInputChanged, setIsInputChanged] = useState(false);
    const [isRateChanging, setIsRateChanging] = useState(false);
    const [isSwapButtonDisabled, setIsSwapButtonDisabled] = useState(false);
    const [networkFee, setNetworkFee] = useState('0');
    const [exchangeFee, setExchangeFee] = useState('0');
    const [totalAmount, setTotalAmount] = useState('0');
    const [currenciesData, setCurrenciesData] = useState([]);
    const { 
        estimateFloatingRate, 
        estimateFixedRate, 
        validateAddress, 
        parseErrorMessage,
        getCurrenciesFull
    } = useChangelly();
    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const fetchedCurrencies = await getCurrenciesFull();
                console.log('Fetched currencies:', fetchedCurrencies);
                setCurrenciesData(fetchedCurrencies);
            } catch (err) {
                console.error('Error fetching currencies:', err);
            }
        };

        fetchCurrencies(); // Fetch all currencies once on mount
    }, []);

    const sendCurrencyData = useMemo(() => {
        return currenciesData.find(c => c.ticker.toLowerCase() === sendCurrency.toLowerCase());
    }, [currenciesData, sendCurrency]);

    const receiveCurrencyData = useMemo(() => {
    
        return currenciesData.find(c => c.ticker.toLowerCase() === receiveCurrency.toLowerCase());
      
    }, [currenciesData, receiveCurrency]);
    console.log('receive', receiveCurrencyData)
    console.log('send', sendCurrencyData)
    const validateRecipientAddress = useCallback(
        async (address) => {
            if (address && receiveCurrency) {
                try {
                    const validationResult = await validateAddress(receiveCurrency, address);
                    setIsAddressValid(validationResult.result);
                    setRecipientValidationError(validationResult.message || '');
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
                    setIsRefundAddressValid(validationResult.result);
                    setRefundValidationError(validationResult.message || '');
                } catch (err) {
                    setIsRefundAddressValid(false);
                    setRefundValidationError(err.message || 'Failed to validate refund address');
                }
            } else {
                // If the address is empty, set it as invalid
                setIsRefundAddressValid(false);
                setRefundValidationError('Refund address is required');
            }
        },
        [validateAddress]
    );

 

    useEffect(() => {
        if (connectedWalletAddress && (
            sendCurrency.toLowerCase() === 'eth' || 
            sendCurrency.toLowerCase() === 'arb' || 
            sendCurrency.toLowerCase() === 'sol' ||
            sendCurrency.toLowerCase() === 'erg'  // Add ERG here
        )) {
            setRefundAddress(connectedWalletAddress);
            validateRefundAddress(connectedWalletAddress);
        }
    }, [sendCurrency, connectedWalletAddress, validateRefundAddress]);


    const estimateAmount = useCallback(async () => {
        if (sendCurrency && receiveCurrency && amount) {
            try {
                let estimation;
                if (rateType === 'floating') {
                    estimation = await estimateFloatingRate(sendCurrency, receiveCurrency, amount);
                    setNetworkFee(estimation.networkFee);
                    const totalEstimated = parseFloat(estimation.visibleAmount || estimation.amountTo);
                    const exchangeFeeAmount = totalEstimated * 0.009; // 0.9% exchange fee
                    setExchangeFee(exchangeFeeAmount.toFixed(8));
                    const amountAfterFees = totalEstimated - parseFloat(estimation.networkFee) - exchangeFeeAmount;
                    setEstimatedAmount(amountAfterFees.toFixed(8));
                    setTotalAmount(totalEstimated.toFixed(8));
                    setRateId(null);
                } else {
                    estimation = await estimateFixedRate(sendCurrency, receiveCurrency, amount);
                    setNetworkFee(estimation.networkFee);
                    const totalEstimated = parseFloat(estimation.amountTo);
                    const exchangeFeeAmount = totalEstimated * 0.0075; // 0.9% exchange fee
                    setExchangeFee(exchangeFeeAmount.toFixed(8));
                    const amountAfterFees = totalEstimated - parseFloat(estimation.networkFee) - exchangeFeeAmount;
                    setEstimatedAmount(amountAfterFees.toFixed(8));
                    setTotalAmount(totalEstimated.toFixed(8));
                    setRateId(estimation.rateId);
                    if (parseFloat(amount) < parseFloat(estimation.min) || parseFloat(amount) > parseFloat(estimation.max)) {
                        throw new Error(`Amount must be between ${estimation.min} and ${estimation.max} ${sendCurrency.toUpperCase()}`);
                    }
                }
                setError('');
                setIsEstimationSuccessful(true);
            } catch (err) {
                console.error('Error during estimation:', err.message || err);
                setError(parseErrorMessage(err.message));
                setEstimatedAmount('');
                setIsEstimationSuccessful(false);
                setRateId(null);
                setNetworkFee('0');
                setExchangeFee('0');
                setTotalAmount('0');
            }
        } else {
            setEstimatedAmount('');
            setError('');
            setIsEstimationSuccessful(false);
            setRateId(null);
            setNetworkFee('0');
            setExchangeFee('0');
            setTotalAmount('0');
        }
    }, [sendCurrency, receiveCurrency, amount, rateType, estimateFloatingRate, estimateFixedRate, parseErrorMessage]);

 
    const handleSwapClick = async () => {
        if (!amount || !recipientAddress || !isAddressValid || !isEstimationSuccessful || !isRefundAddressValid) {
            alert('Please fill in all fields with valid data and ensure estimation is successful.');
            return;
        }

        console.log('Starting swap process with:', { 
            sendCurrency, 
            receiveCurrency, 
            amount, 
            recipientAddress, 
            refundAddress, 
            rateType,
            rateId
        });

        try {
            const swapParams = {
                from: sendCurrency,
                to: receiveCurrency,
                amount,
                address: recipientAddress,
                refundAddress,
                rateType,
                ...(rateType === 'fixed' && { rateId })
            };

            await onSwap(swapParams);
            if (onSent) onSent();
        } catch (error) {
            console.error('Error in onSwap:', error);
            setError(`Swap failed: ${error.message || 'Unknown error'}`);
        }
};
const handleAmountChange = (e) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    setIsEstimationSuccessful(false);
    
    // Disable the swap button for 2.5 seconds
    setIsSwapButtonDisabled(true);
    setTimeout(() => {
        setIsSwapButtonDisabled(false);
    }, 2500);

    if (newAmount) {
        estimateAmount();
    }
};


useEffect(() => {
    const interval = setInterval(() => {
        if (amount) {
            estimateAmount();
        }
    }, 1000); // 1-second interval for updating the estimation

    return () => clearInterval(interval); // Cleanup interval on component unmount
}, [amount, estimateAmount]);
const handleAddressChange = (e) => {
    const address = e.target.value;
    setRecipientAddress(address);
    setIsEstimationSuccessful(false);
    validateRecipientAddress(address);
};

const handleRefundAddressChange = (e) => {
    const address = e.target.value;
    setRefundAddress(address);
    setIsEstimationSuccessful(false);
    validateRefundAddress(address);
};

const handleRateTypeChange = (e) => {
    const newRateType = e.target.value;
    setRateType(newRateType);
    setEstimatedAmount(''); // Clear the estimated amount immediately
    setError('');
    setIsEstimationSuccessful(false);
    setRateId(null); // Clear the rateId when switching
    setIsRateChanging(true); // Set rate changing flag

    // Trigger a new estimation if we have all necessary data
    if (amount && sendCurrency && receiveCurrency) {
        estimateAmount();
    }

    // Disable the swap button for 1.25 seconds
    setTimeout(() => {
        setIsRateChanging(false);
    }, 3200);
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

            <div className={styles.inputGroup}>
                <RateTypeOptionBar rateType={rateType} onChange={handleRateTypeChange} />
            </div>
            {estimatedAmount && (
                <div className={styles.feeBreakdownContainer}>
                    <div className={styles.feeBreakdownTitle}>Transaction Details</div>
                    <div className={styles.feeItem}>
                        <span className={styles.feeLabel}>Total Amount (You are sending):</span>
                        <span className={styles.feeValue}>{amount} {sendCurrency.toUpperCase()}</span>
                    </div>
                    <div className={styles.feeItem}>
                        <span className={styles.feeLabel}>Total Amount (You are receiving before fees):</span>
                        <span className={styles.feeValue}>{totalAmount} {receiveCurrency.toUpperCase()}</span>
                    </div>
                    <div className={styles.feeItem}>
                        <span className={styles.feeLabel}>Network Fee:</span>
                        <span className={styles.feeValue}>{networkFee} {receiveCurrency.toUpperCase()}</span>
                    </div>
                    <div className={styles.feeItem}>
                        <span className={styles.feeLabel}>Exchange Fee (0.9%):</span>
                        <span className={styles.feeValue}>{exchangeFee} {receiveCurrency.toUpperCase()}</span>
                    </div>
                    <div className={`${styles.feeItem} ${styles.totalFee}`}>
                        <span className={styles.feeLabel}>Estimated Amount (You will receive after fees):</span>
                        <span className={styles.feeValue}>{estimatedAmount} {receiveCurrency.toUpperCase()}</span>
                    </div>
                </div>
            )}
            {error && <div className={styles.error}>{error}</div>}

<div className={styles.detailedCurrencyInfoContainer}>
    {sendCurrencyData && (
        <DetailedCurrencyInfo 
            currencyData={sendCurrencyData} 
            isSending={true} 
            amount={amount}
        />
    )}
    <FaArrowRight className={styles.arrowIcon} />
    {receiveCurrencyData && (
        <DetailedCurrencyInfo 
            currencyData={receiveCurrencyData} 
            isSending={false} 
            amount={estimatedAmount}
        />
    )}
</div>
<button
    onClick={handleSwapClick}
    className={styles.swapButton}
    disabled={
        !isAddressValid ||
        !amount ||
        !recipientAddress ||
        !isEstimationSuccessful ||
        !isRefundAddressValid || 
        isRateChanging ||
        isSwapButtonDisabled // Disable the button based on this state
    }
>
    Exchange Now
</button>
        </div>
    );
}