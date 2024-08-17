import React, { useState, useEffect } from 'react';
import { detectEthereumProvider, connectWallet, switchNetwork } from '../../wallets/ethereum/eth';
import styles from '../../styles/EthereumWalletModal.module.css';

const EthereumWalletModal = ({ onClose, onWalletConnected, onContinueWithoutWallet, network }) => {
  const [provider, setProvider] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const detectProvider = async () => {
      const detectedProvider = await detectEthereumProvider();
      setProvider(detectedProvider);
    };
    detectProvider();
  }, []);

  const handleConnect = async () => {
    try {
      if (provider) {
        await switchNetwork(provider.provider, network);
        const { account } = await connectWallet(provider.provider, network);
        setWalletInfo({ account, network });
        console.log('Connected wallet:', { account, network });
        onWalletConnected(account);
      }
    } catch (error) {
      setError('Failed to connect wallet. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Connect {network === 'arbitrum' ? 'Arbitrum' : 'Ethereum'} Wallet</h2>
        {provider ? (
          <button className={styles.modalButton} onClick={handleConnect}>Connect MetaMask</button>
        ) : (
          <p>No Ethereum wallet detected. Please install MetaMask.</p>
        )}
        {error && <p className={styles.modalError}>{error}</p>}
        {walletInfo && (
          <div>
            <p>Connected Account: {walletInfo.account}</p>
            <p>Network: {walletInfo.network}</p>
          </div>
        )}
        <button className={styles.modalButton} onClick={onContinueWithoutWallet}>Continue without wallet</button>
        <button className={styles.modalButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default EthereumWalletModal;
