import React, { useState, useEffect } from 'react';
import { detectErgoProvider, connectErgoWallet, getErgoBalance } from './ergo';
import styles from '../../styles/ErgoWalletModal.module.css';

const ErgoWalletModal = ({ onClose, onWalletConnected, onContinueWithoutWallet }) => {
  const [provider, setProvider] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const detectProvider = async () => {
      const detectedProvider = await detectErgoProvider();
      setProvider(detectedProvider);
    };
    detectProvider();
  }, []);

  const handleConnect = async (wallet) => {
    try {
      if (provider) {
        const { address, balance, wallet: connectedWallet } = await connectErgoWallet(wallet);
        setWalletInfo({ address, balance, wallet: connectedWallet });
        console.log('Connected Ergo wallet:', { address, balance, wallet: connectedWallet });
        onWalletConnected(address);
      }
    } catch (error) {
      setError('Failed to connect Ergo wallet. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Connect Ergo Wallet</h2>
        {provider ? (
          <>
            <button className={styles.modalButton} onClick={() => handleConnect('nautilus')}>Connect Nautilus Wallet</button>
            <button className={styles.modalButton} onClick={() => handleConnect('safew')}>Connect SAFEW Wallet</button>
          </>
        ) : (
          <p>No Ergo wallet detected. Please install Nautilus or SAFEW wallet extension.</p>
        )}
        {error && <p className={styles.modalError}>{error}</p>}
        {walletInfo && (
          <div>
            <p>Connected Account: {walletInfo.address}</p>
            <p>Wallet: {walletInfo.wallet}</p>
            <p>Balance: {walletInfo.balance} ERG</p>
          </div>
        )}
        <button className={styles.modalButton} onClick={onContinueWithoutWallet}>Continue without wallet</button>
        <button className={styles.modalButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ErgoWalletModal;