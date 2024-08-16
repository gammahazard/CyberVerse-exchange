import styles from '../../styles/Home.module.css';

export default function AmountInput({ value, onChange, currency }) {
  return (
    <div className={styles.amountInput}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter amount in ${currency}`}
      />
      <span>{currency}</span>
    </div>
  );
}