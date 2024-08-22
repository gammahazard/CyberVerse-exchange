import { BrowserWallet, Transaction } from '@meshsdk/core';

import { MeshTxBuilder, BlockfrostProvider } from '@meshsdk/core';


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
    console.log('Starting ADA transaction...');
    console.log('To address:', toAddress);
    console.log('Amount in ADA:', amount);

    // Convert ADA to Lovelace
    const amountInLovelace = Math.floor(amount * 1e6).toString();
    console.log('Amount in Lovelace:', amountInLovelace);

    // Get UTXOs and change address
    const utxos = await wallet.getUtxos();
    const changeAddress = await wallet.getChangeAddress();

    console.log('UTXOs:', utxos);
    console.log('Change address:', changeAddress);

    // Initialize BlockfrostProvider
    const blockchainProvider = new BlockfrostProvider(process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY);

    // Initialize MeshTxBuilder
    const txBuilder = new MeshTxBuilder({
      fetcher: blockchainProvider,
      evaluator: blockchainProvider,
    });

    // Build the transaction
    console.log('Building transaction...');
    let unsignedTx;
    try {
      unsignedTx = await txBuilder
        .txOut(toAddress, [{ unit: "lovelace", quantity: amountInLovelace }])
        .changeAddress(changeAddress)
        .selectUtxosFrom(utxos)
        .complete();
    } catch (buildError) {
      console.error('Error during transaction build:', buildError);
      if (buildError.message) {
        console.error('Build error message:', buildError.message);
      }
      throw buildError;
    }

    console.log('Unsigned transaction built');

    // Sign the transaction
    console.log('Signing transaction...');
    const signedTx = await wallet.signTx(unsignedTx);
    console.log('Transaction signed');

    // Submit the transaction
    console.log('Submitting transaction...');
    const txHash = await wallet.submitTx(signedTx);
    console.log('Transaction submitted, hash:', txHash);

    return txHash;
  } catch (error) {
    console.error('Failed to send ADA transaction:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    // Additional error information
    if (error.response) {
      console.error('Error response:', JSON.stringify(error.response, null, 2));
    }
    if (error.request) {
      console.error('Error request:', JSON.stringify(error.request, null, 2));
    }
    
    throw error;
  }
};