import React, { useEffect } from 'react';
import { CardanoWallet, useWallet } from '@meshsdk/react';
import styles from '../../styles/AdaWalletModal.module.css';

const AdaWalletModal = ({ onClose, onWalletConnected, onContinueWithoutWallet }) => {
  const { connected, name, connect, disconnect, error, wallet } = useWallet();

  const handleConnect = async () => {
    try {
      if (!connected) {
        await connect(); // This prompts the user to select and connect their Cardano wallet.
      }
    } catch (error) {
      console.error('Error during ADA wallet connection:', error.message || error);
    }
  };

  // Effect to handle when the wallet is successfully connected
  useEffect(() => {
    if (connected) {
      // Assuming you want to pass the wallet name and possibly an address or other details
      const address = wallet?.getChangeAddress(); // Replace with actual method to get the address if needed
      onWalletConnected(address || name); // Pass the address or wallet name back to the parent component
      onClose(); // Close the modal after connecting
    }
  }, [connected, name, wallet, onWalletConnected, onClose]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Connect ADA Wallet</h2>
        {!connected ? (
          <>
            <CardanoWallet
              label="Connect a Wallet"
              isDark={true}
              onConnected={handleConnect} // This triggers when the wallet is successfully connected
            />
            {error && <p className={styles.errorMessage}>Error: {error.message}</p>}
          </>
        ) : (
          <div>
            <p>Connected Wallet: {name}</p>
            <button className={styles.modalButton} onClick={() => disconnect()}>
              Disconnect Wallet
            </button>
          </div>
        )}
        <button className={styles.modalButton} onClick={onContinueWithoutWallet}>
          Continue without wallet
        </button>
        <button className={styles.modalButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default AdaWalletModal;
