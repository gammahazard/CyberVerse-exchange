declare module '@meshsdk/core' {
    export class MeshTxBuilder {
      constructor(options: any);
      txOut(address: string, amount: Array<{unit: string, quantity: string}>): this;
      changeAddress(address: string): this;
      selectUtxosFrom(utxos: any[]): this;
      complete(): Promise<string>;
    }
  
    export class BlockfrostProvider {
      constructor(apiKey: string);
    }
  
    export class Transaction {
      constructor(options: any);
      sendLovelace(address: string, lovelace: string): this;
      setChangeAddress(address: string): this;
      build(): Promise<string>;
    }
  
    export class BrowserWallet {
      static enable(walletName: string): Promise<any>;
    }
  }
  
  declare module '@meshsdk/react' {
    export function useWallet(): {
      wallet: any;
      connected: boolean;
      name: string;
      connecting: boolean;
      connect: (walletName: string) => Promise<void>;
      disconnect: () => void;
      error: Error | null;
    };
  
    export function MeshProvider(props: { children: React.ReactNode }): JSX.Element;
  }