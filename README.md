# Multi-Chain Bridge Aggregator (Changelly API)

![Status](https://img.shields.io/badge/Status-Archived_Reference-grey?style=for-the-badge)
![Integration](https://img.shields.io/badge/API-Changelly_Commercial-blue?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Model-Non__Custodial-green?style=for-the-badge)

A commercial-grade interface for the Changelly bridging protocol. This application allowed users to execute cross-chain asset swaps (e.g., SOL to ADA) directly between their own self-custody wallets, bypassing the need for centralized exchange accounts.

> **Note:** Originally developed for CyberVerse. This project is archived—API keys have been rotated and the live deployment is offline. This repository serves as a reference implementation for **Financial API Integration** and **Multi-Chain Wallet Architecture**.

---

## 🏗 Architectural Logic

The application functioned as a secure orchestration layer between the user's wallet and the Changelly settlement engine.

### 1. The Integration Layer
* **API Handshake:** Implemented the full Changelly commercial standard for transaction creation, rate calculation, and KYC flagging.
* **State Polling:** Custom hook architecture (`useChangelly.js`) polling transaction status (`waiting` → `confirming` → `exchanging` → `finished`) with real-time UI updates.

### 2. Multi-Chain Wallet Support
Direct connection to diverse ecosystem wallets:

| Chain | Wallets Supported |
| :--- | :--- |
| **EVM** | Metamask, WalletConnect |
| **Solana** | Phantom, Solflare |
| **Cardano** | Nami, Eternl |
| **UTXO** | Ergo DApp Connector |

### 3. Zero-Liability Design
The application was architected to be **Non-Custodial**.
* **Flow:** User signs tx → Assets move to Changelly → Bridge executes → Assets move to User.
* **Security:** No private keys or funds stored—strictly a UI passthrough for the API.

---

## 📁 Project Structure

```
CyberVerse-exchange/
├── components/
│   ├── CurrencySelector/     # Asset selection UI
│   ├── ExchangeForm/         # Swap interface
│   ├── PaymentInfo/          # Address display
│   ├── TransactionStatus/    # Real-time status
│   └── TermsModal/           # Legal compliance
├── hooks/
│   └── useChangelly.js       # API integration & polling
├── wallets/
│   ├── cardano/              # Nami/Eternl connector
│   ├── ergo/                 # Ergo DApp connector
│   ├── ethereum/             # MetaMask connector
│   └── solana/               # Phantom connector
├── pages/                    # Next.js routes
├── styles/                   # CSS Modules
└── public/                   # Static assets
```

---

## 🚀 Key Features

* **Dynamic Rate Estimation:** Real-time fetch of exchange rates and network fees across 50+ blockchains.
* **Transaction Persistence:** LocalStorage history allowing users to track pending swaps across browser sessions.
* **Error Handling:** Robust handling of API timeouts, slippage errors, and network congestion.

---

## 📂 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js (React) |
| **Language** | JavaScript (ES6+) |
| **Styling** | CSS Modules |
| **API** | Axios / Changelly API |
| **State** | React Hooks (Custom Polling) |

---

<div align="center">
  <sub>Developed by <a href="https://github.com/gammahazard">Vanguard Secure Solutions</a></sub>
</div>
