import { useState, useEffect } from 'react';
import CurrencyList from '../components/CurrencySelector/CurrencyList';
import SwapInterface from '../components/ExchangeForm/SwapInterface';
import AddressDisplay from '../components/PaymentInfo/AddressDisplay';
import StatusDisplay from '../components/TransactionStatus/StatusDisplay';
import useChangelly from '../hooks/useChangelly';
import styles from '../styles/Home.module.css';
import { FaSpinner, FaSearch } from 'react-icons/fa';
import InProgress from '../components/InProgress'; // Add this line
import Link from 'next/link';

export default function App() {
  const [step, setStep] = useState(1);
  const [receiveCurrency, setReceiveCurrency] = useState(null);
  const [sendCurrency, setSendCurrency] = useState(null);
  const [amount, setAmount] = useState(null);
  const [address, setAddress] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const { createTransaction, getStatus } = useChangelly();
  const [isVisible, setIsVisible] = useState(true);
  const [showInProgressButton, setShowInProgressButton] = useState(false);
  const [inProgressTransactions, setInProgressTransactions] = useState([]);
  const [showInProgressModal, setShowInProgressModal] = useState(false);

  const handleInProgressClick = () => {
    setShowInProgressModal(true);
  };

  const handleCloseInProgressModal = () => {
    setShowInProgressModal(false);
  };

  const handleTransactionSelect = (transaction) => {
    setTransactionDetails(transaction);
    setStep(5);
    setShowInProgressModal(false);
  };

  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      const parsedTransactions = JSON.parse(storedTransactions);
      setInProgressTransactions(parsedTransactions);
      setShowInProgressButton(parsedTransactions.length > 0);
    }
  }, []);

  const handleNewTransaction = () => {
    setStep(1);
    setReceiveCurrency(null);
    setSendCurrency(null);
    setAmount(null);
    setAddress(null);
    setTransactionDetails(null);
  };

  const handleCurrencySelect = (currency) => {
    setIsVisible(false);
    setTimeout(() => {
      if (step === 1) {
        setReceiveCurrency(currency);
        setStep(2);
      } else if (step === 2) {
        setSendCurrency(currency);
        setStep(3);
      }
      setIsVisible(true);
    }, 500);
  };

  const handleSwap = async (swapAmount, recipientAddress, rateType) => {
    setAmount(swapAmount);
    setAddress(recipientAddress);
    setIsVisible(false);
    try {
      const transaction = await createTransaction({
        from: sendCurrency,
        to: receiveCurrency,
        amount: swapAmount,
        address: recipientAddress,
        rateType,
      });

      setTransactionDetails(transaction);

      // Update local storage with the new transaction
      const updatedTransactions = [...inProgressTransactions, transaction];
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      setInProgressTransactions(updatedTransactions);
      setShowInProgressButton(true);

      setTimeout(() => {
        setStep(4);
        setIsVisible(true);
      }, 500);
    } catch (error) {
      console.error('Error creating transaction:', error);
      setIsVisible(true);
    }
  };

  const handleSent = () => {
    setIsVisible(false);
    setTimeout(() => {
      setStep(5);
      setIsVisible(true);
    }, 500);
  };

  const handleBack = () => {
    if (step < 5) {
      setIsVisible(false);
      setTimeout(() => {
        setStep((prevStep) => {
          const newStep = Math.max(prevStep - 1, 1);
          if (newStep === 1) {
            setReceiveCurrency(null);
            setSendCurrency(null);
          } else if (newStep === 2) {
            setSendCurrency(null);
          }
          return newStep;
        });
        setIsVisible(true);
      }, 500);
    }
  };

  return (
    <div className={styles.container}>
      {step > 1 && step < 5 && (
        <button onClick={handleBack} className={styles.backButton}>
          ←
        </button>
      )}
      {showInProgressButton && (
        <button onClick={handleInProgressClick} className={styles.inProgressButton}>
          <FaSpinner className={styles.spinIcon} /> My Transactions
        </button>
      )}
      <Link href="/search">
        <div className={styles.searchIcon}>
          <FaSearch />
        </div>
      </Link>
      <div className={`${styles.content} ${isVisible ? styles.fadeIn : styles.fadeOut}`}>
        {step === 1 && (
          <CurrencyList 
            onSelect={handleCurrencySelect} 
            prompt="What coin do you want to receive?"
          />
        )}
        {step === 2 && (
          <CurrencyList 
            onSelect={handleCurrencySelect} 
            prompt="What coin do you want to send?"
            excludeCurrencies={[receiveCurrency]}  // Exclude the selected currency from the first step
          />
        )}
        {step === 3 && (
          <SwapInterface 
            sendCurrency={sendCurrency} 
            receiveCurrency={receiveCurrency} 
            onSwap={handleSwap}
          />
        )}
        {step === 4 && transactionDetails && (
          <AddressDisplay 
            currencyFrom={transactionDetails.currencyFrom}
            currencyTo={transactionDetails.currencyTo}
            amountExpectedFrom={transactionDetails.amountExpectedFrom}
            amountExpectedTo={transactionDetails.amountExpectedTo}
            payinAddress={transactionDetails.payinAddress}
            payoutAddress={transactionDetails.payoutAddress}
            onSent={handleSent}
          />
        )}
        {step === 5 && transactionDetails && (
          <StatusDisplay 
            key={transactionDetails.id}
            transactionId={transactionDetails.id}
            initialStatus={transactionDetails.status}
            initialDetails={transactionDetails}
            onNewTransaction={handleNewTransaction}
          />
        )}
      </div>
      {showInProgressModal && (
        <InProgress
          onClose={handleCloseInProgressModal}
          onSelectTransaction={handleTransactionSelect}
        />
      )}
    </div>
  );
}
