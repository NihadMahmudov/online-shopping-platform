import React, { useState, useEffect } from 'react';
import styles from './CountdownTimer.module.css';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        hours: Math.floor((distance / (1000 * 60 * 60))),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={styles.timer}>
      <div className={styles.timeBox}>
        <span className={styles.number}>{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className={styles.label}>SAAT</span>
      </div>
      <span className={styles.separator}>:</span>
      <div className={styles.timeBox}>
        <span className={styles.number}>{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className={styles.label}>DƏQ</span>
      </div>
      <span className={styles.separator}>:</span>
      <div className={styles.timeBox}>
        <span className={styles.number}>{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className={styles.label}>SAN</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
