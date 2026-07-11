import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Store } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400)); // smooth UX delay

    let result;
    if (mode === 'register') {
      result = register(form.name, form.email, form.password);
    } else {
      result = login(form.email, form.password);
    }
    setLoading(false);

    if (result.error) { setError(result.error); return; }

    const role = result.user.role;
    if (role === 'superadmin') navigate('/dashboard');
    else if (role === 'vendor') navigate('/store-dashboard');
    else navigate('/panel');
  };

  return (
    <div className={styles.page}>
      {/* Mobile Top Bar */}
      <div className={styles.mobileTopBar}>
        <Link to="/" className={styles.mobileBackBtn}>
          <ArrowLeft size={18} /> Ana Səhifə
        </Link>
        <div className={styles.mobileLogo}>Atlas<span>Mall</span></div>
      </div>

      {/* Left Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.brandContent}>
          <Link to="/" className={styles.backBtn}>
            <ArrowLeft size={18} /> Ana Səhifəyə Qayıt
          </Link>
          <div className={styles.brandLogo}>Atlas<span>Mall</span></div>
          <h2>Ən Yaxşı Mağazalar Bir Platformada</h2>
          <p>Hesabınızla sifarişlərinizi izləyin, sevimlilərə əlavə edin və xüsusi endirimlər qazanın.</p>
          <div className={styles.features}>
            <div className={styles.feature}>✦ Yüzlərlə Mağaza, Minlərlə Məhsul</div>
            <div className={styles.feature}>✦ Sürətli &amp; Təhlükəsiz Ödəniş</div>
            <div className={styles.feature}>✦ Sifariş İzləmə &amp; Tarix</div>
          </div>

          {/* Store owner CTA */}
          <Link to="/store-login" className={styles.vendorCta}>
            <Store size={18} />
            <div>
              <strong>Mağaza Sahibisiniz?</strong>
              <span>Öz mağazanızı açın →</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${mode === 'login' ? styles.activeTab : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Giriş
            </button>
            <button
              className={`${styles.tab} ${mode === 'register' ? styles.activeTab : ''}`}
              onClick={() => { setMode('register'); setError(''); }}
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
              transition={{ duration: 0.22 }}
            >
              <div className={styles.formHeader}>
                <h1>{mode === 'login' ? 'Xoş Gəldiniz!' : 'Hesab Yaradın'}</h1>
                <p>{mode === 'login' ? 'AtlasMall hesabınıza daxil olun' : 'Qeydiyyatdan keçin, pulsuz!'}</p>
                {error && <div className={styles.errorMessage}>{error}</div>}
              </div>

              {mode === 'register' && (
                <div className={styles.inputGroup}>
                  <label>Ad Soyad</label>
                  <div className={styles.inputBox}>
                    <User size={18} />
                    <input type="text" name="name" placeholder="Adınızı daxil edin"
                      value={form.name} onChange={handleChange} required />
                  </div>
                </div>
              )}

              <div className={styles.inputGroup}>
                <label>E-poçt</label>
                <div className={styles.inputBox}>
                  <Mail size={18} />
                  <input type="email" name="email" placeholder="email@example.com"
                    value={form.email} onChange={handleChange} required />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>
                  Şifrə
                  {mode === 'login' && <span className={styles.forgot}>Şifrəni unutdunuz?</span>}
                </label>
                <div className={styles.inputBox}>
                  <Lock size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" placeholder="••••••••"
                    value={form.password} onChange={handleChange} required
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : (mode === 'login' ? 'Daxil Ol' : 'Qeydiyyatdan Keç')}
              </button>

              <div className={styles.divider}><span>və ya</span></div>

              <button type="button" className={styles.demoBtn} onClick={() => {
                login('qonaq@atlasmall.az', 'qonaq123');
                navigate('/panel');
              }}>
                Qonaq kimi daxil ol (Sürətli)
              </button>

              <p className={styles.switchMode}>
                {mode === 'login' ? 'Hesabınız yoxdur?' : 'Artıq hesabınız var?'}
                <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
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
