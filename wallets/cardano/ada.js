import { BrowserWallet, Transaction } from '@meshsdk/core';

export const getAdaBalance = async (wallet) => {
  try {
    console.log('Fetching ADA wallet balance...');
    const walletBalance = await wallet.getBalance();
    console.log('Raw ADA Balance:', walletBalance);
    const balanceInLovelace = walletBalance[0]?.quantity || 0;
    const balanceInAda = balanceInLovelace / 1e6; // Convert Lovelace to ADA
    return balanceInAda;
  } catch (error) {
    console.error('Error getting ADA balance:', error.message || error, error.stack);
    throw error;
  }
};

export const connectAdaWallet = async (walletName) => {
  try {
    console.log(`Attempting to enable ADA wallet: ${walletName}`);
    const wallet = await BrowserWallet.enable(walletName);
    console.log('ADA wallet enabled:', wallet);

    console.log('Fetching change address...');
    const changeAddress = await wallet.getChangeAddress();
    console.log('Change address:', changeAddress);

    const balance = await getAdaBalance(wallet);
    console.log('Wallet balance in ADA:', balance);

    return { wallet, changeAddress, balance };
  } catch (error) {
    console.error('Error connecting ADA wallet:', error.message || error, error.stack);
    throw error;
  }
};

export const sendAdaTransaction = async (wallet, toAddress, amount) => {
  try {
    const tx = new Transaction({ initiator: wallet })
      .sendLovelace(toAddress, (amount * 1e6).toString()); // Convert ADA to Lovelace

    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    return txHash;
  } catch (error) {
    console.error('Failed to send ADA transaction:', error);
    throw error;
  }
};