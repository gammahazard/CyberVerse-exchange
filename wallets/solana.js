import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useState, useEffect } from 'react';

export function useSolanaWallet(receiveCurrency) {
    const wallet = useWallet();
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');

    useEffect(() => {
        if (wallet.connected && receiveCurrency.toLowerCase() === 'sol') {
            setIsWalletConnected(true);
            setWalletAddress(wallet.publicKey.toString());
        } else {
            setIsWalletConnected(false);
            setWalletAddress('');
        }
    }, [wallet.connected, receiveCurrency]);

    const connectWallet = () => {
        if (!wallet.connected) {
            wallet.connect();
        }
    };

    const sendTransaction = async (amount, recipientAddress) => {
        if (!wallet.connected) {
            throw new Error('Wallet not connected');
        }

        const connection = new Connection("https://api.mainnet-beta.solana.com");
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: new PublicKey(recipientAddress),
                lamports: amount * 1e9 // Convert SOL to lamports
            })
        );

        try {
            const signature = await wallet.sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');
            console.log('Transaction sent:', signature);
            return signature;
        } catch (err) {
            console.error('Error sending transaction:', err);
            throw err;
        }
    };

    return {
        isWalletConnected,
        walletAddress,
        connectWallet,
        sendTransaction,
        WalletMultiButton
    };
}