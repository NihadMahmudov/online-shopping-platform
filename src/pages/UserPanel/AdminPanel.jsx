import React, { useState } from 'react';
import { PlusCircle, Trash2, ImagePlus, Camera } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminPanel.module.css';

const ShowcaseCardEditor = ({ card, onSave }) => {
  const [title, setTitle] = useState(card.title);
  const [subtitle, setSubtitle] = useState(card.subtitle || '');
  const [link, setLink] = useState(card.link);
  const [img, setImg] = useState(card.img);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(card.id, { title, subtitle, link, img });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.showcaseEditorCard}>
      <div className={styles.showcaseImageSection}>
        <img src={img} alt={title} className={styles.showcasePreview} />
        <label className={styles.showcaseUploadBtn}>
          <Camera size={16} />
          <span>Şəkli Dəyişdir</span>
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        </label>
      </div>
      <div className={styles.showcaseFormBody}>
        <div className={styles.badgeRow}>
          <span className={`${styles.typeBadge} ${styles[card.type]}`}>
            {card.type === 'main' ? 'Sol Böyük Kart' : card.type === 'right' ? 'Sağ Panel Kartı' : 'Aşağı Panel Kartı'}
          </span>
        </div>
        
        <div className={styles.inputGroup}>
          <label className={styles.fieldLabel}>Başlıq</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Başlıq daxil edin"
            className={styles.miniInput}
            required
          />
        </div>

        {card.type !== 'right' && (
          <div className={styles.inputGroup}>
            <label className={styles.fieldLabel}>Alt Başlıq / Düymə</label>
            <input 
              type="text" 
              value={subtitle} 
              onChange={(e) => setSubtitle(e.target.value)} 
              placeholder="Məs. Kolleksiyanı kəşf et"
              className={styles.miniInput}
            />
          </div>
        )}

        <div className={styles.inputGroup}>
          <label className={styles.fieldLabel}>Keçid Linki</label>
          <input 
            type="text" 
            value={link} 
            onChange={(e) => setLink(e.target.value)} 
            placeholder="Məs. /shop?category=decor"
            className={styles.miniInput}
            required
          />
        </div>

        <button type="submit" className={styles.saveBtn}>
          Yadda Saxla
        </button>
      </div>
    </form>
  );
};

const AdminPanel = () => {
  const { 
    categories, 
    addCategory, 
    deleteCategory, 
    updateCategoryImage, 
    products, 
    showcaseCards, 
    updateShowcaseCard 
  } = useProducts();
  const { isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'showcase'
  const [newCatLabel, setNewCatLabel] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;
    addCategory(newCatLabel, isSuperAdmin);
    setNewCatLabel('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleDelete = (id) => {
    if (id === 'all') {
      alert('Hamısı kateqoriyası silinə bilməz!');
      return;
    }
    if (confirm(`${categories.find(c => c.id === id)?.label} kateqoriyasını silmək istədiyinizdən əminsiniz?`)) {
      deleteCategory(id, isSuperAdmin);
    }
  };

  const handleImageUpload = (e, categoryId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCategoryImage(categoryId, reader.result, isSuperAdmin);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveShowcaseCard = (id, data) => {
    updateShowcaseCard(id, data);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  if (!isSuperAdmin) {
    return (
      <div className={styles.accessDenied}>
        <h2>Giriş Qadağandır</h2>
        <p>Bu səhifəyə yalnız super adminlər daxil ola bilər.</p>
      </div>
    );
  }

  return (
    <div className={styles.adminPanel}>
      <div className={styles.header}>
        <h1>Super Admin İdarəetmə Paneli</h1>
        <p>Platformanın əsas kateqoriyalarını və ana səhifə vitrin kartlarını buradan tənzimləyin.</p>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'categories' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Kateqoriyalar
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'showcase' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('showcase')}
        >
          Ana Səhifə Vitrini
        </button>
      </div>

      {success && (
        <div className={styles.successMsg}>
          ✅ Əməliyyat uğurla yerinə yetirildi! Dəyişikliklər tətbiq olundu.
        </div>
      )}

      {/* Categories Management Tab */}
      {activeTab === 'categories' && (
        <>
          <div className={styles.addSection}>
            <h3>Yeni Kateqoriya Əlavə Et</h3>
            <form onSubmit={handleAddCategory} className={styles.addForm}>
              <input
                type="text"
                value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)}
                placeholder="Kateqoriya adı daxil edin..."
                className={styles.input}
                required
              />
              <button type="submit" className={styles.addBtn}>
                <PlusCircle size={18} /> Əlavə Et
              </button>
            </form>
          </div>

          <div className={styles.categoryGrid}>
            {categories.filter(c => c.id !== 'all').map((cat) => {
              const productCount = products.filter(p => p.category === cat.id).length;
              return (
                <div key={cat.id} className={styles.categoryCard}>
                  <div className={styles.imageSection}>
                    {cat.img ? (
                      <div className={styles.imageWrapper}>
                        <img src={cat.img} alt={cat.label} />
                        <div className={styles.imageOverlay}>
                          <label htmlFor={`img-${cat.id}`} className={styles.changeImageBtn}>
                            <Camera size={20} />
                            <span>Şəkli Dəyişdir</span>
                          </label>
                          <input
                            id={`img-${cat.id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, cat.id)}
                            style={{ display: 'none' }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className={styles.noImage}>
                        <label htmlFor={`img-${cat.id}`} className={styles.uploadLabel}>
                          <ImagePlus size={32} />
                          <span>Şəkil Əlavə Et</span>
                        </label>
                        <input
                          id={`img-${cat.id}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, cat.id)}
                          style={{ display: 'none' }}
                        />
                      </div>
                    )}
                  </div>

                  <div className={styles.categoryInfo}>
                    <h4>{cat.label}</h4>
                    <p>{productCount} məhsul</p>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className={styles.deleteBtn}
                      title="Kateqoriyanı sil"
                    >
                      <Trash2 size={16} /> Sil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Home Showcase Cards Customization Tab */}
      {activeTab === 'showcase' && (
        <div className={styles.showcaseSection}>
          <div className={styles.sectionInfo}>
            <h3>Vitrin Reklam Kartlarının İdarəedilməsi</h3>
            <p>Ana Səhifədə yerləşən bütün dizayn kartlarının (Böyük sol kart, sağ 4 kiçik kart və aşağıdakı 3 sütunlu kartlar) şəkillərini, başlıqlarını, düymə mətnlərini və kliklədikdə keçid edəcəkləri linkləri buradan dərhal dəyişə bilərsiniz.</p>
          </div>
          <div className={styles.showcaseGrid}>
            {showcaseCards?.map((card) => (
              <ShowcaseCardEditor 
                key={card.id} 
                card={card} 
                onSave={handleSaveShowcaseCard} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
