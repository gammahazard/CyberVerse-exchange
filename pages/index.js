import { useState, useEffect } from 'react';
import Title from '../components/LandingPage/Title';
import TermsModal from '../components/TermsModal/TermsModal';
import styles from '../styles/Landing.module.css';

export default function Home() {
  const [showTerms, setShowTerms] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const termsAccepted = localStorage.getItem('termsAccepted');
    if (termsAccepted) {
      setAccepted(true);
    }
  }, []);

  const handleLaunch = () => {
    if (accepted) {
      window.location.href = '/main';
    } else {
      setShowTerms(true);
    }
  };

  const handleAccept = () => {
    localStorage.setItem('termsAccepted', 'true');
    setAccepted(true);
    setShowTerms(false);
    window.location.href = '/main';
  };

  return (
    <div className={styles.container}>
      <Title onLaunch={handleLaunch} />
      {showTerms && <TermsModal onAccept={handleAccept} onDecline={() => setShowTerms(false)} />}
    </div>
  );
}