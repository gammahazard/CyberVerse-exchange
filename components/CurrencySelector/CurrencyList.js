import { useState, useEffect, useMemo, useRef } from 'react';
import CurrencyButton from './CurrencyButton';
import useChangelly from '../../hooks/useChangelly';
import styles from '../../styles/CurrencyList.module.css';

const priorityCurrencies = ['btc', 'eth', 'sol', 'ton', 'erg', 'ltc', 'cro', 'usdt', 'usdc', 'ada', 'etharb'];

export default function CurrencyList({ onSelect, prompt }) {
  const [currencies, setCurrencies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containerVisible, setContainerVisible] = useState(false);
  const { getCurrenciesFull } = useChangelly();
  const containerRef = useRef(null);

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
  }, []);

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      setTimeout(() => setContainerVisible(true), 100); // Delay to ensure DOM is ready
    }
  }, [isLoading]);

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

  if (isLoading) return <div className={styles.loadingContainer}>Loading currencies...</div>;
  if (error) return <div className={styles.errorContainer}>Error: {error}</div>;

  return (
    <div className={styles.currencyListContainer}>
      <div className={styles.currencyList}>
        <h2 className={styles.prompt}>{prompt}</h2>
        <input
          type="text"
          placeholder="Search currencies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <div 
          ref={containerRef}
          className={`${styles.currencyGrid} ${containerVisible ? styles.visible : ''}`}
        >
          {filteredCurrencies.length > 0 ? (
            filteredCurrencies.map((currency, index) => (
              <div 
                key={currency.ticker}
                className={`${styles.currencyButtonWrapper} ${containerVisible ? styles.visible : ''}`}
                style={{ transitionDelay: `${index * 30}ms` }}
              >
                <CurrencyButton
                  currency={currency.ticker}
                  onClick={() => onSelect(currency.ticker)}
                  currencyInfo={currency}
                />
              </div>
            ))
          ) : (
            <div className={styles.noResults}>No matching currencies found</div>
          )}
        </div>
      </div>
    </div>
  );
}