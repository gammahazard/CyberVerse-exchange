import styles from '../../styles/Home.module.css';

export default function LaunchButton({ onClick }) {
  return (
    <button className={styles.launchButton} onClick={onClick}>
      <span className={styles.buttonText}>Launch App</span>
    </button>
  );
}