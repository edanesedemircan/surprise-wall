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

  const [manualWallId, setManualWallId] = useState('');

  const [statusMessage, setStatusMessage] = useState(
    wallIdFromUrl 
      ? `Kimliğiniz doğrulandıktan sonra #${wallIdFromUrl} numaralı anı odasına giriş yapacaksınız.` 
      : 'Kapsüle erişmek için lütfen oda kodunuzu girin ve Google hesabınızla kimliğinizi doğrulayın.'
  );

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const finalWallId = wallIdFromUrl || Number(manualWallId);

  
    if (!finalWallId || isNaN(finalWallId)) {
      setStatusMessage('Lütfen önce girmek istediğiniz geçerli bir oda kodu yazı!');
      return;
    }

    setStatusMessage('Google doğrulaması başarılı, güvenli çember kontrol ediliyor...');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5106';
      const response = await fetch(`${apiUrl}/api/auth/google-login`, {
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
          marginBottom: '2rem',
          fontStyle: 'italic',
          textAlign: 'center',
          padding: '0 10px'
        }}>
          {statusMessage}
        </p>

        {!wallIdFromUrl && (
          <div style={{ marginBottom: '2rem', padding: '0 10px' }}>
            <input
              type="number"
              placeholder="Oda Kodunu Girin (Örn: 11)"
              value={manualWallId}
              onChange={(e) => setManualWallId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem',
                borderRadius: '14px',
                border: '1px solid #FECDD3',
                outline: 'none',
                fontSize: '15px',
                fontFamily: 'sans-serif',
                textAlign: 'center',
                boxSizing: 'border-box',
                backgroundColor: '#FFFBFB',
                color: '#4A3E3E',
                fontWeight: 'bold'
              }}
            />
          </div>
        )}

        {/* Google Login Butonu */}
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