import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import styles from './Auth.module.css';

const Auth = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    
    let result;
    if (mode === 'register') {
      result = register(form.name, form.email, form.password);
    } else {
      result = login(form.email, form.password);
    }

    if (result.error) {
      setError(result.error);
      return;
    }

    const userRole = result.user.role;
    if (userRole === 'admin') {
      navigate('/dashboard');
    } else {
      navigate('/panel');
    }
  };

  return (
    <div className={styles.page}>
      {/* Mobile Back Button (only shown when leftPanel is hidden) */}
      <div className={styles.mobileTopBar}>
        <Link to="/" className={styles.mobileBackBtn}>
          <ArrowLeft size={18} /> Ana Səhifə
        </Link>
        <div className={styles.mobileLogo}>BAME<span>.</span></div>
      </div>

      {/* Left Panel — Branding */}
      <div className={styles.leftPanel}>
        <div className={styles.brandContent}>
          <Link to="/" className={styles.backBtn}>
            <ArrowLeft size={18} /> Ana Səhifəyə Qayıt
          </Link>
          <div className={styles.brandLogo}>BAME<span>.</span></div>
          <h2>Eksklüziv Hədiyyə Dünyasına Xoş Gəldiniz</h2>
          <p>Hesabınızla sifarişlərinizi izləyin, sevdiklərinizi saxlayın və daha çox imtiyazdan yararlanın.</p>
          <div className={styles.features}>
            <div className={styles.feature}>✦ Eksklüziv endirimlər</div>
            <div className={styles.feature}>✦ Sürətli çatdırılma izləmə</div>
            <div className={styles.feature}>✦ Bəyəndiklərim siyahısı</div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>
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

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={handleSubmit}
              className={styles.form}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.formHeader}>
                <h1>{mode === 'login' ? 'Xoş Gəldiniz!' : 'Hesab Yaradın'}</h1>
                <p>{mode === 'login' ? 'Hesabınıza daxil olun' : 'Qeydiyyatdan keçin, pulsuz!'}</p>
                {error && <div className={styles.errorMessage}>{error}</div>}
              </div>

              {mode === 'register' && (
                <div className={styles.inputGroup}>
                  <label>Ad Soyad</label>
                  <div className={styles.inputBox}>
                    <User size={18} />
                    <input
                      type="text"
                      name="name"
                      placeholder="Adınızı daxil edin"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              <div className={styles.inputGroup}>
                <label>E-poçt</label>
                <div className={styles.inputBox}>
                  <Mail size={18} />
                  <input
                    type="email"
                    name="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>
                  Şifrə
                  {mode === 'login' && (
                    <span className={styles.forgot}>Şifrəni unutdunuz?</span>
                  )}
                </label>
                <div className={styles.inputBox}>
                  <Lock size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
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
              </div>

              <button type="submit" className={styles.submitBtn}>
                {mode === 'login' ? 'Daxil Ol' : 'Qeydiyyatdan Keç'}
              </button>

              <div className={styles.divider}>
                <span>və ya</span>
              </div>

              <button
                type="button"
                className={styles.demoBtn}
                onClick={() => {
                  login('qonaq@bame.az', 'qonaq');
                  navigate('/panel');
                }}
              >
                Qonaq kimi daxil ol (Sürətli)
              </button>

              <p className={styles.switchMode}>
                {mode === 'login' ? 'Hesabınız yoxdur?' : 'Artıq hesabınız var?'}
                <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                  {mode === 'login' ? ' Qeydiyyat →' : ' Giriş →'}
                </button>
              </p>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;
