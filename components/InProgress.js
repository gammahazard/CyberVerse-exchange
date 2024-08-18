import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from '../styles/InProgress.module.css';
import { FaExternalLinkAlt, FaSpinner } from 'react-icons/fa';
import useChangelly from '../hooks/useChangelly';

export default function InProgress({ onClose, onSelectTransaction }) {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { getStatus } = useChangelly();
    const intervalRef = useRef(null);
    const isInitialMount = useRef(true);
    const hasLoadedBefore = useRef(false);

    const fetchStatuses = useCallback(async () => {
        if (!hasLoadedBefore.current) {
            setIsLoading(true);
        }
        
        const storedTransactions = localStorage.getItem('transactions');
        if (storedTransactions) {
            const parsedTransactions = JSON.parse(storedTransactions);
            const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
            
            const recentTransactions = parsedTransactions.filter(tx => tx.createdAt >= threeHoursAgo);
            const updatedTransactions = await Promise.all(recentTransactions.map(async (tx) => {
                try {
                    console.log('Fetching status for transaction:', tx.id);
                    const response = await getStatus(tx.id);
                    console.log('Received status for transaction', tx.id, ':', response);
                    return { ...tx, status: response !== 'unknown' ? response : tx.status };
                } catch (err) {
                    console.error('Error fetching status for transaction', tx.id, ':', err);
                    return tx; // Keep the previous status on error
                }
            }));

            setTransactions(updatedTransactions.sort((a, b) => b.createdAt - a.createdAt));
            localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        }
        
        setIsLoading(false);
        hasLoadedBefore.current = true;
    }, [getStatus]);

    useEffect(() => {
        if (isInitialMount.current) {
            console.log('Initial fetch of transaction statuses');
            fetchStatuses();
            isInitialMount.current = false;
        }

        intervalRef.current = setInterval(() => {
            console.log('Fetching transaction statuses (30-second interval)');
            fetchStatuses();
        }, 30000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchStatuses]);

    useEffect(() => {
        // Reset loading state and hasLoadedBefore when component mounts
        setIsLoading(true);
        hasLoadedBefore.current = false;

        // Cleanup function to reset state when component unmounts
        return () => {
            setIsLoading(true);
            hasLoadedBefore.current = false;
        };
    }, []);

    const getStatusClass = (status) => {
        switch (status) {
            case 'waiting':
            case 'confirming':
            case 'exchanging':
            case 'sending':
                return styles.statusYellow;
            case 'finished':
                return styles.statusGreen;
            case 'failed':
            case 'refunded':
            case 'hold':
            case 'overdue':
            case 'expired':
                return styles.statusRed;
            default:
                return '';
        }
    };

    const getStatusDescription = (status) => {
        const descriptions = {
            waiting: "Waiting for incoming payment",
            confirming: "Waiting for confirmations",
            exchanging: "Payment confirmed, exchanging",
            sending: "Sending coins to recipient",
            finished: "Transaction completed successfully",
            failed: "Transaction failed",
            refunded: "Exchange failed, coins refunded",
            hold: "Delayed due to AML/KYC procedure",
            overdue: "Payment not received in time",
            expired: "Transaction expired"
        };
        return descriptions[status] || "Status unavailable";
    };

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h2>Transactions</h2>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
                <div className={styles.transactionList}>
                    {isLoading ? (
                        <div className={styles.loadingContainer}>
                            <FaSpinner className={styles.loadingSpinner} />
                            <p>Loading transaction history...</p>
                        </div>
                    ) : (
                        transactions.map((tx) => (
                            <div key={tx.id} className={styles.transactionItem}>
                           <div className={styles.transactionInfo} onClick={() => onSelectTransaction(tx)}>
    <p><strong>{tx.currencyFrom.toUpperCase()} to {tx.currencyTo.toUpperCase()}</strong></p>
    <p><span>Amount:</span> {tx.amountExpectedFrom} {tx.currencyFrom.toUpperCase()}</p>
    <p><span>Status:</span> <span className={getStatusClass(tx.status)}>{tx.status}</span></p>
    <p>{getStatusDescription(tx.status)}</p>
    <p><span>Created:</span> {new Date(tx.createdAt).toLocaleString()}</p>
</div>
<a 
                                    href={tx.trackUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={styles.trackLink}
                                >
                                    TRACK <FaExternalLinkAlt />
                                </a>
                            </div>
                            
                        ))
                    )}
                </div>
                
            </div>
        </div>
    );
}