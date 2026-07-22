import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Store, Eye, EyeOff, ArrowLeft, Phone, Tag, User, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import styles from './StoreAuth.module.css';

const STORE_CATEGORIES = [
  'Geyim & Moda', 'Elektronika', 'Hədiyyə & Dekor', 'Qida & İçki',
  'Sağlıq & Gözəllik', 'Kitab & Hobbi', 'İdman & Fitness', 'Uşaq & Oyuncaq',
  'Ev & Bağ', 'Zərgərlik & Aksesuar', 'Digər'
];

const StoreAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, registerVendor } = useAuth();
  const [mode, setMode] = useState(() => {
    return location.state?.mode || 'login';
  });

  const [prevMode, setPrevMode] = useState(location.state?.mode);

  if (location.state?.mode !== prevMode) {
    setPrevMode(location.state?.mode);
    if (location.state?.mode) {
      setMode(location.state.mode);
    }
  }
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // for register: step 1 = basic, step 2 = store details

  const [form, setForm] = useState({
    storeName: '', email: '', password: '', phone: '', category: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result?.error) { setError(result.error); return; }
    if (result?.user?.role !== 'vendor') {
      setError('Bu hesab mağaza hesabı deyil. Müştəri girişi üçün buraya klikləyin.');
      return;
    }
    navigate('/store-dashboard');
  };

  const handleRegisterStep1 = e => {
    e.preventDefault();
    if (!form.storeName || !form.email || !form.password) { setError('Bütün sahələri doldurun.'); return; }
    if (form.password.length < 6) { setError('Şifrə ən azı 6 simvol olmalıdır.'); return; }
    setError('');
    setStep(2);
  };

  const handleRegisterStep2 = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = await registerVendor(form.storeName, form.email, form.password, form.phone, form.category);
    setLoading(false);
    if (result?.error) { setError(result.error); return; }
    setStep(3); // success / pending state
  };

  return (
    <div className={styles.page}>
      {/* Mobile Top Bar */}
      <div className={styles.mobileTopBar}>
        <Link to="/" className={styles.mobileBackBtn}><ArrowLeft size={18} /> Ana Səhifə</Link>
        <div className={styles.mobileLogo}>Atlas<span>Mall</span></div>
      </div>

      {/* Left Branding Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.brandContent}>
          <Link to="/" className={styles.backBtn}><ArrowLeft size={18} /> Ana Səhifəyə Qayıt</Link>
          <div className={styles.brandIcon}><Store size={40} /></div>
          <div className={styles.brandLogo}>Atlas<span>Mall</span></div>
          <h2>Öz Mağazanızı Açın</h2>
          <p>Minlərlə müştəriyə çatın. AtlasMall platformasında mağazanızı açmaq tamamilə pulsuzdur.</p>

          <div className={styles.stepGuide}>
            <div className={styles.stepItem}>
              <div className={styles.stepNum}>1</div>
              <div>
                <strong>Qeydiyyatdan Keçin</strong>
                <span>Mağaza məlumatlarınızı daxil edin</span>
              </div>
            </div>
            <div className={styles.stepConnector} />
            <div className={styles.stepItem}>
              <div className={styles.stepNum}>2</div>
              <div>
                <strong>Təsdiq Gözləyin</strong>
                <span>Komandamız tezliklə yoxlayacaq</span>
              </div>
            </div>
            <div className={styles.stepConnector} />
            <div className={styles.stepItem}>
              <div className={styles.stepNum}>3</div>
              <div>
                <strong>Satışa Başlayın</strong>
                <span>Məhsullarınızı əlavə edin</span>
              </div>
            </div>
          </div>

          <Link to="/login" className={styles.customerCta}>
            <User size={16} /> Müştəri girişi üçün buraya keçin →
          </Link>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${mode === 'login' ? styles.activeTab : ''}`}
              onClick={() => { setMode('login'); setError(''); setStep(1); }}>
              Mağaza Girişi
            </button>
            <button className={`${styles.tab} ${mode === 'register' ? styles.activeTab : ''}`}
              onClick={() => { setMode('register'); setError(''); setStep(1); }}>
              Mağaza Aç
            </button>
          </div>

          <AnimatePresence mode="wait">

            {/* ── LOGIN ── */}
            {mode === 'login' && (
              <motion.form key="login" onSubmit={handleLogin} className={styles.form}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}>
                <div className={styles.formHeader}>
                  <h1>Mağazanıza Daxil Olun</h1>
                  <p>AtlasMall satıcı hesabınıza giriş edin</p>
                  {error && <div className={styles.errorMessage}>{error}</div>}
                </div>

                <div className={styles.inputGroup}>
                  <label>E-poçt</label>
                  <div className={styles.inputBox}>
                    <Mail size={18} />
                    <input type="email" name="email" placeholder="magaza@example.com"
                      value={form.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Şifrə</label>
                  <div className={styles.inputBox}>
                    <Lock size={18} />
                    <input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••"
                      value={form.password} onChange={handleChange} required />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : 'Daxil Ol'}
                </button>

                <p className={styles.switchMode}>
                  Hələ mağazanız yoxdur?
                  <button type="button" onClick={() => { setMode('register'); setError(''); setStep(1); }}>
                    {' '}Mağaza Aç →
                  </button>
                </p>
              </motion.form>
            )}

            {/* ── REGISTER STEP 1 ── */}
            {mode === 'register' && step === 1 && (
              <motion.form key="reg-step1" onSubmit={handleRegisterStep1} className={styles.form}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}>
                <div className={styles.formHeader}>
                  <div className={styles.stepIndicator}>
                    <span className={styles.stepActive}>1</span>
                    <span className={styles.stepDivider} />
                    <span>2</span>
                  </div>
                  <h1>Mağaza Məlumatları</h1>
                  <p>Əsas məlumatlarınızı daxil edin</p>
                  {error && <div className={styles.errorMessage}>{error}</div>}
                </div>

                <div className={styles.inputGroup}>
                  <label>Mağaza Adı</label>
                  <div className={styles.inputBox}>
                    <Store size={18} />
                    <input type="text" name="storeName" placeholder="Məs: Şirniyyat Evi"
                      value={form.storeName} onChange={handleChange} required />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>E-poçt</label>
                  <div className={styles.inputBox}>
                    <Mail size={18} />
                    <input type="email" name="email" placeholder="magaza@example.com"
                      value={form.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Şifrə</label>
                  <div className={styles.inputBox}>
                    <Lock size={18} />
                    <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Ən azı 6 simvol"
                      value={form.password} onChange={handleChange} required minLength={6} />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Növbəti Addım →
                </button>

                <p className={styles.switchMode}>
                  Artıq mağazanız var?
                  <button type="button" onClick={() => { setMode('login'); setError(''); }}>
                    {' '}Giriş Et →
                  </button>
                </p>
              </motion.form>
            )}

            {/* ── REGISTER STEP 2 ── */}
            {mode === 'register' && step === 2 && (
              <motion.form key="reg-step2" onSubmit={handleRegisterStep2} className={styles.form}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}>
                <div className={styles.formHeader}>
                  <div className={styles.stepIndicator}>
                    <span className={styles.stepDone}><CheckCircle size={16} /></span>
                    <span className={styles.stepDivider} />
                    <span className={styles.stepActive}>2</span>
                  </div>
                  <h1>Mağaza Detalları</h1>
                  <p>Mağazanız haqqında əlavə məlumat</p>
                  {error && <div className={styles.errorMessage}>{error}</div>}
                </div>

                <div className={styles.inputGroup}>
                  <label>Əlaqə Nömrəsi</label>
                  <div className={styles.inputBox}>
                    <Phone size={18} />
                    <input type="tel" name="phone" placeholder="+994 50 000 00 00"
                      value={form.phone} onChange={handleChange} />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Mağaza Kateqoriyası</label>
                  <div className={styles.inputBox}>
                    <Tag size={18} />
                    <select name="category" value={form.category} onChange={handleChange} className={styles.select} required>
                      <option value="">Kateqoriya seçin</option>
                      {STORE_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.termsBox}>
                  <input type="checkbox" id="terms" required />
                  <label htmlFor="terms">
                    <Link to="/about">İstifadə Şərtlərini</Link> və{' '}
                    <Link to="/about">Gizlilik Siyasətini</Link> qəbul edirəm
                  </label>
                </div>

                <div className={styles.btnRow}>
                  <button type="button" className={styles.backStepBtn} onClick={() => setStep(1)}>
                    ← Geri
                  </button>
                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? <span className={styles.spinner} /> : 'Mağaza Aç'}
                  </button>
                </div>
              </motion.form>
            )}

            {mode === 'register' && step === 3 && (
              <motion.div key="success" className={styles.pendingBox}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}>
                <div className={styles.pendingIcon}><Clock size={48} /></div>
                <h2>Müraciətiniz Qəbul Edildi!</h2>
                <p>
                  <strong>{form.storeName}</strong> mağazanız üçün müraciətiniz qeydə alındı.
                  Admin təsdiq verdikdən sonra mağaza panelinizdən istifadə edə bilərsiniz.
                </p>
                <div className={styles.pendingNote}>
                  <span>⏳</span>
                  Superadmin icazəsi verildikdən sonra məhsul əlavə edib sata bilərsiniz.
                </div>
                <button className={styles.submitBtn} onClick={() => navigate('/store-dashboard')}>
                  Status Yoxla →
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StoreAuth;
