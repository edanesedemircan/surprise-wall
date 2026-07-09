// Odaya girmek isteyenler (Davetliler veya Başrol) Ekranı

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

interface HomeProps {
  onLoginSuccess: (role: string, title: string, wallId: number) => void;
}

export function Home({ onLoginSuccess }: HomeProps) {
  const { id } = useParams<{ id: string }>();
  const wallIdFromUrl = Number(id);

  const [statusMessage, setStatusMessage] = useState(
    'Kapsüle erişmek ve rolünüzün belirlenmesi için lütfen Google hesabınızla tek tıkla kimliğinizi doğrulayın.'
  );

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const finalWallId = wallIdFromUrl || 1; 

    setStatusMessage('Google doğrulaması başarılı, güvenli çember kontrol ediliyor...');

    try {
      const response = await fetch('http://localhost:5106/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallId: finalWallId,
          idToken: credentialResponse.credential
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage('Giriş Başarılı! Yönlendiriliyorsunuz... ✨');
        // Giriş başarılı olunca üst katmana haber veriyoruz
        onLoginSuccess(data.role, data.title, finalWallId);
      } else {
        setStatusMessage(`Giriş Engellendi: ${data.message}`);
      }
    } catch (error) {
      setStatusMessage('API bağlantı hatası oluştu!');
      console.error(error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', 
      width: '100%', 
      backgroundColor: '#FFF5F5',
      backgroundImage: `linear-gradient(90deg, rgba(244, 63, 94, 0.03) 50%, transparent 50%), linear-gradient(rgba(244, 63, 94, 0.03) 50%, transparent 50%)`,
      backgroundSize: '80px 80px', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      fontFamily: '"Georgia", "Baskerville", "Times New Roman", serif', 
      boxSizing: 'border-box', 
      padding: '2rem',
      position: 'absolute',
      top: 0,
      left: 0
    }}>
      
      <style>{`
        body, html, #root { 
          margin: 0 !important; 
          padding: 0 !important; 
          width: 100% !important; 
          height: 100% !important; 
          overflow-x: hidden !important; 
        }
      `}</style>

      <div style={{
        backgroundColor: '#ffffff', 
        padding: '4rem 3rem', 
        borderRadius: '28px',
        boxShadow: '0 25px 60px rgba(160, 43, 106, 0.08)', 
        border: '1px solid #FECDD3',
        textAlign: 'center', 
        maxWidth: '500px', 
        width: '100%', 
        boxSizing: 'border-box'
      }}>
        
        {/* Üst Güvenlik İkonu */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '54px', display: 'block', filter: 'drop-shadow(0 10px 12px rgba(160, 43, 106, 0.1))' }}>🔐</span>
        </div>

        {/* Başlık */}
        <h3 style={{ 
          fontSize: '24px', 
          fontStyle: 'italic', 
          fontWeight: '700', 
          color: '#a02b6a', 
          margin: '0 0 1.25rem 0' 
        }}>
          Güvenli Geçiş Kapısı
        </h3>

        {/* Dinamik Durum ve Bilgi Metni */}
        <p style={{ 
          color: '#7C5858', 
          fontSize: '14.5px', 
          lineHeight: '1.6', 
          marginBottom: '2.5rem',
          fontStyle: 'italic',
          textAlign: 'center',
          padding: '0 10px'
        }}>
          {statusMessage}
        </p>

        {/* 🚀 Google Login Butonu Tam Merkezde */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setStatusMessage('Google Giriş Hatası!')}
          />
        </div>

      </div>
    </div>
  );
}