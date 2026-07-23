import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import BottomBar from '../BottomBar/BottomBar';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  return (
    <div className={styles.layoutWrapper}>
      <Navbar />
      <main className={styles.mainContent}>
        {children}
      </main>
      <Footer />
      <BottomBar />
    </div>
  );
};

export default Layout;
