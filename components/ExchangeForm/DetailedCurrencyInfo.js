import React from 'react';
import styles from '../../styles/DetailedCurrencyInfo.module.css';

export default function DetailedCurrencyInfo({ currencyData, isSending, amount }) {
    if (!currencyData) return null;

    console.log('DetailedCurrencyInfo filtered currencyData:', currencyData);
    console.log('DetailedCurrencyInfo isSending:', isSending ? 'Sending Currency' : 'Receiving Currency');
    console.log('DetailedCurrencyInfo amount:', amount);

    return (
        <div className={styles.detailedCurrencyInfo}>
            <div className={styles.currencySection}>
                <h3>{isSending ? 'YOU ARE SENDING' : 'YOU WILL RECEIVE'}</h3>
                <div className={styles.currencyHeader}>
                    <span className={styles.currencyTicker}>{currencyData.ticker.toUpperCase()}</span>
                    <span className={styles.currencyFullName}>({currencyData.fullName})</span>
                </div>
                <p>on {currencyData.blockchain.toUpperCase()} ({currencyData.protocol})</p>
            </div>

            <div className={styles.amountSection}>
                {amount && (
                    <p className={styles.amount}>
                       {parseFloat(amount).toFixed(4)} {currencyData.ticker.toUpperCase()}
                    </p>
                )}
            </div>

            {currencyData.contractAddress && (
                <div className={styles.contractSection}>
                    <p>Contract Address:</p>
                    <p className={styles.contractAddress}>{currencyData.contractAddress}</p>
                </div>
            )}

            <div className={styles.imageSection}>
                <img src={currencyData.image} alt={currencyData.fullName} className={styles.currencyImage} />
            </div>

            <div className={`${styles.confirmationsSection} ${!isSending ? styles.visible : ''}`}>
                {!isSending && (
                    <p>
                        You will get {parseFloat(amount).toFixed(4)} {currencyData.fullName} after {currencyData.payinConfirmations} confirmations
                    </p>
                )}
            </div>
        </div>
    );
}