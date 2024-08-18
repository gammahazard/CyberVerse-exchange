import { useState, useEffect, useMemo } from 'react';
import CurrencyButton from './CurrencyButton';
import useChangelly from '../../hooks/useChangelly';
import styles from '../../styles/Home.module.css';

const priorityCurrencies = ['btc', 'eth', 'sol', 'ton', 'erg', 'ltc', 'cro', 'usdt', 'usdc', 'ada', 'etharb'];

export default function CurrencyList({ onSelect, prompt }) {
  const [currencies, setCurrencies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getCurrenciesFull } = useChangelly();

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        if (currencies.length === 0) {
          const fetchedCurrencies = await getCurrenciesFull();
          console.log('Fetched currencies:', fetchedCurrencies);
          setCurrencies(fetchedCurrencies);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching currencies:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchCurrencies();
  }, []); // Empty dependency array ensures this runs only once

  const sortedCurrencies = useMemo(() => {
    return currencies.sort((a, b) => {
      const aIndex = priorityCurrencies.indexOf(a.ticker.toLowerCase());
      const bIndex = priorityCurrencies.indexOf(b.ticker.toLowerCase());

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.ticker.localeCompare(b.ticker);
    });
  }, [currencies]);

  const filteredCurrencies = sortedCurrencies.filter(currency =>
    currency.ticker.toLowerCase().includes(searchTerm.toLowerCase())
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
            key={currency.ticker} 
            currency={currency.ticker} 
            onClick={() => onSelect(currency.ticker)}
            currencyInfo={currency} // Pass the full currency info
          />
        ))}
      </div>
    </div>
  );
}