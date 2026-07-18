import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, ArrowRight, Truck, ShieldCheck, Sparkles, Star, Store, Plus, CheckCircle, Award, UserPlus, UploadCloud, Rocket } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import Hero from '../../components/home/Hero';
import ProductShowcase from '../../components/home/ProductShowcase';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { user, users } = useAuth();
  const { getStoreProfile } = useStore();
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly', 'halfYearly', 'yearly'

  // Dynamically load boutiques/stores from AuthContext
  const vendorsList = users.filter(u => u.role === 'vendor');

  const boutiques = vendorsList.map(v => {
    const profile = getStoreProfile(v.storeId) || {};
    const storeProductCount = products.filter(p => p.storeId === v.storeId).length;
    
    // Give seeded boutiques nice badges
    let badge = 'BUTİK';
    if (v.storeId === 'vogue_art') badge = 'YENİ';
    else if (v.storeId === 'modernist') badge = 'POPULYAR';
    else if (v.storeId === 'zarif_atelye') badge = 'ƏL İŞİ';
    else if (v.storeId === 'style_lab') badge = 'PREMİUM';
    else if (v.storeId === 'baku_closet') badge = 'TREND';
    else if (v.storeId === 'silk_way') badge = 'KLASSİK';
    else if (v.storeCategory) badge = v.storeCategory.toUpperCase();

    return {
      id: v.storeId,
      name: v.storeName || v.name,
      location: profile.address || 'Bakı, Nizami küçəsi',
      badge: badge,
      count: `${storeProductCount} məhsul`,
    };
  });

  const handleBoutiqueClick = (id) => {
    navigate(`/store/${id}`);
  };

  return (
    <div className={styles.homePage}>
      {/* 1. Hero / Search / Visual Categories Grid */}
      <Hero />

      {/* Product Showcase - "Bizdə olan məhsullar" section */}
      <ProductShowcase />

      {/* 3. Steps / How it works Section */}
      <section className={styles.stepsSection}>
        <div className="container">
          <div className={styles.stepsGrid}>
            <motion.div 
              className={styles.stepCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className={styles.stepNum}>01</span>
              <h3>Mağazanızı seçin</h3>
              <p>Şəhərimizdəki ən yaxşı butiklərin və yerli dizaynerlərin siyahısından istədiyiniz brendi seçin.</p>
            </motion.div>

            <motion.div 
              className={styles.stepCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className={styles.stepNum}>02</span>
              <h3>Kolleksiyaya baxın</h3>
              <p>Seçdiyiniz butikin unikal geyim, ayaqqabı, aksessuar və atelye vitrinlərinə asanlıqla göz gəzdirin.</p>
            </motion.div>

            <motion.div 
              className={styles.stepCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className={styles.stepNum}>03</span>
              <h3>Asanlıqla əldə edin</h3>
              <p>Bir kliklə bəyəndiyiniz məhsulları səbətə əlavə edin, sürətli və təhlükəsiz çatdırılmadan həzz alın.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Editorial Manifest Banner */}
      <section className={styles.manifestSection}>
        <div className="container">
          <div className={styles.manifestContent}>
            <span className={styles.manifestPre}>— MANİFEST —</span>
            <motion.h2 
              className={styles.manifestText}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              "Bakının küçələrində gəzərək kəşf etdiyiniz butiklərin <span>rəqəmsal vitrini</span>. Yerli üslub, bir kliklə."
            </motion.h2>
            <span className={styles.manifestAuthor}>Məkan redaksiyası</span>
          </div>
        </div>
      </section>

      {/* 5. Şəhərin Seçkin Ünvanları (Boutiques Directory) */}
      <section className={styles.boutiquesSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <span className={styles.sectionPre}>PARTNYOR MAĞAZALARIMIZ</span>
              <h2 className={styles.sectionTitle}>Şəhərin seçkin ünvanları</h2>
            </div>
            <span className={styles.headerLink}>
              Bütün mağazalar ({boutiques.length})
            </span>
          </div>

          <div className={styles.boutiquesGrid}>
            {boutiques.map((boutique, index) => (
              <motion.div 
                key={boutique.id}
                className={styles.boutiqueCard}
                onClick={() => handleBoutiqueClick(boutique.id)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <div className={styles.boutiqueHeader}>
                  <h3 className={styles.boutiqueName}>{boutique.name}</h3>
                  <span className={styles.boutiqueBadge}>{boutique.badge}</span>
                </div>

                <div className={styles.boutiqueDetails}>
                  <div className={styles.detailItem}>
                    <MapPin size={14} className={styles.detailIcon} />
                    <span>{boutique.location}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Store size={14} className={styles.detailIcon} />
                    <span>{boutique.count}</span>
                  </div>
                </div>

                <button className={styles.boutiqueAction}>
                  Mağazaya bax <ArrowRight size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Mağaza Ortaqlığı, Satışa Başlama Rəhbəri və Abunəlik Planları */}
      <section className={styles.vendorOnboardingSection} id="sell-on-atlas">
        <div className="container">
          
          {/* Billing Switcher Toggle */}
          <div className={styles.billingToggleContainer}>
            <span className={`${styles.billingToggleLabel} ${billingPeriod === 'monthly' ? styles.billingToggleLabelActive : ''}`}>
              Aylıq Ödəniş
            </span>
            <div 
              className={styles.billingToggle} 
              id="billing-switcher"
            >
              <div className={`
                ${styles.billingToggleActiveBg} 
                ${billingPeriod === 'halfYearly' ? styles.billingToggleActiveBgHalfYearly : ''} 
                ${billingPeriod === 'yearly' ? styles.billingToggleActiveBgYearly : ''}
              `} />
              <button 
                type="button"
                className={`${styles.billingToggleOption} ${billingPeriod === 'monthly' ? styles.billingToggleOptionActive : ''}`}
                onClick={() => setBillingPeriod('monthly')}
              >
                Aylıq
              </button>
              <button 
                type="button"
                className={`${styles.billingToggleOption} ${billingPeriod === 'halfYearly' ? styles.billingToggleOptionActive : ''}`}
                onClick={() => setBillingPeriod('halfYearly')}
              >
                6 Aylıq <span className={styles.saveTag}>-10%</span>
              </button>
              <button 
                type="button"
                className={`${styles.billingToggleOption} ${billingPeriod === 'yearly' ? styles.billingToggleOptionActive : ''}`}
                onClick={() => setBillingPeriod('yearly')}
              >
                İllik <span className={styles.saveTag}>-17%</span>
              </button>
            </div>
            <span className={`${styles.billingToggleLabel} ${billingPeriod === 'yearly' ? styles.billingToggleLabelActive : ''}`}>
              İllik Ödəniş (Ən sərfəli)
            </span>
          </div>

          <div className={styles.onboardingGrid}>
            
            {/* Guide & Steps */}
            <div className={styles.onboardingLeft}>
              <span className={styles.sectionPre} style={{ color: '#d4af37' }}>ATLASMALL-DA SATIŞ</span>
              <h3>Necə qeydiyyatdan keçib məhsul yerləşdirmək olar?</h3>
              <p>
                AtlasMall platforması vasitəsilə fiziki butikinizi rəqəmsal dünyaya daşımaq və Bakının minlərlə aktiv alıcısına birbaşa satış etmək cəmi bir neçə dəqiqə çəkir.
              </p>

              <div className={styles.onboardingSteps}>
                <motion.div 
                  className={styles.onboardingStep}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className={styles.stepIconBadge}>1</div>
                  <div className={styles.stepMeta}>
                    <h4>Pulsuz Qeydiyyatdan Keçin</h4>
                    <p>Mağazanızın adını, əlaqə məlumatlarını daxil edərək saniyələr içində satıcı hesabı yaradın.</p>
                  </div>
                </motion.div>

                <motion.div 
                  className={styles.onboardingStep}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className={styles.stepIconBadge}>2</div>
                  <div className={styles.stepMeta}>
                    <h4>Abunəlik Planı Seçin</h4>
                    <p>Biznesinizə ən uyğun olan Aylıq (10 AZN) və ya fərdi üstünlüklərə malik İllik abunəliyi aktivləşdirin.</p>
                  </div>
                </motion.div>

                <motion.div 
                  className={styles.onboardingStep}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className={styles.stepIconBadge}>3</div>
                  <div className={styles.stepMeta}>
                    <h4>Məhsulları Yerləşdirin</h4>
                    <p>Satıcı panelinizə daxil olaraq məhsullarınızın şəkillərini, təsvirlərini və qiymətlərini rahatlıqla əlavə edin.</p>
                  </div>
                </motion.div>

                <motion.div 
                  className={styles.onboardingStep}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className={styles.stepIconBadge}>4</div>
                  <div className={styles.stepMeta}>
                    <h4>Sifarişləri Qəbul Edin</h4>
                    <p>Məhsullarınız dərhal ana səhifədə görünəcək. Sifarişləri idarə edin, qalan işləri (kuryer və ödəniş) biz həll edək!</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Pricing / Subscriptions */}
            <div className={styles.pricingContainer}>

              {/* Monthly Plan */}
              <div className={styles.pricingCard}>
                <div>
                  <h4 className={styles.pricingTitle}>Aylıq Abunə</h4>
                  <p className={styles.pricingDescription}>Fəaliyyətə yeni başlayan butiklər üçün çevik və rahat seçim.</p>
                  <div className={styles.pricingPriceRow}>
                    <span className={styles.priceAmount}>10 AZN</span>
                    <span className={styles.pricePeriod}>/ ay</span>
                  </div>
                  <div className={styles.pricingFeatures}>
                    <div className={styles.pricingFeatureItem}>
                      <CheckCircle size={16} className={styles.pricingFeatureIcon} />
                      <span>Dinamik mağaza səhifəsi və loqo</span>
                    </div>
                    <div className={styles.pricingFeatureItem}>
                      <CheckCircle size={16} className={styles.pricingFeatureIcon} />
                      <span>Limitsiz məhsul əlavə etmə imkanı</span>
                    </div>
                    <div className={styles.pricingFeatureItem}>
                      <CheckCircle size={16} className={styles.pricingFeatureIcon} />
                      <span>Sürətli Bakıdaxili kuryer inteqrasiyası</span>
                    </div>
                    <div className={styles.pricingFeatureItem}>
                      <CheckCircle size={16} className={styles.pricingFeatureIcon} />
                      <span>7/24 Texniki və satıcı dəstəyi</span>
                    </div>
                  </div>
                </div>
                <button 
                  className={`${styles.pricingCtaBtn} ${styles.lightCtaBtn}`}
                  onClick={() => navigate('/store-login', { state: { mode: 'register' } })}
                  id="cta-monthly"
                >
                  <Store size={16} /> Mağaza Açın
                </button>
              </div>

              {/* Yearly Plan */}
              <div className={`${styles.pricingCard} ${styles.popularPricingCard}`}>
                <div className={styles.pricingBadge}>ƏN SƏRFƏLİ</div>
                <div>
                  <h4 className={styles.pricingTitle}>
                    {billingPeriod === 'monthly' ? 'Aylıq VIP Abunə' : billingPeriod === 'halfYearly' ? '6 Aylıq VIP Abunə' : 'İllik VIP Abunə'}
                  </h4>
                  <p className={styles.pricingDescription}>Biznesini böyütmək və daha çox müştəri qazanmaq istəyənlər üçün.</p>
                  <div className={styles.pricingPriceRow}>
                    <span className={styles.priceAmount}>
                      {billingPeriod === 'monthly' ? '99 AZN' : billingPeriod === 'halfYearly' ? '9.00 AZN' : '8.25 AZN'}
                    </span>
                    <span className={styles.pricePeriod}>
                      {billingPeriod === 'monthly' ? '/ il' : billingPeriod === 'halfYearly' ? '/ ay (54 AZN/6ay)' : '/ ay (99 AZN/il)'}
                    </span>
                  </div>
                  <div className={styles.pricingFeatures}>
                    <div className={styles.pricingFeatureItem}>
                      <CheckCircle size={16} className={styles.pricingFeatureIcon} />
                      <span><strong>Bütün Aylıq imkanlar daxildir</strong></span>
                    </div>
                    <div className={styles.pricingFeatureItem}>
                      <CheckCircle size={16} className={styles.pricingFeatureIcon} />
                      <span>Ana səhifədə VIP önə çıxarılma</span>
                    </div>
                    <div className={styles.pricingFeatureItem}>
                      <CheckCircle size={16} className={styles.pricingFeatureIcon} />
                      <span>Sosial media səhifələrimizdə reklam</span>
                    </div>
                    <div className={styles.pricingFeatureItem}>
                      <CheckCircle size={16} className={styles.pricingFeatureIcon} />
                      <span>Xüsusi brend banner dizaynı dəstəyi</span>
                    </div>
                  </div>
                </div>
                <button 
                  className={`${styles.pricingCtaBtn} ${styles.goldCtaBtn}`}
                  onClick={() => navigate('/store-login', { state: { mode: 'register' } })}
                  id="cta-yearly"
                >
                  <Award size={16} /> {billingPeriod === 'monthly' ? 'VIP Abunə Ol' : billingPeriod === 'halfYearly' ? '6 Aylıq Abunə Ol' : 'İllik Abunə Ol'}
                </button>
              </div>

              {/* Enterprise / Corporate Plan */}
              <div className={styles.pricingCard}>
                <div className={styles.pricingBadge} style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: '#ffffff' }}>KORPORATİV</div>
                <div>
                  <h4 className={styles.pricingTitle}>Pro Korporativ</h4>
                  <p className={styles.pricingDescription}>Böyük butiklər, çoxsaylı filiallar və tam avtomatlaşdırılmış satış istəyənlər üçün.</p>
                  <div className={styles.pricingPriceRow}>
                    <span className={styles.priceAmount}>
                      {billingPeriod === 'monthly' ? '25 AZN' : billingPeriod === 'halfYearly' ? '22.50 AZN' : '20.75 AZN'}
                    </span>
                    <span className={styles.pricePeriod}>
                      {billingPeriod === 'monthly' ? '/ ay' : billingPeriod === 'halfYearly' ? '/ ay (135 AZN/6ay)' : '/ ay (249 AZN/il)'}
                    </span>
                  </div>
                  <div className={styles.pricingFeatures}>
                    <div className={styles.pricingFeatureItem}>
                      <CheckCircle size={16} className={styles.pricingFeatureIcon} />
                      <span><strong>Bütün VIP imkanlar daxildir</strong></span>
                    </div>
                    <div className={styles.pricingFeatureItem}>
                      <CheckCircle size={16} className={styles.pricingFeatureIcon} />
                      <span>Limitsiz filial və ünvan dəstəyi</span>
                    </div>
                    <div className={styles.pricingFeatureItem}>
                      <CheckCircle size={16} className={styles.pricingFeatureIcon} />
                      <span>Detallı satış analitikası və hesabatlar</span>
                    </div>
                    <div className={styles.pricingFeatureItem}>
                      <CheckCircle size={16} className={styles.pricingFeatureIcon} />
                      <span>1C, Shopify və s. avtomatlaşdırılmış inteqrasiya</span>
                    </div>
                    <div className={styles.pricingFeatureItem}>
                      <CheckCircle size={16} className={styles.pricingFeatureIcon} />
                      <span>7/24 Prioritet VIP dəstək xidməti</span>
                    </div>
                  </div>
                </div>
                <button 
                  className={`${styles.pricingCtaBtn} ${styles.lightCtaBtn}`}
                  onClick={() => navigate('/store-login', { state: { mode: 'register' } })}
                  id="cta-corporate"
                  style={{ border: '1px solid #3b82f6' }}
                >
                  <Rocket size={16} style={{ color: '#3b82f6' }} /> Biznesə Başla
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 7. Value Props (Trust Badges) */}
      <section className={styles.trustSection}>
        <div className="container">
          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <div className={styles.trustIconWrapper}>
                <Truck size={20} />
              </div>
              <div className={styles.trustInfo}>
                <h4>Sürətli Çatdırılma</h4>
                <p>Bakıdaxili bütün sifarişlər 24 saat ərzində birbaşa qapınıza çatdırılır.</p>
              </div>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustIconWrapper}>
                <ShieldCheck size={20} />
              </div>
              <div className={styles.trustInfo}>
                <h4>Orijinal Məhsul Zəmanəti</h4>
                <p>Məkan partnyoru olan bütün butiklər lisenziyalı və təsdiqlənmişdir.</p>
              </div>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustIconWrapper}>
                <Sparkles size={20} />
              </div>
              <div className={styles.trustInfo}>
                <h4>Eksklüziv Seçimlər</h4>
                <p>Hər həftə butiklərin ən yeni kolleksiyalarını ilk siz kəşf edin.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Testimonials */}
      <section className={styles.testimonialsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <span className={styles.sectionPre}>MÜŞTƏRİ RƏYLƏRİ</span>
              <h2 className={styles.sectionTitle}>Bakılıların söylədikləri</h2>
            </div>
          </div>

          <div className={styles.testimonialsGrid}>
            <div className={styles.testimonialCard}>
              <div className={styles.starsRow}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className={styles.quoteText}>
                "Məkan sayəsində fərqli yerli butikləri və atelyeləri tapmaq çox asanlaşdı. Artıq saatlarla mağaza gəzmirəm! Hər şey bir ünvanda toplandığı üçün çox rahatdır."
              </p>
              <div className={styles.authorMeta}>
                <h5>Leyla Rəsulova</h5>
                <span>Sadiq Alıcı</span>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.starsRow}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className={styles.quoteText}>
                "Bakıdakı dizayner butiklərinin bir yerdə olması, qiymətlərin şəffaf göstərilməsi əla ideyadır. Kuryer sifarişi elə həmin gün gətirdi, çox razı qaldım."
              </p>
              <div className={styles.authorMeta}>
                <h5>Tural Əliyev</h5>
                <span>Moda Həvəskarı</span>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.starsRow}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className={styles.quoteText}>
                "Zərif Atelye və Silk Way mağazalarının kolleksiyalarını həmişə bəyənirdim. Məkan üzərindən ilk dəfə sifariş verdim. Parça keyfiyyəti və çatdırılma möhtəşəm idi."
              </p>
              <div className={styles.authorMeta}>
                <h5>Aysel Məmmədova</h5>
                <span>Dizayner</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Stats Section */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>60+</span>
              <span className={styles.statLabel}>Yerli Butik</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>4.5k</span>
              <span className={styles.statLabel}>Məhsul Kataloqu</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>24s</span>
              <span className={styles.statLabel}>Bakı Çatdırılması</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>12k+</span>
              <span className={styles.statLabel}>Aktiv Müştəri</span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. B2B Vendor Registration CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaInfo}>
              <span className={styles.ctaPre}>BUTİKLƏR ÜÇÜN SƏNƏDLƏR</span>
              <h2 className={styles.ctaTitle}>Butikinizi <span>AtlasMall</span>-a əlavə edin.</h2>
              <p className={styles.ctaDesc}>
                Platformamızda mağazanızı qeydiyyatdan keçirərək Bakıdakı minlərlə müştəriyə rəqəmsal olaraq çatın. İnventarınızı idarə edin, satışlarınızı artırın və brendinizi inkişaf etdirin.
              </p>
            </div>
            <button 
              className={styles.ctaBtn}
              onClick={() => navigate('/store-login', { state: { mode: 'register' } })}
            >
              Ortaq ol <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
