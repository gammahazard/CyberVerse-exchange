import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { FaClipboard, FaWallet } from 'react-icons/fa';
import styles from '../../styles/AddressDisplay.module.css';
import EthereumWalletModal from '../../wallets/ethereum/EthereumWalletModal';
import { detectEthereumProvider, connectWallet, sendTransaction } from '../../wallets/ethereum/eth';

export default function AddressDisplay({ 
  currencyFrom, 
  currencyTo, 
  amountExpectedFrom, 
  amountExpectedTo, 
  payinAddress, 
  payoutAddress, 
  refundAddress, 
  onSent 
}) {
  const [copied, setCopied] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [transactionError, setTransactionError] = useState(null);

  const network = currencyFrom.toLowerCase() === 'arb' ? 'arbitrum' : 'ethereum';

  const handleCopy = () => {
    navigator.clipboard.writeText(payinAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWithMetaMask = async () => {
    setTransactionError(null);
    const ethereumProvider = await detectEthereumProvider();
    if (ethereumProvider) {
      try {
        console.log('Attempting to send transaction:');
        console.log('Network:', network);
        console.log('To Address:', payinAddress);
        console.log('Amount:', amountExpectedFrom, currencyFrom.toUpperCase());
  
        const tokenAddress = currencyFrom.toLowerCase() === 'arb' ? '0x912CE59144191C1204E64559FE8253a0e49E6548' : null;
        const txHash = await sendTransaction(ethereumProvider.provider, payinAddress, amountExpectedFrom, network, tokenAddress);
        console.log('Transaction sent:', txHash);
        alert(`Transaction sent! Hash: ${txHash}`);
        onSent(); // Move to the next step after the transaction is sent
      } catch (error) {
        console.error('Error sending transaction:', error);
        handleTransactionError(error);
      }
    } else {
      setTransactionError('MetaMask is not installed!');
    }
  };
  
  const handleTransactionError = (error) => {
    if (error && error.error && error.error.message) {
      const errorMessage = error.error.message.toLowerCase();
  
      if (errorMessage.includes('insufficient funds')) {
        const match = errorMessage.match(/have (\d+) want (\d+)/);
        if (match) {
          const have = parseFloat(match[1]) / 1e18;
          const want = parseFloat(match[2]) / 1e18;
          const needed = (want - have).toFixed(6);
          setTransactionError(`Insufficient funds. You need ${needed} more ${currencyFrom.toUpperCase()} to complete this transaction.`);
        } else {
          setTransactionError('Insufficient funds. Please top up your wallet and try again.');
        }
      } else if (errorMessage.includes('transfer amount exceeds balance')) {
        setTransactionError(`Insufficient ${currencyFrom.toUpperCase()} balance to complete the transaction.`);
      } else if (errorMessage.includes('user rejected')) {
        setTransactionError('Transaction was rejected. Please try again.');
      } else {
        setTransactionError(`Transaction failed: ${error.error.message}`);
      }
    } else {
      setTransactionError('Failed to send transaction. Please check the console for details.');
    }
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      const ethereumProvider = await detectEthereumProvider();
      if (ethereumProvider) {
        try {
          const { account } = await connectWallet(ethereumProvider.provider, network);
          setIsWalletConnected(!!account);
        } catch (error) {
          console.error("Failed to check wallet connection:", error);
          setIsWalletConnected(false);
        }
      }
    };

    checkWalletConnection();
  }, [network]);

  return (
    <div className={styles.addressDisplay}>
      <h2>Transaction Details</h2>
      <table className={styles.transactionTable}>
        <tbody>
          <tr>
            <td>You are sending:</td>
            <td>{amountExpectedFrom} {currencyFrom.toUpperCase()}</td>
          </tr>
          <tr>
            <td>To receive:</td>
            <td>{amountExpectedTo} {currencyTo.toUpperCase()}</td>
          </tr>
          <tr>
            <td>Receiving Address:</td>
            <td>{payoutAddress}</td>
          </tr>
        </tbody>
      </table>

      <div className={styles.sendDetails}>
        <p>Please send <strong>{amountExpectedFrom} {currencyFrom.toUpperCase()}</strong> to the address below:</p>
        <div className={styles.payinAddressContainer}>
          <span>{payinAddress}</span>
          <FaClipboard 
            className={styles.clipboardIcon} 
            onClick={handleCopy} 
            title="Copy to clipboard" 
          />
          {copied && <span className={styles.copiedNotice}>Copied!</span>}
        </div>
      </div>

      <div className={styles.qrCodeContainer}>
        <QRCode value={payinAddress} size={160} />
      </div>
      <button onClick={onSent} className={styles.sentButton}>I&apos;ve sent the funds</button>

      {isWalletConnected && (currencyFrom.toLowerCase() === 'eth' || currencyFrom.toLowerCase() === 'arb') && (
        <button onClick={handleSendWithMetaMask} className={styles.metaMaskButton}>
          Send with MetaMask
        </button>
      )}

      {refundAddress && (
        <div className={styles.refundInfo}>
          <p>IN CASE OF TRANSACTION FAILURE FUNDS WILL BE REFUNDED TO {refundAddress}</p>
        </div>
      )}
      
      {transactionError && (
        <div className={styles.errorMessage}>
          {transactionError}
        </div>
      )}
    </div>
  );
}
