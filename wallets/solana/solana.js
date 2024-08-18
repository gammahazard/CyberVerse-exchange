import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

const HELIUS_ENDPOINT = 'https://deni-lzuq70-fast-mainnet.helius-rpc.com';

export const detectSolanaProvider = async () => {
  if (typeof window !== 'undefined') {
    if (window.solana && window.solana.isPhantom) {
      return { provider: window.solana, name: 'Phantom' };
    }
    // ... (other wallet checks remain the same)
  }
  return null;
};

export const connectSolanaWallet = async () => {
  const detectedWallet = await detectSolanaProvider();
  if (detectedWallet) {
    try {
      await detectedWallet.provider.connect();
      const publicKey = detectedWallet.provider.publicKey.toString();
      return { account: publicKey, walletName: detectedWallet.name, provider: detectedWallet.provider };
    } catch (error) {
      console.error('Failed to connect Solana wallet:', error);
      throw error;
    }
  } else {
    throw new Error('No Solana wallet detected');
  }
};

export const getSolanaBalance = async (publicKey) => {
  try {
    const connection = new Connection(HELIUS_ENDPOINT, 'confirmed');
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Failed to get Solana balance:', error);
    throw error;
  }
};

export const sendSolanaTransaction = async (provider, toAddress, amount) => {
  const connection = new Connection(HELIUS_ENDPOINT, 'confirmed');
  try {
    const balance = await getSolanaBalance(provider.publicKey.toString());
    if (balance < amount) {
      throw new Error(`Insufficient balance. You have ${balance.toFixed(4)} SOL, but ${amount} SOL is required.`);
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: new PublicKey(toAddress),
        lamports: amount * LAMPORTS_PER_SOL
      })
    );

    const { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = provider.publicKey;

    const signed = await provider.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(txid);

    return txid;
  } catch (error) {
    console.error('Failed to send Solana transaction:', error);
    throw error;
  }
};