import { useState, useMemo } from 'react';
import CurrencyButton from './CurrencyButton';
import styles from '../../styles/Home.module.css';

const priorityCurrencies = ['btc', 'eth', 'sol', 'ton', 'erg', 'ltc', 'cro', 'usdt', 'usdc'];

export default function FilteredCurrencyList({ onSelect, prompt, availablePairs }) {
  const [searchTerm, setSearchTerm] = useState('');

  console.log('Available currencies in FilteredCurrencyList:', availablePairs);

  const sortedCurrencies = useMemo(() => {
    return availablePairs.sort((a, b) => {
      const aIndex = priorityCurrencies.indexOf(a.toLowerCase());
      const bIndex = priorityCurrencies.indexOf(b.toLowerCase());

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [availablePairs]);

  console.log('Sorted currencies:', sortedCurrencies);

  const filteredCurrencies = sortedCurrencies.filter(currency =>
    currency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('Number of currencies in Step 2:', filteredCurrencies.length);

  return (
    <div className={styles.currencyList}>
      <h2 className={styles.prompt}>{prompt}</h2>
      <input
        type="text"
        placeholder="Search currencies..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />
      <div className={styles.currencyGrid}>
        {availablePairs.length === 0 ? (
          <div className={styles.loadingMessage}>Loading available pairs...</div>
        ) : (
          filteredCurrencies.map((currency) => (
            <CurrencyButton
              key={currency}
              currency={currency}
              onClick={() => onSelect(currency)}
              isPriority={priorityCurrencies.includes(currency.toLowerCase())}
            />
          ))
        )}
      </div>
    </div>
  );
}