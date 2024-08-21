// components/LandingPage/Title.js
import React from 'react';
import styles from '../../styles/Landing.module.css';
import LaunchButton from './LaunchButton';

export default function Title({ onLaunch }) {
  return (
    <div className={styles.content}>
      <h1 className={styles.title}>
        <span className={styles.titleGlow}>Cyberia Exchange</span>
      </h1>
      <span className={styles.titleSub}>
        Exchange 500+ tokens across almost 20+ chains!
      </span>
      <div className={styles.launchButtonContainer}>
        <LaunchButton onClick={onLaunch} />
      </div>
    </div>
  );
}
