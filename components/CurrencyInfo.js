import React from 'react';
import styles from '../../styles/Home.module.css';

export default function CurrencyInfo({ currencyData }) {
    if (!currencyData) return null;

    return (
        <div className={styles.currencyInfo}>
            <h3>{currencyData.fullName} ({currencyData.ticker.toUpperCase()})</h3>
            <img src={currencyData.image} alt={currencyData.name} className={styles.currencyIcon} />
            <p>Blockchain: {currencyData.blockchain}</p>
        </div>
    );
}