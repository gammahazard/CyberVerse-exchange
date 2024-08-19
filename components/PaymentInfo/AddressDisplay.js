import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { FaClipboard, FaWallet } from 'react-icons/fa';
import styles from '../../styles/AddressDisplay.module.css';
import { detectEthereumProvider, connectWallet, sendTransaction } from '../../wallets/ethereum/eth';
import { detectSolanaProvider, connectSolanaWallet, sendSolanaTransaction, getSolanaBalance } from '../../wallets/solana/solana';
import { detectErgoProvider, connectErgoWallet, buildAndSignErgoTransaction, getErgoBalance } from '../../wallets/ergo/ergo';


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
    } else if (currencyFrom.toLowerCase() === 'erg') {
      try {
        console.log('Attempting to send Ergo transaction:');
        console.log('To Address:', payinAddress);
        console.log('Amount:', amountExpectedFrom, 'ERG');

        const txId = await buildAndSignErgoTransaction(payinAddress, amountExpectedFrom);
        console.log('Transaction sent:', txId);
        alert(`Transaction sent! ID: ${txId}`);
        onSent();
      } catch (error) {
        console.error('Error sending Ergo transaction:', error);
        handleTransactionError(error);
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
      if (currencyFrom.toLowerCase() === 'erg' && error.message.includes('Insufficient inputs')) {
        // Extract the required amount from the Ergo error message
        const match = error.message.match(/nanoErgs: (\d+)/);
        if (match && match[1]) {
          const requiredNanoErgs = parseInt(match[1], 10);
          const requiredErgs = requiredNanoErgs / 1000000000; // Convert nanoErgs to ERG
          setTransactionError(`Insufficient balance. You need at least ${requiredErgs.toFixed(4)} ERG to complete this transaction.`);
        } else {
          setTransactionError(`Insufficient balance. Please check your ERG balance and try again.`);
        }
      } else if ((currencyFrom.toLowerCase() === 'eth' || currencyFrom.toLowerCase() === 'arb') && 
                 error.message.includes('insufficient funds for gas * price + value')) {
        // Extract the required amount from the Ethereum error message
        const match = error.message.match(/want (\d+)/);
        if (match && match[1]) {
          const requiredWei = BigInt(match[1]);
          const requiredEth = Number(requiredWei) / 1e18; // Convert Wei to ETH
          setTransactionError(`Insufficient balance. You need at least ${requiredEth.toFixed(6)} ${currencyFrom.toUpperCase()} to complete this transaction.`);
        } else {
          setTransactionError(`Insufficient balance. Please check your ${currencyFrom.toUpperCase()} balance and try again.`);
        }
      } else {
        setTransactionError(`Transaction failed: ${error.message}`);
      }
    } else {
      setTransactionError('Failed to send transaction. Please check the console for details.');
    }
  };

  const updateWalletBalance = async () => {
    if (walletProvider) {
      try {
        let balance;
        if (currencyFrom.toLowerCase() === 'sol') {
          balance = await getSolanaBalance(walletProvider.publicKey.toString());
        } else if (currencyFrom.toLowerCase() === 'erg') {
          balance = await getErgoBalance();
        } else {
          // Ethereum balance logic here if needed
        }
        setWalletBalance(balance);
      } catch (error) {
        console.error(`Failed to update ${currencyFrom.toUpperCase()} balance:`, error);
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
      } else if (currencyFrom.toLowerCase() === 'erg') {
        try {
          const ergoProvider = await detectErgoProvider();
          if (ergoProvider) {
            const { address, balance, wallet } = await connectErgoWallet();
            setIsWalletConnected(!!address);
            setConnectedWalletName('Ergo Wallet');
            setWalletProvider(ergoProvider);
            setWalletBalance(balance);
          }
        } catch (error) {
          console.error("Failed to check Ergo wallet connection:", error);
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
  const formatBalance = (balance) => {
    if (typeof balance === 'number') {
      return balance.toFixed(4);
    } else if (typeof balance === 'string') {
      // If balance is already a string, we assume it's properly formatted
      return balance;
    } else if (balance && typeof balance.toString === 'function') {
      // If it's an object (like BigNumber), try to convert it to string
      return balance.toString();
    }
    return 'N/A'; // Default case if balance is undefined or null
  };

  useEffect(() => {
    if (isWalletConnected) {
      updateWalletBalance();
      const intervalId = setInterval(updateWalletBalance, 10000); // Update every 10 seconds
      return () => clearInterval(intervalId);
    }
  }, [isWalletConnected, currencyFrom, walletProvider]);
  const getWalletName = () => {
    if (currencyFrom.toLowerCase() === 'erg') {
      return 'Ergo Wallet';
    } else if (currencyFrom.toLowerCase() === 'sol') {
      return 'Solana Wallet';
    } else {
      return connectedWalletName || 'MetaMask';
    }
  };
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
              <p>Connected Wallet: {getWalletName()}</p>
              {walletBalance !== null && (
                <p>Balance: {formatBalance(walletBalance)} {currencyFrom.toUpperCase()}</p>
              )}
            </div>
            <button 
              onClick={handleSendWithWallet} 
              className={styles.walletButton}
              // Removed the disabled attribute
            >
              Send with {getWalletName()}
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