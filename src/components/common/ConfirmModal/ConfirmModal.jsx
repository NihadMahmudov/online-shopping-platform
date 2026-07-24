import { useEffect } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import styles from './ConfirmModal.module.css';

export default function ConfirmModal({
  isOpen,
  title = 'Əminsiniz?',
  message = 'Bu əməliyyatı ləğv etmək mümkün olmayacaq.',
  itemName = '',
  confirmText = 'Bəli, Sil',
  cancelText = 'Ləğv Et',
  onConfirm,
  onClose,
  isDanger = true
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrapper}>
          {isDanger ? <Trash2 size={28} /> : <AlertTriangle size={28} />}
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        {itemName && (
          <div className={styles.itemBadge}>
            <span>“{itemName}”</span>
          </div>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            {cancelText}
          </button>
          <button 
            type="button" 
            className={styles.confirmBtn} 
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
          >
            <Trash2 size={16} />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
