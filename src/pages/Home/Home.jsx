import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, ArrowRight, Truck, ShieldCheck, Sparkles, Star, Store, Plus, Search, ChevronDown, Building2 } from 'lucide-react';
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

  const [storeSearch, setStoreSearch] = useState('');
  const [visibleStoreCount, setVisibleStoreCount] = useState(6);

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
      location: profile.address || 'Mingəçevir, Mərkəz',
      badge: badge,
      count: `${storeProductCount} məhsul`,
      logo: profile.logo,
    };
  });

  const filteredBoutiques = boutiques.filter(b => {
    return b.name.toLowerCase().includes(storeSearch.toLowerCase()) || 
           b.location.toLowerCase().includes(storeSearch.toLowerCase());
  });

  const displayedBoutiques = filteredBoutiques.slice(0, visibleStoreCount);

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
              "Mingəçevir küçələrində gəzərək kəşf etdiyiniz butiklərin <span>rəqəmsal vitrini</span>. Yerli üslub, bir kliklə."
            </motion.h2>
            <span className={styles.manifestAuthor}>Məkan redaksiyası</span>
          </div>
        </div>
      </section>

      {/* 5. Şəhərin Seçkin Ünvanları (Boutiques Directory) */}
      <section className={styles.boutiquesSection} id="stores-directory">
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <span className={styles.sectionPre}>PARTNYOR MAĞAZALARIMIZ</span>
              <h2 className={styles.sectionTitle}>Şəhərin seçkin ünvanları</h2>
            </div>
            <span className={styles.headerLink}>
              Aktiv mağazalar ({boutiques.length})
            </span>
          </div>

          {/* Search Bar */}
          <div className={styles.storeFilterBar}>
            <div className={styles.storeSearchBox}>
              <Search size={18} className={styles.storeSearchIcon} />
              <input 
                type="text" 
                placeholder="Mağaza adı və ya ünvan axtarın..." 
                value={storeSearch}
                onChange={(e) => {
                  setStoreSearch(e.target.value);
                  setVisibleStoreCount(6);
                }}
                className={styles.storeSearchInput}
              />
              {storeSearch && (
                <button 
                  className={styles.clearSearchBtn}
                  onClick={() => setStoreSearch('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Boutiques Responsive Grid */}
          {displayedBoutiques.length > 0 ? (
            <div className={styles.boutiquesGrid}>
              {displayedBoutiques.map((boutique, index) => (
                <motion.div 
                  key={boutique.id}
                  className={styles.boutiqueCard}
                  onClick={() => handleBoutiqueClick(boutique.id)}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
                >
                  <div className={styles.boutiqueCardInner}>
                    <div className={styles.boutiqueHeader}>
                      <div className={styles.boutiqueTitleArea}>
                        <div className={styles.storeAvatar}>
                          {boutique.logo ? (
                            <img src={boutique.logo} alt={boutique.name} className={styles.avatarImg} />
                          ) : (
                            <Building2 size={18} className={styles.avatarIcon} />
                          )}
                        </div>
                        <h3 className={styles.boutiqueName}>{boutique.name}</h3>
                      </div>
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
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={styles.noStoresFound}>
              <Building2 size={40} className={styles.noStoresIcon} />
              <h4>Axtarışa uyğun mağaza tapılmadı</h4>
              <p>Daxil etdiyiniz söz və ya filtrlərə uyğun nəticə Yoxdur.</p>
              <button 
                className={styles.resetFilterBtn}
                onClick={() => setStoreSearch('')}
              >
                Axtarışı sıfırla
              </button>
            </div>
          )}

          {/* Show More Button if more items exist */}
          {filteredBoutiques.length > visibleStoreCount && (
            <div className={styles.showMoreContainer}>
              <button 
                className={styles.showMoreBtn}
                onClick={() => setVisibleStoreCount(prev => prev + 6)}
              >
                Daha çox mağaza göstər (+{filteredBoutiques.length - visibleStoreCount})
                <ChevronDown size={18} />
              </button>
            </div>
          )}
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
                <p>Mingəçevirdaxili bütün sifarişlər operativ şəkildə birbaşa qapınıza çatdırılır.</p>
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
              <h2 className={styles.sectionTitle}>Mingəçevirlilərin söylədikləri</h2>
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
                "Mingəçevirdəki dizayner butiklərinin bir yerdə olması, qiymətlərin şəffaf göstərilməsi əla ideyadır. Kuryer sifarişi elə həmin gün gətirdi, çox razı qaldım."
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
              <span className={styles.statNum}>Sürətli</span>
              <span className={styles.statLabel}>Mingəçevir Çatdırılması</span>
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
                Platformamızda mağazanızı qeydiyyatdan keçirərək Mingəçevirdəki minlərlə müştəriyə rəqəmsal olaraq çatın. İnventarınızı idarə edin, satışlarınızı artırın və brendinizi inkişaf etdirin.
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
