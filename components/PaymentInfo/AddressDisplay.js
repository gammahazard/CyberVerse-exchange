import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { FaClipboard } from 'react-icons/fa';
import styles from '../../styles/AddressDisplay.module.css';

export default function AddressDisplay({ currencyFrom, currencyTo, amountExpectedFrom, amountExpectedTo, payinAddress, payoutAddress, refundAddress, onSent }) {  // Added refundAddress as a prop
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(payinAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset the copied state after 2 seconds
  };

  return (
    <div className={styles.addressDisplay}>
      <h2>Transaction Details</h2>
      <table className={styles.transactionTable}>
        <tbody>
          <tr>
            <td>You are sending:</td>
            <td>{amountExpectedFrom} {currencyFrom.toUpperCase()}</td>
          </tr>
          <tr>
            <td>To receive:</td>
            <td>{amountExpectedTo} {currencyTo.toUpperCase()}</td>
          </tr>
          <tr>
            <td>Receiving Address:</td>
            <td>{payoutAddress}</td>
          </tr>
        </tbody>
      </table>

      <div className={styles.sendDetails}>
        <p>Please send <strong>{amountExpectedFrom} {currencyFrom.toUpperCase()}</strong> to the address below:</p>
        <div className={styles.payinAddressContainer}>
          <span>{payinAddress}</span>
          <FaClipboard 
            className={styles.clipboardIcon} 
            onClick={handleCopy} 
            title="Copy to clipboard" 
          />
          {copied && <span className={styles.copiedNotice}>Copied!</span>}
        </div>
      </div>

      <div className={styles.qrCodeContainer}>
        <QRCode value={payinAddress} size={160} />
      </div>

      <button onClick={onSent} className={styles.sentButton}>I&apos;ve sent the funds</button>

      {refundAddress && (
        <div className={styles.refundInfo}>
          <p>IN CASE OF TRANSACTION FAILURE FUNDS WILL BE REFUNDED TO {refundAddress}</p>
        </div>
      )}
    </div>
  );
}
