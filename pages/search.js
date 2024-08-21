import { useState } from 'react';
import Link from 'next/link';
import useChangelly from '../hooks/useChangelly';
import styles from '../styles/Search.module.css';
import { FaExternalLinkAlt, FaArrowLeft } from 'react-icons/fa';
import StatusDisplay from '../components/TransactionStatus/StatusDisplay';

export default function Search() {
  const [searchAddress, setSearchAddress] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const { searchTransactions } = useChangelly();

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setTransactions([]); 
    try {
      const result = await searchTransactions(searchAddress);
      setTransactions(result.sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
      setError('Failed to fetch transactions: ' + err.message);
    }
    setLoading(false);
  };

  const handleTransactionClick = (tx) => {
    setSelectedTransaction(tx);
    setShowStatusModal(true);
  };

  const handleCloseModal = () => {
    setShowStatusModal(false);
    setSelectedTransaction(null);
  };

  return (
    <div className={styles.container}>
      <Link href="/main">
        <div className={styles.backButton}>
          <FaArrowLeft /> Back
        </div>
      </Link>
      <h1 className={styles.title}>Search Transactions</h1>
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          placeholder="Enter payout address"
          className={styles.searchInput}
        />
        <button onClick={handleSearch} className={styles.searchButton}>Search</button>
      </div>
      {loading && <p className={styles.loading}>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}
      <div className={`${styles.transactionList} ${transactions.length > 0 && styles.fadeIn}`}>
        {transactions.map((tx, index) => (
          <div
            key={tx.id}
            className={`${styles.transactionItem} ${styles.fadeInDelay}`}
            style={{ animationDelay: `${index * 0.1}s` }} // Delay each item
            onClick={() => handleTransactionClick(tx)}
          >
            <div className={styles.transactionInfo}>
              <p><strong>{tx.currencyFrom.toUpperCase()} to {tx.currencyTo.toUpperCase()}</strong></p>
              <p>Amount: {tx.amountExpectedFrom} {tx.currencyFrom.toUpperCase()}</p>
              <p>Status: {tx.status}</p>
              <p>Created: {new Date(tx.createdAt / 1000).toLocaleString()}</p>
              <p>Payin Address: {tx.payinAddress}</p>
              <p>Payout Address: {tx.payoutAddress}</p>
            </div>
            <a
              href={tx.trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.trackLink}
              onClick={(e) => e.stopPropagation()}
            >
              TRACK <FaExternalLinkAlt />
            </a>
          </div>
        ))}
      </div>
      {showStatusModal && selectedTransaction && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={handleCloseModal}>&times;</button>
            <StatusDisplay
              transactionId={selectedTransaction.id}
              initialStatus={selectedTransaction.status}
              initialDetails={selectedTransaction}
            />
          </div>
        </div>
      )}
    </div>
  );
}
