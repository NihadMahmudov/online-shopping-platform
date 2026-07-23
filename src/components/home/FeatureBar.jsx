import React from 'react';
import { Truck, Gift, ShieldCheck, Sparkles } from 'lucide-react';
import styles from './FeatureBar.module.css';

const FeatureBar = () => {
  const features = [
    {
      icon: <Truck size={24} className={styles.icon} />,
      title: 'Sürətli Çatdırılma',
      desc: 'Mingəçevir daxili operativ çatdırılma xidməti'
    },
    {
      icon: <Gift size={24} className={styles.icon} />,
      title: 'Premium Qablaşdırma',
      desc: 'Hər bir sifarişinizə xüsusi hədiyyə paketi pulsuz'
    },
    {
      icon: <ShieldCheck size={24} className={styles.icon} />,
      title: '100% Güvənli Ödəniş',
      desc: 'Kart və nağd ödənişlərlə tam təhlükəsiz alış-veriş'
    },
    {
      icon: <Sparkles size={24} className={styles.icon} />,
      title: 'Eksklüziv Əl İşləri',
      desc: 'AtlasMall platforması tərəfindən seçilmiş xüsusi dizaynlar'
    }
  ];

  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        {features.map((feature, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.iconWrapper}>
              {feature.icon}
            </div>
            <div className={styles.info}>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureBar;
