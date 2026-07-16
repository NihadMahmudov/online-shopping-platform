import React, { useState } from 'react';
import { PlusCircle, Trash2, ImagePlus, Camera } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminPanel.module.css';

const AdminPanel = () => {
  const { categories, addCategory, deleteCategory, updateCategoryImage, products } = useProducts();
  const { isSuperAdmin } = useAuth();
  const [newCatLabel, setNewCatLabel] = useState('');
  const [success, setSuccess] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(null);

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
        setUploadingImage(null);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      };
      reader.readAsDataURL(file);
    }
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
        <h1>Kateqoriya İdarəetməsi</h1>
        <p>Platform kateqoriyalarını buradan idarə edin. Mağazalar yalnız mövcud kateqoriyalar üzərində məhsul əlavə edə bilər.</p>
      </div>

      {success && (
        <div className={styles.successMsg}>
          ✅ Əməliyyat uğurla yerinə yetirildi!
        </div>
      )}

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
    </div>
  );
};

export default AdminPanel;
