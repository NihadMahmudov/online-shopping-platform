import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Store, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import styles from './Auth.module.css';

const Auth = () => {
  const navigate = useNavigate();
  const { register, login, loginAsGuest, logout, sendVerificationCode, verifyEmailCode } = useAuth();
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    setLoading(true);

    const res = await sendVerificationCode(form.email);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
      return;
    }

    setIsVerifying(true);
    if (res?.devCode) {
      setInfoMsg(`Kod e-poçtunuza göndərildi (Demo Kod: ${res.devCode})`);
    } else {
      setInfoMsg('6 rəqəmli təsdiqləmə kodu Gmail ünvanınıza göndərildi. Qutunu yoxlayın.');
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const verifyRes = await verifyEmailCode(form.email, verificationCode);
    if (verifyRes?.error) {
      setLoading(false);
      setError(verifyRes.error);
      return;
    }

    const regRes = await register(form.name, form.email, form.password);
    setLoading(false);

    if (regRes?.error) {
      setError(regRes.error);
      return;
    }

    const role = regRes?.user?.role;
    if (role === 'superadmin') navigate('/dashboard');
    else if (role === 'vendor') navigate('/store-dashboard');
    else navigate('/panel');
  };

  const handleSubmit = async e => {
    if (mode === 'register') {
      if (!isVerifying) {
        await handleSendCode(e);
      } else {
        await handleVerifyAndRegister(e);
      }
      return;
    }

    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(form.email, form.password);
    setLoading(false);

    if (result?.error) { setError(result.error); return; }

    const role = result?.user?.role;
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
                <h1>{mode === 'login' ? 'Xoş Gəldiniz!' : (isVerifying ? 'E-poçtu Təsdiqləyin' : 'Hesab Yaradın')}</h1>
                <p>{mode === 'login' ? 'AtlasMall hesabınıza daxil olun' : (isVerifying ? `${form.email} ünvanına daxil edilmiş 6 rəqəmli kodu yazın` : 'Qeydiyyatdan keçin, pulsuz!')}</p>
                {error && <div className={styles.errorMessage}>{error}</div>}
                {infoMsg && <div style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '12px', lineHeight: '1.4' }}>{infoMsg}</div>}
              </div>

              {mode === 'register' && !isVerifying && (
                <>
                  <div className={styles.inputGroup}>
                    <label>Ad Soyad</label>
                    <div className={styles.inputBox}>
                      <User size={18} />
                      <input type="text" name="name" placeholder="Adınızı daxil edin"
                        value={form.name} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>E-poçt (Gmail)</label>
                    <div className={styles.inputBox}>
                      <Mail size={18} />
                      <input type="email" name="email" placeholder="email@example.com"
                        value={form.email} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Şifrə</label>
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
                </>
              )}

              {mode === 'register' && isVerifying && (
                <div className={styles.inputGroup}>
                  <label>6 Rəqəmli Təsdiqləmə Kodu</label>
                  <div className={styles.inputBox}>
                    <ShieldCheck size={18} color="#D4AF37" />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      style={{ letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 'bold' }}
                      value={verificationCode}
                      onChange={e => setVerificationCode(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <button type="button" onClick={() => setIsVerifying(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem' }}>
                      ← Məlumatları dəyiş
                    </button>
                    <button type="button" onClick={handleSendCode} style={{ background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <RefreshCw size={12} /> Yenidən kod göndər
                    </button>
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <>
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
                      <span className={styles.forgot}>Şifrəni unutdunuz?</span>
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
                </>
              )}

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : (mode === 'login' ? 'Daxil Ol' : (isVerifying ? 'Təsdiqlə və Qeydiyyatı Tamamla' : 'Təsdiqləmə Kodu Göndər'))}
              </button>

              <div className={styles.divider}><span>və ya</span></div>

              {/* Secondary CTA Button to switch between Login / Register */}
              <button 
                type="button" 
                className={styles.secondaryCtaBtn} 
                onClick={() => { 
                  setMode(mode === 'login' ? 'register' : 'login'); 
                  setError(''); 
                  setIsVerifying(false);
                }}
              >
                {mode === 'login' ? 'Hesab yaradın (Qeydiyyat)' : 'Artıq hesabınız var? Daxil ol'}
              </button>

              {/* Tertiary Guest Option */}
              <div className={styles.guestBox}>
                <span>Hesabsız davam etmək istəyirsiniz?</span>
                <button 
                  type="button" 
                  className={styles.guestLink} 
                  onClick={() => {
                    loginAsGuest();
                    navigate('/');
                  }}
                >
                  Qonaq kimi davam et →
                </button>
              </div>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;
