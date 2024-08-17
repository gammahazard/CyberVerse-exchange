import React from 'react';
import styles from '../../styles/Home.module.css';

export default function CurrencyButton({ currency, onClick, currencyInfo }) {
    return (
        <div className={styles.currencyButtonContainer}>
            <button className={styles.currencyButton} onClick={onClick}>
                {currencyInfo && (
                    <img 
                        src={currencyInfo.image} 
                        alt={currencyInfo.name} 
                        className={styles.currencyIcon} 
                    />
                )}
            </button>
            {currencyInfo && (
                <div className={styles.currencyTooltip}>
                    <div>{`Name: ${currencyInfo.fullName}`}</div>
                    <div>{`Ticker: ${currencyInfo.ticker.toUpperCase()}`}</div>
                    <div>{`Blockchain: ${currencyInfo.blockchain}`}</div>
                </div>
            )}
        </div>
    );
}
