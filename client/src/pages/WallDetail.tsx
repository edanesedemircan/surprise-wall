// Asıl Anı Duvarı / Oda Sayfası
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Memory {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
}

interface WallDetailProps {
  role: string;
  title: string;
  onLoginSuccess: (role: string, title: string, wallId: number) => void;
}

// 🎨 Tema Renk Yapılandırması Sözlüğü
const themeStyles: Record<string, { bg: string, primary: string, border: string, text: string }> = {
  pink: { bg: '#FFF5F5', primary: '#a02b6a', border: '#FECDD3', text: '#4A2828' },
  blue: { bg: '#F0F9FF', primary: '#0369A1', border: '#BAE6FD', text: '#1E3A8A' },
  gold: { bg: '#FEFCE8', primary: '#A16207', border: '#FEF08A', text: '#451A03' },
  purple: { bg: '#FAF5FF', primary: '#7E22CE', border: '#E9D5FF', text: '#3B0764' }
};

export function WallDetail({ role, title, onLoginSuccess }: WallDetailProps) {
  const { id } = useParams<{ id: string }>(); 
  const wallId = Number(id);

  // --- State Yönetimi ---
  const [memories, setMemories] = useState<Memory[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [statusMessage, setStatusMessage] = useState('İçerde neler döndüğünü görmek için kimliğinizi doğrulayın.');
  
  // Canlı veritabanından gelecek dinamik veriler
  const [wallTitle, setWallTitle] = useState(title || 'Yükleniyor...');
  const [wallTheme, setWallTheme] = useState('pink'); 
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const currentTheme = themeStyles[wallTheme] || themeStyles.pink;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5106';

  // --- 1. Odanın Genel Özelliklerini (Başlık, Tarih, Tema) Çekme ---
  useEffect(() => {
    const fetchWallSpecs = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/wall/${wallId}`);
        if (response.ok) {
          const data = await response.json();
          setWallTitle(data.title);
          setWallTheme(data.theme || 'pink');
          setTargetDate(data.targetDate);
        }
      } catch (error) {
        console.error('Oda bilgileri sunucudan alınamadı:', error);
      }
    };

    if (wallId) {
      fetchWallSpecs();
    }
  }, [wallId]);

  // --- 2. Anıları Veritabanından Çekme ---
  const fetchMemories = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/memory/wall/${wallId}`);
      if (response.ok) {
        const data = await response.json();
        setMemories(data);
      }
    } catch (error) {
      console.error('Anılar veritabanından çekilemedi:', error);
    }
  };

  useEffect(() => {
    if (role !== 'Guest' && role !== 'Admin') {
      fetchMemories();
    }
  }, [wallId, role]);

  // --- 3. Başrol (Admin) İçin Geri Sayım Sayacı Kontrolü ---
  useEffect(() => {
    if (role !== 'Admin' || !targetDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
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

  // --- 4. Google Giriş Entegrasyonu ---
  useEffect(() => {
    if (role !== 'Guest') return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
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
                body: JSON.stringify({
                  wallId: wallId,
                  idToken: response.credential
                }),
              });

              const data = await res.json();
              if (res.ok) {
                onLoginSuccess(data.role, data.title, wallId);
              } else {
                setStatusMessage(`Giriş Engellendi: ${data.message}`);
              }
            } catch (error) {
              setStatusMessage('API bağlantı hatası oluştu!');
            }
          }
        });

        anyWindow.google.accounts.id.renderButton(
          document.getElementById('googleBtn'),
          { theme: 'outline', size: 'large', width: 320 }
        );
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [role, wallId]);

  // --- 5. Yeni Anı Ekleme Fonksiyonu ---
  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    try {
      const response = await fetch(`${apiUrl}/api/memory/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallId, authorName, content })
      });

      if (response.ok) {
        setAuthorName('');
        setContent('');
        fetchMemories();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Ortak Arka Plan Tasarımı
  const sharedBackgroundStyle: React.CSSProperties = {
    minHeight: '100vh', width: '100%', backgroundColor: currentTheme.bg,
    backgroundImage: `linear-gradient(90deg, rgba(244, 63, 94, 0.02) 50%, transparent 50%), linear-gradient(rgba(244, 63, 94, 0.02) 50%, transparent 50%)`,
    backgroundSize: '80px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    fontFamily: '"Georgia", "Baskerville", "Times New Roman", serif', boxSizing: 'border-box', padding: '2rem',
    position: 'absolute', top: 0, left: 0
  };

  // ==========================================
  // 🔐 SENARYO 1: Kullanıcı Giriş Yapmadıysa
  // ==========================================
  if (role === 'Guest') {
    return (
      <div style={sharedBackgroundStyle}>
        <style>{`
          body, html, #root { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; overflow-x: hidden !important; }
        `}</style>
        <div style={{
          backgroundColor: '#ffffff', padding: '4rem 3rem', borderRadius: '28px',
          boxShadow: '0 25px 60px rgba(160, 43, 106, 0.06)', border: `1px solid ${currentTheme.border}`,
          textAlign: 'center', maxWidth: '500px', width: '100%', boxSizing: 'border-box'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '64px', display: 'block' }}>🔒</span>
          </div>
          <h2 style={{ 
            fontSize: '22px', fontStyle: 'italic', fontWeight: '700', color: currentTheme.primary, 
            margin: '0 auto 2.5rem auto', lineHeight: '1.6', maxWidth: '420px'
          }}>
            {statusMessage}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div id="googleBtn"></div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🎁 SENARYO 2: Başrol (Admin) - Sadece Sayaç Görür
  // ==========================================
  if (role === 'Admin') {
    return (
      <div style={sharedBackgroundStyle}>
        <div style={{ backgroundColor: '#ffffff', padding: '4rem 3rem', borderRadius: '28px', border: `1px solid ${currentTheme.border}`, textAlign: 'center', maxWidth: '550px', width: '100%', boxSizing: 'border-box', boxShadow: '0 20px 50px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🎁</div>
          <h1 style={{ fontSize: '36px', fontStyle: 'italic', color: currentTheme.primary, fontWeight: '700', margin: 0 }}>Şşşşt!</h1>
          <h2 style={{ color: '#7C5858', fontStyle: 'italic', fontSize: '20px', marginTop: '10px' }}>{wallTitle}</h2>
          <p style={{ color: '#7C5858', fontSize: '15px', marginTop: '20px' }}>Kapsülün Açılmasına Kalan Süre:</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
            {[
              { label: 'Gün', val: timeLeft.days }, 
              { label: 'Saat', val: timeLeft.hours }, 
              { label: 'Dak', val: timeLeft.minutes },
              { label: 'Sn', val: timeLeft.seconds }
            ].map((item, i) => (
              <div key={i} style={{ minWidth: '70px', padding: '0.75rem 1rem', backgroundColor: currentTheme.bg, borderRadius: '12px', border: `1px solid ${currentTheme.border}` }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: currentTheme.primary }}>{item.val}</div>
                <div style={{ fontSize: '12px', color: '#BFA7A7', marginTop: '4px' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ✍️ SENARYO 3: Davetli Erişimi - Anı Duvarı Ekranı
  // ==========================================
  return (
    <div style={{...sharedBackgroundStyle, justifyContent: 'flex-start'}}>
      <style>{`
        body, html, #root { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; overflow-x: hidden !important; }
      `}</style>
      <div style={{ width: '100%', maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '2.5rem', marginTop: '2rem' }}>
        
        {/* Üst Başlık Paneli */}
        <div style={{ textAlign: 'center', backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '24px', border: `1px solid ${currentTheme.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <h1 style={{ fontSize: '36px', fontStyle: 'italic', fontWeight: '700', color: currentTheme.primary, margin: 0 }}>🎉 {wallTitle}</h1>
          <p style={{ color: '#7C5858', fontWeight: 'bold', marginTop: '12px' }}>Oda ID: #{wallId} | ✍️ Davetli Erişimi</p>
        </div>

        {/* Anı Ekleme Formu */}
        <div style={{ backgroundColor: '#ffffff', padding: '3rem 2.5rem', borderRadius: '24px', border: `1px solid ${currentTheme.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: currentTheme.text, fontSize: '20px', fontStyle: 'italic' }}>✨ Duvara Bir Anı Bırak</h3>
          <form onSubmit={handleAddMemory} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <input type="text" placeholder="Adınız / Rumuzunuz" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: `1px solid ${currentTheme.border}`, backgroundColor: currentTheme.bg, outline: 'none', fontStyle: 'italic', fontSize: '15px' }} />
            <textarea rows={4} placeholder="Unutulmaz bir anını buraya iliştir..." value={content} onChange={(e) => setContent(e.target.value)} required style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: `1px solid ${currentTheme.border}`, backgroundColor: currentTheme.bg, outline: 'none', resize: 'vertical', fontStyle: 'italic', fontSize: '15px' }} />
            
            {/* Fotoğraf Alanı Tasarımı */}
            <div style={{ padding: '1.25rem', border: `2px dashed ${currentTheme.border}`, borderRadius: '12px', textAlign: 'center', cursor: 'pointer', color: '#7C5858', backgroundColor: currentTheme.bg, fontSize: '14px', fontStyle: 'italic' }}>
              📸 Fotoğraf Ekle (Çok Yakında)
            </div>

            <button type="submit" style={{ width: '100%', padding: '1.25rem', backgroundColor: currentTheme.primary, color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>🚀 Anıyı Duvara As</button>
          </form>
        </div>

        {/* Liste Alanı */}
        <div style={{ backgroundColor: '#ffffff', padding: '3rem 2.5rem', borderRadius: '24px', border: `1px solid ${currentTheme.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.02)', marginBottom: '4rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: currentTheme.text, fontSize: '20px', fontStyle: 'italic', borderBottom: `2px dashed ${currentTheme.border}`, paddingBottom: '0.75rem' }}>📝 Duvara Asılan Anılar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {memories.map((m) => (
              <div key={m.id} style={{ backgroundColor: currentTheme.bg, padding: '1.5rem', borderRadius: '16px', borderLeft: `6px solid ${currentTheme.primary}`, boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                <p style={{ margin: '0 0 1rem 0', fontStyle: 'italic', color: currentTheme.text, lineHeight: '1.6' }}>"{m.content}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#7C5858', fontWeight: '500' }}>
                  <span>✍️ {m.authorName}</span>
                  <span>{new Date(m.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            ))}
            {memories.length === 0 && <p style={{ color: '#BFA7A7', fontStyle: 'italic', textAlign: 'center', margin: '2rem 0' }}>Henüz hiç anı yazılmamış. İlk adımı sen at !</p>}
          </div>
        </div>

      </div>
    </div>
  );
}