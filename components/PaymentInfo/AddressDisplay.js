import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { FaClipboard } from 'react-icons/fa';
import styles from '../../styles/AddressDisplay.module.css';

export default function AddressDisplay({ currencyFrom, currencyTo, amountExpectedFrom, amountExpectedTo, payinAddress, payoutAddress, onSent }) {
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
            <td>Payout Address:</td>
            <td>{payoutAddress}</td>
          </tr>
          <tr className={styles.payinRow}>
            <td><strong>Payin Address:</strong></td>
            <td>
              <strong>{payinAddress}</strong>
              <FaClipboard 
                className={styles.clipboardIcon} 
                onClick={handleCopy} 
                title="Copy to clipboard"
              />
              {copied && <span className={styles.copiedNotice}>Copied!</span>}
            </td>
          </tr>
        </tbody>
      </table>
      <div className={styles.qrCodeContainer}>
        <QRCode value={payinAddress} size={128} />
      </div>
      <button onClick={onSent} className={styles.sentButton}>I've sent the funds</button>
    </div>
  );
}
