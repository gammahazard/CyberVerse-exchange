import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { FaClipboard } from 'react-icons/fa';
import styles from '../../styles/AddressDisplay.module.css';
import { detectEthereumProvider, connectWallet, sendTransaction } from '../../wallets/ethereum/eth';
import { detectSolanaProvider, connectSolanaWallet, sendSolanaTransaction, getSolanaBalance } from '../../wallets/solana/solana';
import { detectErgoProvider, connectErgoWallet, buildAndSignErgoTransaction, getErgoBalance } from '../../wallets/ergo/ergo';
import { sendAdaTransaction } from '../../wallets/cardano/ada'; // ADA transaction method
import { useWallet } from '@meshsdk/react'; // ADA connection methods
import { connectAdaWallet, getAdaBalance } from '../../wallets/cardano/ada';
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

  // ADA wallet connection management
  const { wallet, connected, name, connect, disconnect, error } = useWallet();

  const handleCopy = () => {
    navigator.clipboard.writeText(payinAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWithWallet = async () => {
    setTransactionError(null);
    try {
      if (currencyFrom.toLowerCase() === 'sol') {
        const txHash = await sendSolanaTransaction(walletProvider, payinAddress, parseFloat(amountExpectedFrom));
        alert(`Transaction sent! Hash: ${txHash}`);
      } else if (currencyFrom.toLowerCase() === 'erg') {
        const txId = await buildAndSignErgoTransaction(payinAddress, amountExpectedFrom);
        alert(`Transaction sent! ID: ${txId}`);
      } else if (currencyFrom.toLowerCase() === 'ada') {
        if (wallet) {
          const balanceInAda = parseFloat(walletBalance) / 1e6; // Convert Lovelace to ADA
          if (balanceInAda < parseFloat(amountExpectedFrom)) {
            const neededAda = parseFloat(amountExpectedFrom) - balanceInAda;
            setTransactionError(`Insufficient balance. You need at least ${neededAda.toFixed(6)} more ADA.`);
            return;
          }
          const txHash = await sendAdaTransaction(wallet, payinAddress, amountExpectedFrom);
          alert(`Transaction sent! Hash: ${txHash}`);
        } else {
          setTransactionError('ADA wallet is not connected!');
        }
      } else {
        const txHash = await sendTransaction(walletProvider, payinAddress, amountExpectedFrom, network);
        alert(`Transaction sent! Hash: ${txHash}`);
      }
      onSent();
    } catch (error) {
      handleTransactionError(error);
    }
  };

  const handleTransactionError = (error) => {
    if (error && error.message) {
      if (error.message.includes('Insufficient inputs')) {
        const match = error.message.match(/nanoErgs: (\d+)/);
        if (match && match[1]) {
          const requiredNanoErgs = parseInt(match[1], 10);
          const requiredErgs = requiredNanoErgs / 1e9; // Convert nanoErgs to ERG
          setTransactionError(`Insufficient balance. You need at least ${requiredErgs.toFixed(4)} ERG to complete this transaction.`);
        } else {
          setTransactionError(`Insufficient balance. Please check your ERG balance and try again.`);
        }
      } else if (error.message.includes('insufficient funds for gas * price + value')) {
        const match = error.message.match(/want (\d+)/);
        if (match && match[1]) {
          const requiredWei = BigInt(match[1]);
          const requiredEth = Number(requiredWei) / 1e18; // Convert Wei to ETH
          setTransactionError(`Insufficient balance. You need at least ${requiredEth.toFixed(6)} ETH to complete this transaction.`);
        } else {
          setTransactionError(`Insufficient balance. Please check your ETH balance and try again.`);
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
        } else if (currencyFrom.toLowerCase() === 'ada' && wallet) {
          balance = await getAdaBalance(wallet); // Use the refactored function to get ADA balance
          console.log('Formatted ADA Balance:', balance); // Log the formatted balance for debugging
        }
        setWalletBalance(balance);
      } catch (error) {
        console.error(`Failed to update ${currencyFrom.toUpperCase()} balance:`, error);
      }
    }
  };
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        if (currencyFrom.toLowerCase() === 'sol') {
          const { account, walletName, provider } = await connectSolanaWallet();
          setIsWalletConnected(!!account);
          setConnectedWalletName(walletName);
          setWalletProvider(provider);
          const balance = await getSolanaBalance(account);
          setWalletBalance(balance);
        } else if (currencyFrom.toLowerCase() === 'erg') {
          const ergoProvider = await detectErgoProvider();
          if (ergoProvider) {
            const { address, balance, wallet } = await connectErgoWallet();
            setIsWalletConnected(!!address);
            setConnectedWalletName('Ergo Wallet');
            setWalletProvider(ergoProvider);
            setWalletBalance(balance);
          }
        } else if (currencyFrom.toLowerCase() === 'ada' && connected) {
          setIsWalletConnected(true);
          setConnectedWalletName('ADA Wallet');
          const walletBalance = await wallet.getBalance();
          setWalletBalance(walletBalance[0]?.quantity || 0); // Assuming balance[0] is in Lovelace
          console.log(walletBalance)
        } else {
          const ethereumProvider = await detectEthereumProvider();
          if (ethereumProvider) {
            const { account } = await connectWallet(ethereumProvider.provider, network);
            setIsWalletConnected(!!account);
            setConnectedWalletName('MetaMask');
            setWalletProvider(ethereumProvider.provider);
          }
        }
      } catch (error) {
        console.error("Failed to check wallet connection:", error);
        setIsWalletConnected(false);
        setConnectedWalletName('');
      }
    };

    checkWalletConnection();
  }, [currencyFrom, network, connected, wallet]);

  const formatBalance = (balance) => {
    if (typeof balance === 'number') {
      return (balance / 1e6).toFixed(6); // Convert Lovelace to ADA and format it
    } else if (typeof balance === 'string') {
      return (parseFloat(balance) / 1e6).toFixed(6); // If balance is a string, convert it to a number and format
    } else if (balance && typeof balance.toString === 'function') {
      return (parseFloat(balance.toString()) / 1e6).toFixed(6); // Convert any object balance to a string, then to a number, and format
    }
    return 'N/A';
  };

  useEffect(() => {
    if (isWalletConnected) {
      updateWalletBalance();
      const intervalId = setInterval(updateWalletBalance, 10000);
      return () => clearInterval(intervalId);
    }
  }, [isWalletConnected, currencyFrom, walletProvider]);

  const getWalletName = () => {
    if (currencyFrom.toLowerCase() === 'erg') {
      return 'Ergo Wallet';
    } else if (currencyFrom.toLowerCase() === 'sol') {
      return 'Solana Wallet';
    } else if (currencyFrom.toLowerCase() === 'ada') {
      return 'ADA Wallet';
    } else {
      return connectedWalletName || 'MetaMask';
    }
  };

  const shouldShowWalletOptions = ['eth', 'arb', 'sol', 'erg', 'ada'].includes(currencyFrom.toLowerCase());

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
        <button onClick={onSent} className={styles.sentButton}>
          I&apos;ve sent the funds
        </button>

        {shouldShowWalletOptions && isWalletConnected && (
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
