export default function useChangelly() {
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;




//parse error messages to show user max and min amounts more clearly
const parseErrorMessage = (error) => {
    const maxAmountRegex = /Maximum amount is (\d+(\.\d+)?)\s+(\w+)/i;
    const minAmountRegex = /Minimal amount is (\d+(\.\d+)?)\s+(\w+)/i;
    
    const maxMatch = error.match(maxAmountRegex);
    if (maxMatch) {
        const [, amount, , asset] = maxMatch;
        return `MAXIMUM AMOUNT IS ${amount} ${asset.toUpperCase()}`;
    }
    
    const minMatch = error.match(minAmountRegex);
    if (minMatch) {
        const [, amount, , asset] = minMatch;
        return `MINIMUM AMOUNT IS ${amount} ${asset.toUpperCase()}`;
    }
    
    return error; // Return the original error if it doesn't match either format
};


//
const getCurrencies = async () => {
    try {
        const response = await fetch(`${API_URL}/currencies`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Raw response:', data);
        
        if (!data.result || !Array.isArray(data.result)) {
            throw new Error('Invalid data structure');
        }
        return data.result; // Return just the array of currencies
    } catch (error) {
        console.error('Error fetching currencies:', error);
        throw error;
    }
};
// estimate rates
const estimateFloatingRate = async (from, to, amountFrom) => {
    try {
        const response = await fetch(`${API_URL}/estimateFloatingRate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ from, to, amountFrom }),
        });
        const data = await response.json();
        console.log('Floating rate estimate response:', data);
        
        if (response.ok && data.result && data.result.length > 0) {
            return {
                amountTo: data.result[0].amountTo,
                networkFee: data.result[0].networkFee || '0', // Include networkFee, default to '0' if not present
                visibleAmount: data.result[0].visibleAmount || data.result[0].amountTo // Include visibleAmount if available
            };
        } else if (data.error) {
            console.error('Changelly API Error:', data.error);
            throw new Error(parseErrorMessage(data.error));
        } else {
            throw new Error('Failed to estimate floating rate');
        }
    } catch (error) {
        console.error('Error estimating floating rate:', error.message || error);
        throw error;
    }
};

const estimateFixedRate = async (from, to, amountFrom) => {
    try {
        const response = await fetch(`${API_URL}/estimateFixedRate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ from, to, amountFrom }),
        });
        const data = await response.json();
        console.log('Fixed rate estimate response:', data);
        
        if (response.ok && data.result && data.result.length > 0) {
            return {
                amountTo: data.result[0].amountTo,
                rateId: data.result[0].id,
                min: data.result[0].min,
                max: data.result[0].max,
                networkFee: data.result[0].networkFee || '0', // Include networkFee, default to '0' if not present
            };
        } else if (data.error) {
            console.error('Changelly API Error:', data.error);
            throw new Error(parseErrorMessage(data.error));
        } else {
            throw new Error('Failed to estimate fixed rate');
        }
    } catch (error) {
        console.error('Error estimating fixed rate:', error.message || error);
        throw error;
    }
};


//create tx to send to changelly 
const createTransaction = async ({ from, to, amount, address, refundAddress, rateType, rateId }) => {
    try {
        const method = rateType === 'fixed' ? 'createFixTransaction' : 'createTransaction';
        let bodyParams;

        if (rateType === 'fixed') {
            bodyParams = {
                from: from.toLowerCase(),
                to: to.toLowerCase(),
                amountFrom: amount.toString(),
                address,
                rateId,
                refundAddress
            };
        } else {
            bodyParams = {
                from: from.toLowerCase(),
                to: to.toLowerCase(),
                amount: amount.toString(),
                address,
                refundAddress
            };
        }

        console.log(`Sending ${method} request with params:`, bodyParams);

        const response = await fetch(`${API_URL}/${method}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyParams),
        });

        const data = await response.json();
        console.log('Create transaction response:', data);

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        if (data.error) {
            throw new Error(data.error.message || 'Unknown API error');
        }

        return data.result;
    } catch (error) {
        console.error(`Error in ${rateType} transaction creation:`, error);
        throw error;
    }
};


// validate address input
    const validateAddress = async (currency, address, extraId = null) => {
        try {
            const response = await fetch(`${API_URL}/validateAddress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ currency, address, extraId }),
            });
            const data = await response.json();
            console.log('Validate address response:', data);

            if (response.ok && data.result) {
                return data.result;
            } else {
                throw new Error(data.error || 'Failed to validate address');
            }
        } catch (error) {
            console.error('Error validating address:', error.message || error);
            throw error; // Ensure the specific error message is passed up the call stack
        }
    };


//get status of a sent transaction
const getStatus = async (transactionId) => {
    try {
        const response = await fetch(`${API_URL}/getStatus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: transactionId }),
        });
        const data = await response.json();
        console.log('Get status response:', data);

        if (response.ok && data.result) {
            return data.result;
        } else {
            throw new Error(data.error || 'Failed to get transaction status');
        }
    } catch (error) {
        console.error('Error getting transaction status:', error.message || error);
        throw error;
    }
};


//search tx
const searchTransactions = async (payoutAddress) => {
    try {
      const response = await fetch(`${API_URL}/searchTransactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payoutAddress }),
      });
      const data = await response.json();
      console.log('Search transactions response:', data);

      if (response.ok && data.result) {
        return data.result;
      } else {
        throw new Error(data.error || 'Failed to search transactions');
      }
    } catch (error) {
      console.error('Error searching transactions:', error.message || error);
      throw error;
    }
  };

  // get pairs
  const getPairs = async (from, to, txType) => {
    try {
        const response = await fetch(`${API_URL}/getPairs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ from, to, txType }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to get pairs');
        }
        return data.result;
    } catch (error) {
        console.error('Error getting pairs:', error.message || error);
        throw error;
    }
};

const getCurrenciesFull = async () => {
    try {
        const response = await fetch(`${API_URL}/currenciesFull`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('FULL CURRENCY INFO:', data)
        return data.result;
    } catch (error) {
        console.error('Error fetching full currency information:', error);
        throw error;
    }
};

return { 
    getCurrencies, 
    estimateFloatingRate, 
    estimateFixedRate, 
    createTransaction, 
    validateAddress, 
    getStatus, 
    searchTransactions, 
    getPairs, 
    getCurrenciesFull,// Don't forget to return this function
    parseErrorMessage // Add this line

};
}
