import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaSpinner, FaExchangeAlt, FaPaperPlane, FaCheckCircle, FaTimesCircle, FaUndoAlt, FaExclamationTriangle, FaClock, FaArrowLeft } from 'react-icons/fa';
import { RiPoliceLineFill } from 'react-icons/ri';
import useChangelly from '../../hooks/useChangelly';
import styles from '../../styles/StatusDisplay.module.css';

export default function StatusDisplay({ transactionId, initialStatus, initialDetails, onNewTransaction }) {
    const [txInfo, setTxInfo] = useState(initialDetails || {});
    const [status, setStatus] = useState(initialStatus || 'waiting');
    const [error, setError] = useState('');
    const { getStatus } = useChangelly();
    const lastUpdateTime = useRef(0);

    const fetchStatus = useCallback(async () => {
        const now = Date.now();
        if (now - lastUpdateTime.current < 5000) {
            console.log('Skipping status update due to rate limit');
            return;
        }

        try {
            console.log('Fetching status for transaction:', transactionId);
            const result = await getStatus(transactionId);
            console.log('Received status:', result);
            setStatus(result.status || 'waiting');
            setTxInfo(prevInfo => ({ ...prevInfo, ...result }));
            setError('');
            lastUpdateTime.current = now;
        } catch (err) {
            console.error('Error fetching status:', err);
            setError('Failed to fetch status: ' + err.message);
        }
    }, [transactionId, getStatus]);

    useEffect(() => {
        fetchStatus(); // Initial fetch

        const timer = setInterval(() => {
            fetchStatus();
        }, 5000);

        return () => clearInterval(timer);
    }, [fetchStatus]);

    const renderStatusMessage = () => {
        const iconSize = 24;
        switch (status) {
            case 'new':
            case 'waiting':
                return (
                    <div className={styles.statusMessage}>
                        <FaSpinner className={styles.spinIcon} size={iconSize} />
                        <p>Waiting to receive {txInfo.currencyFrom?.toUpperCase()} to {txInfo.payinAddress}</p>
                    </div>
                );
            case 'confirming':
                return (
                    <div className={styles.statusMessage}>
                        <FaExchangeAlt size={iconSize} />
                        <p>Payment Received! We are waiting for confirmations!</p>
                    </div>
                );
            case 'exchanging':
                return (
                    <div className={styles.statusMessage}>
                        <FaExchangeAlt size={iconSize} />
                        <p>Payment confirmed! Your coins are being exchanged</p>
                    </div>
                );
            case 'sending':
                return (
                    <div className={styles.statusMessage}>
                        <FaPaperPlane size={iconSize} />
                        <p>Coins are being sent to the recipient's address. Your funds will arrive shortly!</p>
                    </div>
                );
            case 'finished':
                return (
                    <div className={styles.statusMessage}>
                        <FaCheckCircle size={iconSize} color="green" />
                        <p>Coins were successfully sent to the recipient address!</p>
                    </div>
                );
            case 'failed':
                return (
                    <div className={styles.statusMessage}>
                        <FaTimesCircle size={iconSize} color="red" />
                        <p>Transaction failed. Please submit a ticket at <a href="https://support.changelly.com/en/support/tickets/new" target="_blank" rel="noopener noreferrer">Changelly Support</a></p>
                    </div>
                );
            case 'refunded':
                return (
                    <div className={styles.statusMessage}>
                        <FaUndoAlt size={iconSize} />
                        <p>Exchange failed, tokens refunded to sending address</p>
                    </div>
                );
            case 'hold':
                return (
                    <div className={`${styles.statusMessage} ${styles.holdStatus}`}>
                        <RiPoliceLineFill size={iconSize} />
                        <p>Due to KYC/AML procedures, your exchange may be delayed. Please make a ticket at <a href="https://support.changelly.com/en/support/tickets/new" target="_blank" rel="noopener noreferrer">Changelly Support</a></p>
                    </div>
                );
            case 'overdue':
            case 'expired':
                return (
                    <div className={styles.statusMessage}>
                        <FaClock size={iconSize} />
                        <p>Payment not sent within indicated timeframe</p>
                    </div>
                );
            default:
                return null;
        }
    };

    const isFinalState = ['refunded', 'expired', 'failed', 'finished', 'waiting'].includes(status);

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.statusDisplay}>
            <h2>Transaction Status</h2>
            <div className={styles.transactionInfo}>
                <table className={styles.transactionTable}>
                    <tbody>
                        <tr>
                            <td>You are sending:</td>
                            <td>{txInfo.amountExpectedFrom} {txInfo.currencyFrom?.toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td>To receive:</td>
                            <td>{txInfo.amountExpectedTo} {txInfo.currencyTo?.toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td>Payout Address:</td>
                            <td>{txInfo.payoutAddress}</td>
                        </tr>
                        <tr>
                            <td>Payin Address:</td>
                            <td>{txInfo.payinAddress}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className={styles.statusInfo}>
                <h3>Current Status</h3>
                {renderStatusMessage()}
            </div>
            {isFinalState && (
                <button onClick={onNewTransaction} className={styles.newTransactionButton}>
                    <FaArrowLeft /> Start New Transaction
                </button>
            )}
        </div>
    );
}