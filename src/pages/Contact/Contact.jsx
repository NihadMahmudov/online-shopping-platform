import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';

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
      <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#4a5568', lineHeight: '1.7', marginBottom: '32px' }}>
        Hər hansı sualınız üçün bizimlə əlaqə saxlaya bilərsiniz. Biz hər zaman sizə kömək etməyə hazırıq!
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '24px' }}>
        <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', textAlign: 'center' }}>
          <Phone size={24} style={{ color: '#D4AF37', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Telefon Nömrələri</h3>
          <p style={{ margin: '4px 0' }}><a href="tel:0554772779" style={{ color: 'inherit', textDecoration: 'none' }}>055 477 27 79</a></p>
          <p style={{ margin: '4px 0' }}><a href="tel:0554415920" style={{ color: 'inherit', textDecoration: 'none' }}>055 441 59 20</a></p>
        </div>

        <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', textAlign: 'center' }}>
          <Mail size={24} style={{ color: '#D4AF37', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>E-poçt Ünvanı</h3>
          <p style={{ margin: '4px 0' }}>
            <a href="mailto:atlasmall.info@gmail.com" style={{ color: '#D4AF37', textDecoration: 'none' }}>atlasmall.info@gmail.com</a>
          </p>
        </div>

        <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', textAlign: 'center' }}>
          <MapPin size={24} style={{ color: '#D4AF37', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Ünvan</h3>
          <p style={{ margin: '4px 0' }}>Mingəçevir şəhəri, H.Əliyev pr. 12</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
