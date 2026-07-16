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
    return [...Array(8)].map((_, i) => ({
      top: `${10 + Math.random() * 80}%`,
      left: `${5 + Math.random() * 90}%`,
      animationDelay: `${i * 0.15}s`,
      size: `${4 + (i % 3) * 3}px`
    }));
  }, []);

  return (
    <div className={`${styles.splash} ${phase === 'exit' ? styles.exit : ''}`}>
      <div className={styles.content}>
        {/* Logo / Brand mark */}
        <div className={`${styles.logoRing} ${phase !== 'enter' ? styles.ringVisible : ''}`}>
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="36" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="226" className={styles.ringCircle}/>
            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="#D4AF37" fontSize="22" fontFamily="Playfair Display, serif" fontWeight="700">A</text>
          </svg>
        </div>

        {/* Brand name */}
        <div className={styles.brandWrap}>
          <h1 className={styles.brandName}>
            {'Atlas'.split('').map((char, i) => (
              <span key={i} className={styles.letter} style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                {char}
              </span>
            ))}
          </h1>
          <p className={styles.tagline}>
            <span className={styles.taglineInner}>Mall</span>
          </p>
        </div>

        {/* Decorative line */}
        <div className={styles.divider}>
          <span className={styles.dividerLine}></span>
          <span className={styles.dividerDot}></span>
          <span className={styles.dividerLine}></span>
        </div>

        {/* Sub-tagline */}
        <p className={styles.sub}>Hər Bir Hədiyyə Bir Hekayədir</p>
      </div>

      {/* Creator Credit with drawing signature */}
      <div className={styles.creatorSignature}>
        <span className={styles.creatorText}>created by</span>
        <span className={styles.signatureName}>Nihad Mahmudov</span>
        <svg className={styles.signatureStroke} viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 10 10 C 60 2, 140 2, 190 10 C 130 18, 50 15, 120 4" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeDasharray="300" strokeDashoffset="300" className={styles.strokePath} />
        </svg>
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
