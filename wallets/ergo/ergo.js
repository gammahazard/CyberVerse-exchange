// wallets/ergo/ergo.js
import { TransactionBuilder, OutputBuilder } from "@fleet-sdk/core";

export const detectErgoProvider = async () => {
  if (typeof ergoConnector !== 'undefined') {
    return ergoConnector;
  }
  return null;
};

export const connectErgoWallet = async (wallet = 'nautilus') => {
  try {
    if (wallet === 'nautilus' && ergoConnector.nautilus) {
      const connected = await ergoConnector.nautilus.connect();
      if (connected) {
        const address = await ergo.get_change_address();
        const balance = await ergo.get_balance();
        return { address, balance, wallet: 'Nautilus' };
      }
    } else if (wallet === 'safew' && ergoConnector.safew) {
      const connected = await ergoConnector.safew.connect();
      if (connected) {
        const address = await ergo.get_change_address();
        const balance = await ergo.get_balance();
        return { address, balance, wallet: 'SAFEW' };
      }
    }
    throw new Error('Failed to connect wallet');
  } catch (error) {
    console.error('Error connecting Ergo wallet:', error);
    throw error;
  }
};

export const getErgoBalance = async () => {
  try {
    const balance = await ergo.get_balance();
    return balance;
  } catch (error) {
    console.error('Error getting Ergo balance:', error);
    throw error;
  }
};

export const buildAndSignErgoTransaction = async (recipientAddress, amount) => {
  try {
    const creationHeight = await ergo.get_current_height();
    const inputs = await ergo.get_utxos();
    const changeAddress = await ergo.get_change_address();
    const amountInNanoErgs = BigInt(Math.round(parseFloat(amount) * 1e9));

    const unsignedTransaction = new TransactionBuilder(creationHeight)
      .from(inputs)
      .to(new OutputBuilder(amountInNanoErgs, recipientAddress))
      .sendChangeTo(changeAddress)
      .payMinFee()
      .build()
      .toEIP12Object();

    const signedTx = await ergo.sign_tx(unsignedTransaction);
    const txId = await ergo.submit_tx(signedTx);
    return txId;
  } catch (error) {
    console.error('Error building and signing Ergo transaction:', error);
    throw error;
  }
};