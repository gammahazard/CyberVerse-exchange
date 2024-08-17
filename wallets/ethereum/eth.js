import Web3 from 'web3';

const NETWORKS = {
  ethereum: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://eth.llamarpc.com'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  arbitrum: {
    chainId: '0xa4b1', // Chain ID for Arbitrum One
    chainName: 'Arbitrum One',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io']
  }
  // Add more networks here as needed
};

// ARB Token contract address on Arbitrum One
const ARB_TOKEN_ADDRESS = '0x912CE59144191C1204E64559FE8253a0e49E6548';

export const detectEthereumProvider = async () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    const provider = window.ethereum;
    const web3 = new Web3(provider);
    return { provider, web3 };
  }
  return null;
};

export const connectWallet = async (provider, network = 'ethereum') => {
  try {
    await provider.request({ method: 'eth_requestAccounts' });
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    
    // Switch to the correct network if not already on it
    await switchNetwork(provider, network);
    
    return { account: accounts[0], networkId };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
};

export const switchNetwork = async (provider, network) => {
  const networkConfig = NETWORKS[network];
  if (!networkConfig) {
    throw new Error(`Unsupported network: ${network}`);
  }

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: networkConfig.chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [networkConfig],
        });
      } catch (addError) {
        console.error('Failed to add network:', addError);
        throw addError;
      }
    } else {
      console.error('Failed to switch network:', switchError);
      throw switchError;
    }
  }
};

export const sendTransaction = async (provider, toAddress, amount, network = 'ethereum', tokenAddress = null) => {
    try {
      await switchNetwork(provider, network);
      const web3 = new Web3(provider);
      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0];
  
      if (tokenAddress) {
        // Handle ERC-20 token transfer
        const tokenContract = new web3.eth.Contract([
          {
            "constant": false,
            "inputs": [
              {
                "name": "_to",
                "type": "address"
              },
              {
                "name": "_value",
                "type": "uint256"
              }
            ],
            "name": "transfer",
            "outputs": [
              {
                "name": "",
                "type": "bool"
              }
            ],
            "type": "function"
          }
        ], tokenAddress);
  
        const amountWei = web3.utils.toWei(amount.toString(), 'ether');
  
        const tx = await tokenContract.methods.transfer(toAddress, amountWei).send({
          from: fromAddress
        });
  
        return tx.transactionHash;
      } else {
        // Handle native ETH transfer
        const amountWei = web3.utils.toWei(amount.toString(), 'ether');
  
        const tx = await web3.eth.sendTransaction({
          from: fromAddress,
          to: toAddress,
          value: amountWei
        });
  
        return tx.transactionHash;
      }
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  };

