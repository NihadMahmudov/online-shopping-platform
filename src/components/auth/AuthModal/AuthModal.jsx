import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AuthModal.module.css';

const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    // TODO: Supabase auth bağlantısı
    alert(mode === 'login' ? 'Giriş uğurludur!' : 'Qeydiyyat uğurludur!');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>

            <div className={styles.logoArea}>
              <span className={styles.logo}>Atlas<span>Mall</span></span>
            </div>

            {/* Tab Switcher */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${mode === 'login' ? styles.activeTab : ''}`}
                onClick={() => setMode('login')}
              >
                Giriş
              </button>
              <button
                className={`${styles.tab} ${mode === 'register' ? styles.activeTab : ''}`}
                onClick={() => setMode('register')}
              >
                Qeydiyyat
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {mode === 'register' && (
                    <div className={styles.inputGroup}>
                      <User size={18} />
                      <input
                        type="text"
                        name="name"
                        placeholder="Ad Soyad"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}
                  <div className={styles.inputGroup}>
                    <Mail size={18} />
                    <input
                      type="email"
                      name="email"
                      placeholder="E-poçt"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <Lock size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Şifrə"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {mode === 'login' && (
                    <p className={styles.forgotPassword}>Şifrəni unutdunuz?</p>
                  )}
                </motion.div>
              </AnimatePresence>

              <button type="submit" className={styles.submitBtn}>
                {mode === 'login' ? 'Daxil Ol' : 'Qeydiyyatdan Keç'}
              </button>
            </form>

            <p className={styles.switchMode}>
              {mode === 'login' ? 'Hesabınız yoxdur?' : 'Artıq hesabınız var?'}
              <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                {mode === 'login' ? ' Qeydiyyat' : ' Giriş'}
              </button>
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
