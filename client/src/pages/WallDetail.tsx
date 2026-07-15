// Asıl Anı Duvarı / Oda Sayfası
import { useState, useEffect } from 'react';
import { MemoryWallGrid } from './MemoryWallGrid'; 
import { useNavigate, useParams } from 'react-router-dom';

interface WallDetailProps {
  role: string;
  title: string;
}

// 🌸 Temaları tamamen o tatlı, romantik pembe ekose konseptine sabitledik kanka!
const themeStyles: Record<string, { bg: string, primary: string, border: string, text: string, badge: string }> = {
  birthday: { bg: '#FFEBF0', primary: '#5A3E3E', border: '#F2E8E8', text: '#7C5858', badge: '#F7EFEF' },
  romantic: { bg: '#FFEBF0', primary: '#5A3E3E', border: '#F2E8E8', text: '#7C5858', badge: '#F7EFEF' },
  graduation: { bg: '#FFEBF0', primary: '#5A3E3E', border: '#F2E8E8', text: '#7C5858', badge: '#F7EFEF' },
  job: { bg: '#FFEBF0', primary: '#5A3E3E', border: '#F2E8E8', text: '#7C5858', badge: '#F7EFEF' },
  funny: { bg: '#FFEBF0', primary: '#5A3E3E', border: '#F2E8E8', text: '#7C5858', badge: '#F7EFEF' }
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

  // --- 🌸 İlk görseldeki birebir pembe-beyaz Pötikare (Gingham) Ekose Deseni ---
  const gridPatternStyle = `
    linear-gradient(90deg, rgba(255, 255, 255, 0.8) 50%, transparent 50%),
    linear-gradient(rgba(255, 255, 255, 0.8) 50%, transparent 50%)
  `;

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

  const sharedBackgroundStyle: React.CSSProperties = {
    minHeight: '100vh', 
    // 🚨 KENARLARIN TAM OLMAMA HATASINI SIFIRLAYAN MÜKEMMEL CSS TRICK:
    width: '100vw',
    marginLeft: 'calc(-50vw + 50%)',
    marginRight: 'calc(-50vw + 50%)',
    backgroundColor: currentTheme.bg,
    backgroundImage: gridPatternStyle, 
    backgroundSize: '80px 80px', // İlk görseldeki pötikare büyüklüğü kanka
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center',
    boxSizing: 'border-box', 
    padding: '2rem', 
    position: 'relative'
  };

  // 🎁 SENARYO 1: Başrol (Admin) -> Süre Bitmediyse Sayacı, Bittiyse "Keşfet" Butonunu Görür
  if (role === 'Admin') {
    // Süre sıfırlandı mı?
    const isTimeUp = 
      timeLeft.days === 0 && 
      timeLeft.hours === 0 && 
      timeLeft.minutes === 0 && 
      timeLeft.seconds === 0;

    return (
      <div style={sharedBackgroundStyle}>
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '4rem 3rem', 
          borderRadius: '28px', 
          border: `1px solid ${currentTheme.border}`, 
          textAlign: 'center', 
          maxWidth: '550px', 
          width: '100%', 
          boxShadow: '0 20px 50px rgba(0,0,0,0.02)',
          animation: 'fadeIn 0.8s ease-out'
        }}>
          
          {!isTimeUp ? (
            /* ⏳ SÜRE BİTMEDİYSE: Klasik Geri Sayım Ekranı */
            <>
              <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🎁</div>
              <h1 style={{ fontSize: '36px', fontFamily: '"Georgia", serif', fontStyle: 'italic', color: currentTheme.primary, fontWeight: '700', margin: 0 }}>Daha Zamanı Değil!</h1>
              <h2 style={{ color: '#7C5858', fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '20px', marginTop: '10px' }}>Biraz Sabret</h2>
              <p style={{ color: '#7C5858', fontSize: '15px', marginTop: '20px' }}>Kapsülün Açılmasına Kalan Süre:</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                {[{ label: 'Gün', val: timeLeft.days }, { label: 'Saat', val: timeLeft.hours }, { label: 'Dak', val: timeLeft.minutes }, { label: 'Sn', val: timeLeft.seconds }].map((item, i) => (
                  <div key={i} style={{ minWidth: '60px', padding: '0.75rem 1rem', backgroundColor: currentTheme.badge, borderRadius: '12px', border: `1px solid ${currentTheme.border}` }}>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: currentTheme.primary }}>{item.val}</div>
                    <div style={{ fontSize: '12px', color: '#BFA7A7', marginTop: '4px' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* 🎉 SÜRE BİTTİYSE: Büyük Keşif Butonu */
            <div style={{ animation: 'fadeIn 1s ease-out' }}>
              <h1 style={{ 
                fontSize: '32px', 
                fontFamily: '"Georgia", serif', 
                fontStyle: 'italic', 
                color: currentTheme.primary, 
                fontWeight: '900', 
                margin: '0 0 10px 0',
                lineHeight: '1.3'
              }}>
                Her şeyi görmenin vakti geldi!
              </h1>
              <p style={{ 
                color: '#7C5858', 
                fontFamily: '"Georgia", serif', 
                fontStyle: 'italic',
                fontSize: '16px', 
                lineHeight: '1.6',
                margin: '0 0 2rem 0' 
              }}>
                Senin için biriktirilen tüm anılar ve sorular açılmaya hazır. Her şeyi görmenin vakti geldi!
              </p>
              
              <button 
                onClick={() => navigate(`/wall/${id}/reveal`)} // Başrolü yeni keşif sayfasına yönlendiriyoruz
                style={{
                  width: '100%',
                  padding: '1.2rem',
                  borderRadius: '16px',
                  backgroundColor: currentTheme.primary, 
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
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