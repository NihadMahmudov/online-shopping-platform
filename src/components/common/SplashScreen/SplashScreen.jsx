import React, { useEffect, useState } from 'react';
import styles from './SplashScreen.module.css';

const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState('enter'); // enter -> hold -> exit

  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase('exit'), 2400);
    const doneTimer = setTimeout(() => onFinish(), 3100);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  // Memoize random particle coordinates to keep render pure
  const particles = React.useMemo(() => {
    const coords = [
      { top: '15%', left: '10%' },
      { top: '35%', left: '85%' },
      { top: '75%', left: '20%' },
      { top: '50%', left: '75%' },
      { top: '80%', left: '50%' },
      { top: '25%', left: '60%' },
      { top: '65%', left: '15%' },
      { top: '45%', left: '30%' }
    ];
    return coords.map((c, i) => ({
      top: c.top,
      left: c.left,
      animationDelay: `${i * 0.15}s`,
      size: `${4 + (i % 3) * 3}px`
    }));
  }, []);

  return (
    <div className={`${styles.splash} ${phase === 'exit' ? styles.exit : ''}`}>
      <div className={styles.content}>
        {/* Brand name only */}
        <div className={styles.brandWrap}>
          <h1 className={styles.brandName}>
            {'Atlas Mall'.split('').map((char, i) => (
              <span key={i} className={styles.letter} style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
        </div>
      </div>

      {/* Particle dots */}
      {particles.map((p, i) => (
        <div key={i} className={styles.particle} style={{
          top: p.top,
          left: p.left,
          animationDelay: p.animationDelay,
          width: p.size,
          height: p.size,
        }} />
      ))}
    </div>
  );
};

export default SplashScreen;
