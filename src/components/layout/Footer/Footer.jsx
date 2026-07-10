import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Share2, MessageCircle, Mail, MapPin, Phone } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div className={styles.info}>
          <div className={styles.logo}>
            BAME<span>.</span>
          </div>
          <p>Unudulmaz anlar üçün ən zərif hədiyyələrin tək ünvanı. Biz hər bir detala sevgi ilə yanaşırıq.</p>
          <div className={styles.socials}>
            <a href="#"><Globe size={20} /></a>
            <a href="#"><Share2 size={20} /></a>
            <a href="#"><MessageCircle size={20} /></a>
          </div>
        </div>

        <div className={styles.links}>
          <h3>Sürətli Keçidlər</h3>
          <ul>
            <li><Link to="/">Ana Səhifə</Link></li>
            <li><Link to="/shop">Kolleksiyalar</Link></li>
            <li><Link to="/about">Haqqımızda</Link></li>
            <li><Link to="/contact">Əlaqə</Link></li>
          </ul>
        </div>

        <div className={styles.contact}>
          <h3>Əlaqə</h3>
          <ul>
            <li><MapPin size={18} /> Bakı şəhəri, Nizami küç. 45</li>
            <li><Phone size={18} /> +994 50 123 45 67</li>
            <li><Mail size={18} /> info@bamegift.com</li>
          </ul>
        </div>

        <div className={styles.newsletter}>
          <h3>Yeniliklərdən Xəbərdar Ol</h3>
          <p>Yeni kolleksiyalar və endirimlər üçün abunə olun.</p>
          <form className={styles.subscribeForm}>
            <input type="email" placeholder="E-poçt ünvanınız" />
            <button type="submit">Abunə Ol</button>
          </form>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} BAME Gift Shop. Bütün hüquqlar qorunur.</p>
      </div>
    </footer>
  );
};

export default Footer;
