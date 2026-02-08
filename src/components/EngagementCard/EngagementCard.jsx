import styles from './EngagementCard.module.css';

export default function EngagementCard({ icon, text }) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <div className={styles.icon}>{icon}</div>
      </div>
      <div className={styles.bottom}>
        <p className={styles.text}>{text}</p>
      </div>
    </article>
  );
}

