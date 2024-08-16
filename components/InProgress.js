import React, { useState, useEffect } from 'react';
import styles from '../styles/InProgress.module.css';
import { FaExternalLinkAlt } from 'react-icons/fa';

export default function InProgress({ onClose, onSelectTransaction }) {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const storedTransactions = localStorage.getItem('transactions');
        if (storedTransactions) {
            const parsedTransactions = JSON.parse(storedTransactions);
            // Sort transactions by createdAt in descending order (most recent first)
            const sortedTransactions = parsedTransactions.sort((a, b) => b.createdAt - a.createdAt);
            setTransactions(sortedTransactions);
        }
    }, []);

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h2>Transactions</h2>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
                <div className={styles.transactionList}>
                    {transactions.map((tx) => (
                        <div key={tx.id} className={styles.transactionItem}>
                            <div className={styles.transactionInfo} onClick={() => onSelectTransaction(tx)}>
                                <p><strong>{tx.currencyFrom.toUpperCase()} to {tx.currencyTo.toUpperCase()}</strong></p>
                                <p>Amount: {tx.amountExpectedFrom} {tx.currencyFrom.toUpperCase()}</p>
                                <p>Status: {tx.status}</p>
                                <p>Created: {new Date(tx.createdAt / 1000).toLocaleString()}</p>
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
                    ))}
                </div>
            </div>
        </div>
    );
}