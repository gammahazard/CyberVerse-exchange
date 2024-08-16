import { useState, useEffect } from 'react';
import CurrencyButton from './CurrencyButton';
import useChangelly from '../../hooks/useChangelly';
import styles from '../../styles/Home.module.css';

const priorityCurrencies = ['btc', 'eth', 'sol', 'ton', 'erg', 'ltc', 'cro', 'usdt', 'usdc'];

function sortCurrencies(currencies) {
  const priorityMap = Object.fromEntries(priorityCurrencies.map((c, i) => [c, i]));
  
  return currencies.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    
    const aIndex = aLower in priorityMap ? priorityMap[aLower] : Infinity;
    const bIndex = bLower in priorityMap ? priorityMap[bLower] : Infinity;
    
    if (aIndex !== bIndex) return aIndex - bIndex;
    
    if (aLower.includes('usdt') && bLower.includes('usdt')) return aLower.localeCompare(bLower);
    if (aLower.includes('usdt')) return -1;
    if (bLower.includes('usdt')) return 1;
    
    if (aLower.includes('usdc') && bLower.includes('usdc')) return aLower.localeCompare(bLower);
    if (aLower.includes('usdc')) return -1;
    if (bLower.includes('usdc')) return 1;
    
    return aLower.localeCompare(bLower);
  });
}

export default function CurrencyList({ onSelect, prompt, excludeCurrency }) {
  const [currencies, setCurrencies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getCurrencies } = useChangelly();

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await getCurrencies();
        console.log('API Response:', response); // Log the full response for debugging
        if (response && Array.isArray(response)) {
          const sortedCurrencies = sortCurrencies(response);
          setCurrencies(sortedCurrencies);
        } else {
          throw new Error('Invalid response format');
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching currencies:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  const filteredCurrencies = currencies.filter(currency =>
    currency.toLowerCase().includes(searchTerm.toLowerCase()) &&
    currency.toLowerCase() !== excludeCurrency?.toLowerCase()
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
        className={styles.searchInput}
      />
      <div className={styles.currencyGrid}>
        {filteredCurrencies.map((currency) => (
          <CurrencyButton key={currency} currency={currency} onClick={() => onSelect(currency)} />
        ))}
      </div>
    </div>
  );
}