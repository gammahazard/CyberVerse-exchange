import styles from '../../styles/termsModal.module.css';

export default function TermsModal({ onAccept, onDecline }) {
  return (
    <div className={styles.modal}>
      <div className={styles.content}>
        <h2 className={styles.title}>Terms and Conditions</h2>
        <div className={styles.scroll}>
          <p>Exchange services provided by Changelly. By clicking &quot;Accept&quot;, I acknowledge and understand that my transaction may trigger AML/KYC verification according to Changelly AML/KYC.</p>
          <p>By accepting these terms you confirm are NOT in, under the control of, or a national or resident of any country where crypto assets transactions are explicitly prohibited or United States of America (including all USA territories like Puerto Rico, American Samoa, Guam, Northern Mariana Island, and the US Virgin Islands (St. Croix, St. John and St. Thomas) (&quot;Restricted Locations&quot;). Changelly does not operate in Restricted Locations.</p>
          <h3>Please be aware:</h3>
          <ul>
            <li>Due to AML/KYC policy, users&apos; transactions may be held for KYC procedures.</li>
            <li>If your transaction gets &apos;hold&apos; status, please contact the Changelly security team at compliance@changelly.com to pass the KYC procedure.</li>
            <li>If you face any other issues, please contact support at support@changelly.com.</li>
         
          </ul>
          <p>For more information, please read:</p>
          <ul>
            <li><a className={styles.changellylink} href="https://changelly.com/terms-of-use" target="_blank" rel="noopener noreferrer">Changelly&apos;s Terms of Service</a></li>
            <li><a className={styles.changellylink} href="https://changelly.com/privacy-policy" target="_blank" rel="noopener noreferrer">Changelly&apos;s Privacy Policy</a></li>
          </ul>
        </div>
        <div className={styles.actions}>
          <button onClick={onAccept} className={`${styles.button} ${styles.acceptButton}`}>Accept</button>
          <button onClick={onDecline} className={`${styles.button} ${styles.declineButton}`}>Decline</button>
        </div>
      </div>
    </div>
  );
}
