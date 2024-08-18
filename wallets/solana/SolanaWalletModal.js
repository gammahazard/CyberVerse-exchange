import React, { useState, useEffect } from 'react';
import { detectSolanaProvider, connectSolanaWallet, getSolanaBalance } from '../../wallets/solana/solana';
import styles from '../../styles/SolanaWalletModal.module.css';

const SolanaWalletModal = ({ onClose, onWalletConnected, onContinueWithoutWallet, network }) => {
  const [provider, setProvider] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const detectProvider = async () => {
      try {
        const detectedProvider = await detectSolanaProvider();
        if (detectedProvider) {
          setProvider(detectedProvider.provider);
        } else {
          setError("No Solana wallet detected. Please install a Solana wallet extension.");
        }
      } catch (err) {
        console.error("Error detecting Solana provider:", err);
        setError("Failed to detect Solana wallet. Please try again.");
      }
    };
    detectProvider();
  }, []);

  const handleConnect = async () => {
    try {
      if (provider) {
        const { account, walletName, provider: connectedProvider } = await connectSolanaWallet();
        const balance = await getSolanaBalance(account);
        setWalletInfo({ account, network: walletName, balance });
        console.log('Connected Solana wallet:', { account, walletName, balance });
        onWalletConnected(account);
      }
    } catch (error) {
      setError('Failed to connect Solana wallet. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Connect Solana Wallet</h2>
        {provider ? (
          <button className={styles.modalButton} onClick={handleConnect}>Connect Solana Wallet</button>
        ) : (
          <p>{error || "No Solana wallet detected. Please install a Solana wallet extension."}</p>
        )}
        {walletInfo && (
          <div>
            <p>Connected Account: {walletInfo.account}</p>
            <p>Network: {walletInfo.network}</p>
            <p>Balance: {walletInfo.balance} SOL</p>
          </div>
        )}
        <button className={styles.modalButton} onClick={onContinueWithoutWallet}>Continue without wallet</button>
        <button className={styles.modalButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SolanaWalletModal;
