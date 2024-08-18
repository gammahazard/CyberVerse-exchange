import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { FaClipboard, FaWallet } from 'react-icons/fa';
import styles from '../../styles/AddressDisplay.module.css';
import { detectEthereumProvider, connectWallet, sendTransaction } from '../../wallets/ethereum/eth';
import { detectSolanaProvider, connectSolanaWallet, sendSolanaTransaction, getSolanaBalance } from '../../wallets/solana/solana';

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
  const [connectedWalletName, setConnectedWalletName] = useState('');
  const [transactionError, setTransactionError] = useState(null);
  const [walletProvider, setWalletProvider] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);

  const network = currencyFrom.toLowerCase() === 'arb' ? 'arbitrum' : 'ethereum';

  const handleCopy = () => {
    navigator.clipboard.writeText(payinAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWithWallet = async () => {
    setTransactionError(null);
    if (currencyFrom.toLowerCase() === 'sol') {
      if (walletProvider) {
        try {
          console.log('Attempting to send Solana transaction:');
          console.log('To Address:', payinAddress);
          console.log('Amount:', amountExpectedFrom, 'SOL');

          const txHash = await sendSolanaTransaction(walletProvider, payinAddress, parseFloat(amountExpectedFrom));
          console.log('Transaction sent:', txHash);
          alert(`Transaction sent! Hash: ${txHash}`);
          onSent();
        } catch (error) {
          console.error('Error sending Solana transaction:', error);
          handleTransactionError(error);
        }
      } else {
        setTransactionError('Solana wallet is not connected!');
      }
    } else {
      if (walletProvider) {
        try {
          console.log('Attempting to send transaction:');
          console.log('Network:', network);
          console.log('To Address:', payinAddress);
          console.log('Amount:', amountExpectedFrom, currencyFrom.toUpperCase());
    
          const tokenAddress = currencyFrom.toLowerCase() === 'arb' ? '0x912CE59144191C1204E64559FE8253a0e49E6548' : null;
          const txHash = await sendTransaction(walletProvider, payinAddress, amountExpectedFrom, network, tokenAddress);
          console.log('Transaction sent:', txHash);
          alert(`Transaction sent! Hash: ${txHash}`);
          onSent();
        } catch (error) {
          console.error('Error sending transaction:', error);
          handleTransactionError(error);
        }
      } else {
        setTransactionError('Ethereum wallet is not connected!');
      }
    }
  };
  
  const handleTransactionError = (error) => {
    if (error && error.message) {
      setTransactionError(`Transaction failed: ${error.message}`);
    } else {
      setTransactionError('Failed to send transaction. Please check the console for details.');
    }
  };

  const updateSolanaBalance = async () => {
    if (walletProvider && currencyFrom.toLowerCase() === 'sol') {
      try {
        const balance = await getSolanaBalance(walletProvider.publicKey.toString());
        setWalletBalance(balance);
      } catch (error) {
        console.error('Failed to update Solana balance:', error);
      }
    }
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (currencyFrom.toLowerCase() === 'sol') {
        try {
          const { account, walletName, provider } = await connectSolanaWallet();
          setIsWalletConnected(!!account);
          setConnectedWalletName(walletName);
          setWalletProvider(provider);
          // Update balance immediately after connecting
          const balance = await getSolanaBalance(account);
          setWalletBalance(balance);
        } catch (error) {
          console.error("Failed to check Solana wallet connection:", error);
          setIsWalletConnected(false);
          setConnectedWalletName('');
          setWalletProvider(null);
        }
      } else {
        const ethereumProvider = await detectEthereumProvider();
        if (ethereumProvider) {
          try {
            const { account } = await connectWallet(ethereumProvider.provider, network);
            setIsWalletConnected(!!account);
            setConnectedWalletName('MetaMask');
            setWalletProvider(ethereumProvider.provider);
          } catch (error) {
            console.error("Failed to check wallet connection:", error);
            setIsWalletConnected(false);
            setConnectedWalletName('');
            setWalletProvider(null);
          }
        }
      }
    };

    checkWalletConnection();
  }, [currencyFrom, network]);

  useEffect(() => {
    if (isWalletConnected && currencyFrom.toLowerCase() === 'sol') {
      updateSolanaBalance();
      const intervalId = setInterval(updateSolanaBalance, 10000); // Update every 10 seconds
      return () => clearInterval(intervalId);
    }
  }, [isWalletConnected, currencyFrom, walletProvider]);

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


      <div className={styles.buttonContainer}>
        <button onClick={onSent} className={styles.sentButton}>I&apos;ve sent the funds</button>

        {isWalletConnected && (
          <>
            <div className={styles.walletInfo}>
              <p>Connected Wallet: {connectedWalletName}</p>
              {walletBalance !== null && (
                <p>Balance: {walletBalance.toFixed(4)} {currencyFrom.toUpperCase()}</p>
              )}
            </div>
            <button 
              onClick={handleSendWithWallet} 
              className={styles.walletButton}
              disabled={walletBalance !== null && walletBalance < parseFloat(amountExpectedFrom)}
            >
              Send with {connectedWalletName}
            </button>
          </>
        )}
      </div>

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