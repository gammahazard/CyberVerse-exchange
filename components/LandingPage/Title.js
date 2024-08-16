import styles from '../../styles/Home.module.css';

export default function Title() {
  return (
    <h1 className={styles.title}>
      <span className={styles.titleGlow}>CyberVerse</span>
      <span className={styles.titleSub}>Exchange</span>
    </h1>
  );
}