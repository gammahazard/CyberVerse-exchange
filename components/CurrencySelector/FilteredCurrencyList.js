import { useState, useEffect, useMemo, useRef } from 'react';
import CurrencyButton from './CurrencyButton';
import useChangelly from '../../hooks/useChangelly';
import styles from '../../styles/Home.module.css';
import { FaSpinner } from 'react-icons/fa';
import EthereumWalletModal from '../../wallets/ethereum/EthereumWalletModal';
import SolanaWalletModal from '../../wallets/solana/SolanaWalletModal';

const priorityCurrencies = ['btc', 'eth', 'arb', 'sol', 'ton', 'erg', 'ltc', 'cro', 'usdt', 'usdc'];

export default function FilteredCurrencyList({ onSelect, prompt, availablePairs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [fullCurrencyList, setFullCurrencyList] = useState([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getCurrenciesFull } = useChangelly();
  const fetchedOnce = useRef(false);
  const [showSolanaModal, setShowSolanaModal] = useState(false);

  useEffect(() => {
    const fetchFullCurrencyList = async () => {
      try {
        if (!fetchedOnce.current) {
          const fetchedCurrencies = await getCurrenciesFull();
          setFullCurrencyList(fetchedCurrencies);
          fetchedOnce.current = true;
        }
      } catch (err) {
        console.error('Error fetching full currency list:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullCurrencyList();
  }, [getCurrenciesFull]);

  useEffect(() => {
    if (fullCurrencyList.length > 0) {
      const matchedCurrencies = fullCurrencyList.filter(currency =>
        availablePairs.includes(currency.ticker.toLowerCase())
      );
      setFilteredCurrencies(matchedCurrencies);
    }
  }, [fullCurrencyList, availablePairs]);

  const sortedCurrencies = useMemo(() => {
    return filteredCurrencies.sort((a, b) => {
      const aIndex = priorityCurrencies.indexOf(a.ticker.toLowerCase());
      const bIndex = priorityCurrencies.indexOf(b.ticker.toLowerCase());

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.ticker.localeCompare(b.ticker);
    });
  }, [filteredCurrencies]);

  const displayedCurrencies = sortedCurrencies.filter(currency =>
    currency.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCurrencyClick = (currency) => {
    if (currency.toLowerCase() === 'eth' || currency.toLowerCase() === 'arb') {
      setSelectedCurrency(currency);
      setShowWalletModal(true);
    } else if (currency.toLowerCase() === 'sol') {
      setSelectedCurrency(currency);
      setShowSolanaModal(true);
    } else {
      onSelect(currency);
    }
  };

  const handleSolanaWalletConnected = (address) => {
    setShowSolanaModal(false);
    onSelect(selectedCurrency, address);
  };

  const handleWalletConnected = (address) => {
    setShowWalletModal(false);
    onSelect(selectedCurrency, address);
  };

  const handleContinueWithoutWallet = () => {
    setShowWalletModal(false);
    onSelect(selectedCurrency);
  };

  if (isLoading) return <div>Loading currencies...</div>;

  return (
    <>
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
          {filteredCurrencies.length === 0 ? (
            <div className={styles.loadingMessage}>No currencies available</div>
          ) : (
            displayedCurrencies.map((currency) => (
              <CurrencyButton
                key={currency.ticker}
                currency={currency.ticker}
                onClick={() => handleCurrencyClick(currency.ticker)}
                currencyInfo={currency}
                isPriority={priorityCurrencies.includes(currency.ticker.toLowerCase())}
              />
            ))
          )}
        </div>
      </div>
      {showWalletModal && (
        <EthereumWalletModal
          onClose={() => setShowWalletModal(false)}
          onWalletConnected={handleWalletConnected}
          onContinueWithoutWallet={handleContinueWithoutWallet}
          network={selectedCurrency.toLowerCase() === 'arb' ? 'arbitrum' : 'ethereum'}
        />
      )}
        {showSolanaModal && (
        <SolanaWalletModal
          onClose={() => setShowSolanaModal(false)}
          onWalletConnected={handleSolanaWalletConnected}
          onContinueWithoutWallet={handleContinueWithoutWallet}
          network="mainnet"
        />
      )}
    </>
    
  );
}
