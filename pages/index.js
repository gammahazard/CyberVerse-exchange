import { useState, useEffect } from 'react';
import Title from '../components/LandingPage/Title';
import LaunchButton from '../components/LandingPage/LaunchButton';
import TermsModal from '../components/TermsModal/TermsModal';
import styles from '../styles/Home.module.css';

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
      <div className={styles.content}>
        <Title />
        <LaunchButton onClick={handleLaunch} />
      </div>
      {showTerms && <TermsModal onAccept={handleAccept} onDecline={() => setShowTerms(false)} />}
    </div>
  );
}