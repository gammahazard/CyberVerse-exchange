import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CurrencyList from '../components/CurrencySelector/CurrencyList';
import SwapInterface from '../components/ExchangeForm/SwapInterface';
import AddressDisplay from '../components/PaymentInfo/AddressDisplay';
import StatusDisplay from '../components/TransactionStatus/StatusDisplay';
import useChangelly from '../hooks/useChangelly';
import styles from '../styles/Home.module.css';
import FilteredCurrencyList from '../components/CurrencySelector/FilteredCurrencyList';
import { FaSpinner, FaSearch } from 'react-icons/fa';
import InProgress from '../components/InProgress';
import Link from 'next/link';

export default function Main() {
  // ---------------------------------------------------- states
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [receiveCurrency, setReceiveCurrency] = useState(null);
  const [sendCurrency, setSendCurrency] = useState(null);
  const [amount, setAmount] = useState(null);
  const [address, setAddress] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const { createTransaction, getStatus, getPairs } = useChangelly();
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [showInProgressButton, setShowInProgressButton] = useState(false);
  const [inProgressTransactions, setInProgressTransactions] = useState([]);
  const [showInProgressModal, setShowInProgressModal] = useState(false);
  const [availablePairs, setAvailablePairs] = useState([]);
  // ---------------------------------------------------- states

  // ---------------------------------------------------- useEffects
  useEffect(() => {
    const termsAccepted = localStorage.getItem('termsAccepted');
    if (!termsAccepted) {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      const parsedTransactions = JSON.parse(storedTransactions);
      setInProgressTransactions(parsedTransactions);
      setShowInProgressButton(parsedTransactions.length > 0);
    }
  }, []);
  // ---------------------------------------------------- useEffects

  // ---------------------------------------------------- consts
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

  const handleNewTransaction = () => {
    setStep(1);
    setReceiveCurrency(null);
    setSendCurrency(null);
    setAmount(null);
    setAddress(null);
    setTransactionDetails(null);
  };

  const handleCurrencySelect = async (currency) => {
    setIsVisible(false);
    setTimeout(async () => {
      if (step === 1) {
        setReceiveCurrency(currency);
        try {
          console.log('Fetching pairs for currency:', currency);
          const pairs = await getPairs(null, currency);
          console.log('getPairs response:', pairs);

          // Filter pairs where 'to' matches the selected currency
          const filteredPairs = pairs.filter(pair => pair.to.toLowerCase() === currency.toLowerCase());
          console.log('Filtered pairs:', filteredPairs);

          // Extract unique 'from' currencies
          const fromCurrencies = [...new Set(filteredPairs.map(pair => pair.from))];
          console.log('Available from currencies:', fromCurrencies);

          setAvailablePairs(fromCurrencies);
          setStep(2);
        } catch (error) {
          console.error('Error fetching available pairs:', error);
        }
      } else if (step === 2) {
        setSendCurrency(currency);
        setStep(3);
      }
      setIsVisible(true);
    }, 300); // Adjust this delay to match your fade-out transition time
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
  // ---------------------------------------------------- consts

  // ---------------------------------------------------- ui
  return (
    <div className={styles.container}>
      {step > 1 && step < 5 && (
        <div className='button container'>
          <button onClick={handleBack} className={styles.backButton}>
            ←
          </button>
        </div>
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
          <FilteredCurrencyList
            onSelect={handleCurrencySelect}
            prompt="What coin do you want to send?"
            availablePairs={availablePairs}
            isLoading={isLoading}
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
  // ---------------------------------------------------- ui
}
