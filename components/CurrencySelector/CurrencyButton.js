import styles from '../../styles/Home.module.css';

export default function CurrencyButton({ currency, onClick }) {
  return (
    <button className={styles.currencyButton} onClick={onClick}>
      {currency}
    </button>
  );
}