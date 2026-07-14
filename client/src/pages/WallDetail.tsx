// Asıl Anı Duvarı / Oda Sayfası
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// 🚀 Premium anı grid sayfamız:
import { MemoryWallGrid } from './MemoryWallGrid'; 

interface WallDetailProps {
  role: string;
  title: string;
  onLoginSuccess: (role: string, title: string, wallId: number) => void;
}

const themeStyles: Record<string, { bg: string, primary: string, border: string, text: string, badge: string }> = {
  birthday: { bg: '#F3E8FF', primary: '#6b21a8', border: '#E9D5FF', text: '#3B0764', badge: '#F3E8FF' },
  romantic: { bg: '#FFF1F2', primary: '#9f1238', border: '#FFE4E6', text: '#4C0519', badge: '#FFF1F2' },
  graduation: { bg: '#F1F5F9', primary: '#0f172a', border: '#E2E8F0', text: '#0F172A', badge: '#F1F5F9' },
  job: { bg: '#FEF3C7', primary: '#92400e', border: '#FDE68A', text: '#451A03', badge: '#FEF3C7' },
  funny: { bg: '#FCE7F3', primary: '#db2777', border: '#FBCFE8', text: '#4D072B', badge: '#FCE7F3' }
};

export function WallDetail({ role, title, onLoginSuccess }: WallDetailProps) {
  const { id } = useParams<{ id: string }>(); 
  const wallId = Number(id);

  // --- State Yönetimi ---
  const [statusMessage, setStatusMessage] = useState('İçerde neler döndüğünü görmek için kimliğinizi doğrulayın.');
  const [wallTitle, setWallTitle] = useState(title || 'Yükleniyor...');
  const [wallTheme, setWallTheme] = useState('birthday'); 
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  // Eğer prop olarak gelen rol Guest dışında geçerli bir rol ise doğrudan doğrulanmış kabul ediyoruz
  const [isLoggedIn, setIsLoggedIn] = useState(role !== 'Guest' && role !== 'Yükleniyor...');

  const normalizedTheme = (wallTheme || 'birthday').toLowerCase();
  const currentTheme = themeStyles[normalizedTheme] || themeStyles.birthday;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5106';

  // Prop rolü değiştiğinde giriş durumunu da senkronize ediyoruz
  useEffect(() => {
    if (role !== 'Guest' && role !== 'Yükleniyor...') {
      setIsLoggedIn(true);
    }
  }, [role]);

  // --- 1. Odanın Genel Özelliklerini Çekme ---
  useEffect(() => {
    const fetchWallSpecs = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/wall/${wallId}`);
        if (response.ok) {
          const data = await response.json();
          
          const incomingTargetDate = data.targetDate || data.TargetDate || null;

          setWallTitle(data.title || data.Title || 'Yükleniyor...');
          setWallTheme((data.theme || data.Theme || 'birthday').toLowerCase());
          setTargetDate(incomingTargetDate); 
        }
      } catch (error) {
        console.error('Oda bilgileri sunucudan alınamadı:', error);
      }
    };
    if (wallId) fetchWallSpecs();
  }, [wallId, apiUrl]);

  // --- 2. Başrol (Admin) İçin Geri Sayım Sayacı ---
  useEffect(() => {
    if (role !== 'Admin' || !targetDate) return;
    const getSafeTargetMs = (dateStr: string): number => {
      let rawMs = Date.parse(dateStr);
      if (isNaN(rawMs)) {
        try {
          const cleanStr = dateStr.replace('T', ' ').trim();
          const [datePart, timePart] = cleanStr.split(' ');
          const [year, month, day] = datePart.split('-').map(Number);
          const [hour, minute, second] = timePart.split(':').map(Number);

          const nativeDate = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
          rawMs = nativeDate.getTime();
        } catch (e) {
          console.error("Manuel tarih parçalama da başarısız oldu kanka:", e);
        }
      }
      return rawMs;
    };

    const targetMs = getSafeTargetMs(targetDate);
    const calculateTimeLeft = () => {
      if (isNaN(targetMs) || targetMs <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const nowMs = new Date().getTime();
      const difference = targetMs - nowMs;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, role]);

  // --- 3. Google Giriş Entegrasyonu (Yalnızca doğrudan URL ile dışarıdan gelenler için mor doğrulama ekranı) ---
  useEffect(() => {
    if (role !== 'Guest' || isLoggedIn) return; 

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true; script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      const anyWindow = window as any;
      if (anyWindow.google?.accounts?.id) {
        anyWindow.google.accounts.id.initialize({
          client_id: '200628903576-matrf8d1fosen9d64ralgu3fetpltcmh.apps.googleusercontent.com',
          callback: async (response: any) => {
            setStatusMessage('Güvenli çember kontrol ediliyor...');
            try {
              const res = await fetch(`${apiUrl}/api/auth/google-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallId, idToken: response.credential }),
              });

              if (!res.ok) {
                setStatusMessage(`Giriş Engellendi (Kod: ${res.status}). Çember dışındasınız.`);
                return;
              }

              const data = await res.json();
              setIsLoggedIn(true); 
              onLoginSuccess(data.role, data.title, wallId);
            } catch (error) {
              setStatusMessage('API bağlantı hatası oluştu !');
            }
          }
        });

        anyWindow.google.accounts.id.renderButton(
          document.getElementById('googleBtn'),
          { theme: 'outline', size: 'large', width: 320 }
        );
      }
    };
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, [role, wallId, apiUrl, onLoginSuccess, isLoggedIn]);

  const sharedBackgroundStyle: React.CSSProperties = {
    minHeight: '100vh', width: '100%', backgroundColor: currentTheme.bg,
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    boxSizing: 'border-box', padding: '2rem', position: 'relative'
  };

  // 🔐 SENARYO 1: Giriş Yapmamış Davetli (Role Guest ve henüz login tetiklenmemiş)
  if (role === 'Guest' && !isLoggedIn) {
    return (
      <div style={sharedBackgroundStyle}>
        <style>{`body, html, #root { margin:0; padding:0; width:100%; height:100%; }`}</style>
        <div style={{ backgroundColor: '#ffffff', padding: '4rem 3rem', borderRadius: '28px', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.04)', border: `1px solid ${currentTheme.border}`, textAlign: 'center', maxWidth: '500px', width: '100%' }}>
          <div style={{ marginBottom: '1.5rem', fontSize: '64px' }}>🔒</div>
          <h2 style={{ fontSize: '22px', fontFamily: '"Georgia", serif', fontStyle: 'italic', fontWeight: '700', color: currentTheme.primary, marginBottom: '2.5rem' }}>{statusMessage}</h2>
          <div style={{ display: 'flex', justifyContent: 'center' }}><div id="googleBtn"></div></div>
        </div>
      </div>
    );
  }

  // 🎁 SENARYO 2: Başrol (Admin) -> Sadece Sayacı Görür
  if (role === 'Admin') {
    return (
      <div style={sharedBackgroundStyle}>
        <div style={{ backgroundColor: '#ffffff', padding: '4rem 3rem', borderRadius: '28px', border: `1px solid ${currentTheme.border}`, textAlign: 'center', maxWidth: '550px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🎁</div>
          <h1 style={{ fontSize: '36px', fontFamily: '"Georgia", serif', fontStyle: 'italic', color: currentTheme.primary, fontWeight: '700', margin: 0 }}>Şşşşt!</h1>
          <h2 style={{ color: '#7C5858', fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '20px', marginTop: '10px' }}>{wallTitle}</h2>
          <p style={{ color: '#7C5858', fontSize: '15px', marginTop: '20px' }}>Kapsülün Açılmasına Kalan Süre:</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
            {[{ label: 'Gün', val: timeLeft.days }, { label: 'Saat', val: timeLeft.hours }, { label: 'Dak', val: timeLeft.minutes }, { label: 'Sn', val: timeLeft.seconds }].map((item, i) => (
              <div key={i} style={{ minWidth: '60px', padding: '0.75rem 1rem', backgroundColor: currentTheme.badge, borderRadius: '12px', border: `1px solid ${currentTheme.border}` }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: currentTheme.primary }}>{item.val}</div>
                <div style={{ fontSize: '12px', color: '#BFA7A7', marginTop: '4px' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 🧱 SENARYO 3: Giriş Yapmış Davetli (Role Guest ve login doğrulanmış) veya Creator -> Yeni Büyük Duvarı Görür
  if (role === 'Creator' || (role === 'Guest' && isLoggedIn)) {
    return (
      <MemoryWallGrid 
        wallId={wallId} 
        wallTitle={wallTitle} 
        themeName={normalizedTheme as any} 
        apiUrl={apiUrl}
      />
    );
  }

  return (
    <div style={sharedBackgroundStyle}>
      <p style={{ color: '#7C5858', fontStyle: 'italic', fontFamily: '"Georgia", serif' }}>
        Yükleniyor ...
      </p>
    </div>
  );
}