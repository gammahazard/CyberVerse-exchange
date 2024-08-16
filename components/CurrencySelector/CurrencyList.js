import { useState, useEffect, useMemo } from 'react';
import CurrencyButton from './CurrencyButton';
import useChangelly from '../../hooks/useChangelly';
import styles from '../../styles/Home.module.css';

const priorityCurrencies = ['btc', 'eth', 'sol', 'ton', 'erg', 'ltc', 'cro', 'usdt', 'usdc'];

export default function CurrencyList({ onSelect, prompt }) {
  const [currencies, setCurrencies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getCurrencies } = useChangelly();

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const fetchedCurrencies = await getCurrencies();
        setCurrencies(fetchedCurrencies);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching currencies:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  const sortedCurrencies = useMemo(() => {
    return currencies.sort((a, b) => {
      const aIndex = priorityCurrencies.indexOf(a.toLowerCase());
      const bIndex = priorityCurrencies.indexOf(b.toLowerCase());
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [currencies]);

  const filteredCurrencies = sortedCurrencies.filter(currency =>
    currency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('Number of currencies in Step 1:', filteredCurrencies.length);

  if (isLoading) return <div>Loading currencies...</div>;
  if (error) return <div>Error: {error}</div>;

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
        {filteredCurrencies.map((currency) => (
          <CurrencyButton 
            key={currency} 
            currency={currency} 
            onClick={() => onSelect(currency)}
            isPriority={priorityCurrencies.includes(currency.toLowerCase())}
          />
        ))}
      </div>
    </div>
  );
}