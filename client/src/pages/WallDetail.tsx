// Asıl Anı Duvarı / Oda Sayfası
import { useState, useEffect } from 'react';
import { MemoryWallGrid } from './MemoryWallGrid'; 
import { useNavigate, useParams } from 'react-router-dom';

interface WallDetailProps {
  role: string;
  title: string;
}

//  Temalar
const themeStyles: Record<string, { bg: string, primary: string, border: string, text: string, badge: string }> = {
  birthday: { bg: '#ffffff', primary: '#5A3E3E', border: '#FFEBF0', text: '#7C5858', badge: '#F7EFEF' },
  romantic: { bg: '#ffffff', primary: '#5A3E3E', border: '#FFEBF0', text: '#7C5858', badge: '#F7EFEF' },
  graduation: { bg: '#ffffff', primary: '#5A3E3E', border: '#FFEBF0', text: '#7C5858', badge: '#F7EFEF' },
  job: { bg: '#ffffff', primary: '#5A3E3E', border: '#FFEBF0', text: '#7C5858', badge: '#F7EFEF' },
  funny: { bg: '#ffffff', primary: '#5A3E3E', border: '#FFEBF0', text: '#7C5858', badge: '#F7EFEF' }
};

export function WallDetail({ role, title }: WallDetailProps) {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const wallId = Number(id);

  // --- State Yönetimi ---
  const [wallTitle, setWallTitle] = useState(title || 'Yükleniyor...');
  const [wallTheme, setWallTheme] = useState('birthday'); 
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const normalizedTheme = (wallTheme || 'birthday').toLowerCase();
  const currentTheme = themeStyles[normalizedTheme] || themeStyles.birthday;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5106';

  // 🎯 GERÇEK PÖTİKARE (GINGHAM) FORMÜLÜ
  const gridPatternStyle = `
    linear-gradient(90deg, rgba(255, 214, 224, 0.4) 50%, transparent 50%),
    linear-gradient(rgba(255, 214, 224, 0.4) 50%, transparent 50%)
  `;

  // --- 🚨 0. GÜVENLİK KAPISI (GİRİŞ KONTROLÜ) ---
  // Eğer kullanıcının yetkisi yoksa veya farklı odaya girmeye çalışıyorsa direkt Güvenli Giriş Kapısına şutluyoruz!
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      try {
        const authData = JSON.parse(savedUser);
        
        // Tarayıcıdaki oturum oda ID'si ile girmeye çalıştığı URL'deki oda ID'si farklıysa:
        if (Number(authData.wallId) !== wallId) {
          localStorage.removeItem('user'); // Eski yetkiyi sıfırla
          navigate(`/login?id=${wallId}`); // Doğru odanın kapısına yönlendir
        }
      } catch (e) {
        localStorage.removeItem('user');
        navigate(`/login?id=${wallId}`);
      }
    } else {
      navigate(`/login?id=${wallId}`);
    }
  }, [wallId, navigate]);

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

  // --- 2. Geri Sayım Sayacı ---
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
          console.error("Manuel tarih parçalama da başarısız oldu :", e);
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

  // Siyah barları yok eden ve arka planı mühürleyen container stili
  const sharedBackgroundStyle: React.CSSProperties = {
    minHeight: '100vh', 
    width: '100vw',
    marginLeft: 'calc(-50vw + 50%)',
    marginRight: 'calc(-50vw + 50%)',
    backgroundColor: currentTheme.bg,
    backgroundImage: gridPatternStyle, 
    backgroundSize: '60px 60px', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center',
    boxSizing: 'border-box', 
    padding: '2rem', 
    position: 'relative',
    margin: 0
  };

  // 🎁 SENARYO 1: Başrol (Admin) -> Süre Bitmediyse Sayacı, Bittiyse "Keşfet" Butonunu Görür
  if (role === 'Admin') {
    const isTimeUp = 
      timeLeft.days === 0 && 
      timeLeft.hours === 0 && 
      timeLeft.minutes === 0 && 
      timeLeft.seconds === 0;

    return (
      <div style={sharedBackgroundStyle}>
        
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
          border: '1px solid #FECDD3', 
          textAlign: 'center', 
          maxWidth: '500px', 
          width: '100%', 
          boxShadow: '0 25px 60px rgba(160, 43, 106, 0.08)', 
          boxSizing: 'border-box',
          animation: 'fadeIn 0.8s ease-out'
        }}>
          
          {!isTimeUp ? (
            /* ⏳ SÜRE BİTMEDİYSE: Klasik Geri Sayım Ekranı */
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '54px', display: 'block', filter: 'drop-shadow(0 10px 12px rgba(160, 43, 106, 0.1))' }}>🎁</span>
              </div>
              
              <h3 style={{ 
                fontSize: '24px', 
                fontStyle: 'italic', 
                fontWeight: '700', 
                color: '#a02b6a', 
                margin: '0 0 1.25rem 0' 
              }}>
                Biraz Sabret!
              </h3>
              
              <p style={{ 
                color: '#7C5858', 
                fontSize: '14.5px', 
                lineHeight: '1.6', 
                marginBottom: '1.5rem',
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '0 10px'
              }}>
                Kapsülün Açılmasına Kalan Süre:
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem', padding: '0 10px' }}>
                {[{ label: 'Gün', val: timeLeft.days }, { label: 'Saat', val: timeLeft.hours }, { label: 'Dak', val: timeLeft.minutes }, { label: 'Sn', val: timeLeft.seconds }].map((item, i) => (
                  <div key={i} style={{ minWidth: '60px', padding: '0.75rem 1rem', backgroundColor: '#FFFBFB', borderRadius: '14px', border: '1px solid #FECDD3' }}>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#a02b6a' }}>{item.val}</div>
                    <div style={{ fontSize: '12px', color: '#BFA7A7', marginTop: '4px', fontFamily: 'sans-serif', fontWeight: 'bold' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* 🎉 SÜRE BİTMEDİYSE: Büyük Keşif Butonu */
            <div style={{ animation: 'fadeIn 1s ease-out' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '54px', display: 'block', filter: 'drop-shadow(0 10px 12px rgba(160, 43, 106, 0.1))' }}>🎁</span>
              </div>

              <h3 style={{ 
                fontSize: '24px', 
                fontStyle: 'italic', 
                fontWeight: '700', 
                color: '#a02b6a', 
                margin: '0 0 1.25rem 0',
                lineHeight: '1.3'
              }}>
                Her şey hazır!
              </h3>

              <p style={{ 
                color: '#7C5858', 
                fontSize: '14.5px', 
                lineHeight: '1.6', 
                marginBottom: '2rem',
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '0 10px'
              }}>
                Senin için biriktirilen tüm anılar ve soruları görmenin vakti geldi!
              </p>
              
              <div style={{ padding: '0 10px' }}>
                <button 
                  onClick={() => navigate(`/wall/${id}/reveal`)} 
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '14px',
                    backgroundColor: '#a02b6a', 
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    fontFamily: 'sans-serif',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(160, 43, 106, 0.15)',
                    transition: 'transform 0.2s, opacity 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.opacity = '0.95';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Kapsülü Aç ve Keşfet!
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // 🧱 SENARYO 2: Giriş Yapmış Davetli (Guest) veya Creator
  if (role === 'Creator' || role === 'Guest') {
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