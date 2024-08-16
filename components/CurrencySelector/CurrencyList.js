import { useState, useEffect } from 'react';
import CurrencyButton from './CurrencyButton';
import styles from '../../styles/Home.module.css';
import useChangelly from '../../hooks/useChangelly'; // Adjust the path as necessary

export default function CurrencyList({ onSelect, prompt }) {
  const [currencies, setCurrencies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getCurrencies } = useChangelly(); // Use the hook

  useEffect(() => {
    const fetchCurrencies = async () => {
      if (currencies.length > 0) return; // Prevent fetching if data is already present
      try {
        console.log('Fetching currencies...');
        const fetchedCurrencies = await getCurrencies(); // Use the hook's function to fetch currencies
        console.log('Fetched currencies:', fetchedCurrencies);
        setCurrencies(fetchedCurrencies);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching currencies:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchCurrencies();
  }, []); // Empty dependency array ensures this runs only once on mount

  const filteredCurrencies = currencies.filter(currency =>
    currency.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        className={`${styles.inputField} ${styles.searchInput}`}  // Make sure both classes are applied
      />
      <div className={styles.currencyGrid}>
        {filteredCurrencies.map((currency) => (
          <CurrencyButton key={currency} currency={currency} onClick={() => onSelect(currency)} />
        ))}
      </div>
    </div>
  );
}
