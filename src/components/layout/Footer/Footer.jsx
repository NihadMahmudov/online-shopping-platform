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
            Atlas<span>Mall</span>
          </div>
          <p>Yüzlərlə fərqli mağaza və minlərlə məhsul çeşidi ilə xidmətinizdə olan vahid satış platforması.</p>
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
            <li><MapPin size={18} /> Mingəçevir şəhəri, H.Əliyev pr. 12</li>
            <li><Phone size={18} /> +994 50 123 45 67</li>
            <li><Mail size={18} /> info@atlasmall.com</li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} AtlasMall Platforması. Bütün hüquqlar qorunur.</p>
      </div>
    </footer>
  );
};

export default Footer;
