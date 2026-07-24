import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Contact = () => {
  const navigate = useNavigate();
  return (
    <div className="container" style={{ padding: '120px 0', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: '#D4AF37',
          cursor: 'pointer',
          padding: '8px 0',
          marginBottom: '20px',
          fontSize: '15px',
          fontWeight: 500,
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.color = '#B4932F'}
        onMouseLeave={(e) => e.target.style.color = '#D4AF37'}
      >
        <ArrowLeft size={18} /> Geri Qayıt
      </button>
      <h1 className="section-title" style={{ marginBottom: '24px' }}>Bizimlə Əlaqə</h1>
      <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#4a5568', lineHeight: '1.7' }}>
        Hər hansı sualınız üçün bizimlə əlaqə saxlaya bilərsiniz. Biz hər zaman sizə kömək etməyə hazırıq!
      </p>
    </div>
  );
};

export default Contact;
