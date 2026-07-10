import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Gift } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import styles from './AuthModal.module.css';

const AuthModal = ({ isOpen, onClose, message = '' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      let result;
      if (mode === 'login') {
        result = login(form.email, form.password);
      } else {
        if (!form.name) { setError('Ad daxil edin.'); setLoading(false); return; }
        result = register(form.name, form.email, form.password);
      }

      if (result?.error) {
        setError(result.error);
      } else {
        onClose(true); // true = success, action should proceed
      }
      setLoading(false);
    }, 400);
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose(false);
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>
        {/* Close */}
        <button className={styles.closeBtn} onClick={() => onClose(false)}>
          <X size={20} />
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Gift size={28} />
          </div>
          {message && <p className={styles.actionMessage}>{message}</p>}
          <h2>{mode === 'login' ? 'Xoş Gəldiniz!' : 'Hesab Yarat'}</h2>
          <p className={styles.subtitle}>
            {mode === 'login'
              ? 'Davam etmək üçün hesabınıza daxil olun.'
              : 'Bame ailəsinə qoşulun.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <div className={styles.field}>
              <User size={17} className={styles.fieldIcon} />
              <input
                type="text"
                placeholder="Adınız"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}

          <div className={styles.field}>
            <Mail size={17} className={styles.fieldIcon} />
            <input
              type="email"
              placeholder="E-poçt ünvanınız"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className={styles.field}>
            <Lock size={17} className={styles.fieldIcon} />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Şifrə"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : (mode === 'login' ? 'Daxil Ol' : 'Qeydiyyat')}
          </button>
        </form>

        {/* Toggle */}
        <div className={styles.toggle}>
          {mode === 'login' ? (
            <p>Hesabınız yoxdur? <button onClick={() => { setMode('register'); setError(''); }}>Qeydiyyat</button></p>
          ) : (
            <p>Artıq hesabınız var? <button onClick={() => { setMode('login'); setError(''); }}>Daxil Ol</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
