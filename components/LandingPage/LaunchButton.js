import React, { useState } from 'react';
import styles from '../../styles/Landing.module.css';

export default function LaunchButton({ onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className={styles.launchButton}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animation: isHovered ? 'bounceIn 0.5s' : 'pulseGlow 2s infinite'
      }}
    >
      <span className={styles.buttonText}>Launch App</span>
    </button>
  );
}