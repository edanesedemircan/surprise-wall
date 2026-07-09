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

export function WallDetail({ role, title, onLoginSuccess }: WallDetailProps) {
  const { id } = useParams<{ id: string }>(); 
  const wallId = Number(id);

  const [memories, setMemories] = useState<Memory[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [statusMessage, setStatusMessage] = useState('İçerde neler döndüğünü görmek için kimliğinizi doğrulayın.');

  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 45, seconds: 0 });

  const fetchMemories = async () => {
    try {
      const response = await fetch(`http://localhost:5106/api/memory/wall/${wallId}`);
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

  useEffect(() => {
    if (role !== 'Admin') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        clearInterval(interval);
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [role]);

  const handleTestLogin = async () => {
    setStatusMessage('Güvenli çember kontrol ediliyor (Test Modu)...');
    try {
  
      const response = await fetch('http://localhost:5106/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallId: wallId,
          idToken: "test_token_eda_nese" 
        }),
      });

      const data = await response.json();

      if (response.ok) {
  
        onLoginSuccess(data.role, data.title, wallId);
      } else {
        setStatusMessage(`Giriş Engellendi: ${data.message}`);
      }
    } catch (error) {
      setStatusMessage('API bağlantı hatası! Backend projenin (5106) açık olduğundan emin ol');
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    try {
      const response = await fetch('http://localhost:5106/api/memory/add', {
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

  const sharedBackgroundStyle: React.CSSProperties = {
    minHeight: '100vh', width: '100%', backgroundColor: '#FFF5F5',
    backgroundImage: `linear-gradient(90deg, rgba(244, 63, 94, 0.03) 50%, transparent 50%), linear-gradient(rgba(244, 63, 94, 0.03) 50%, transparent 50%)`,
    backgroundSize: '80px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    fontFamily: '"Georgia", "Baskerville", "Times New Roman", serif', boxSizing: 'border-box', padding: '2rem',
    position: 'absolute', top: 0, left: 0
  };

  // 🔐 SENARYO 1: Kullanıcı henüz giriş yapmadıysa (GÜVENLİ GEÇİŞ KAPISI)
  if (role === 'Guest') {
    return (
      <div style={sharedBackgroundStyle}>
        <style>{`
          body, html, #root { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; overflow-x: hidden !important; }
        `}</style>

        <div style={{
          backgroundColor: '#ffffff', padding: '4rem 3rem', borderRadius: '28px',
          boxShadow: '0 25px 60px rgba(160, 43, 106, 0.08)', border: '1px solid #FECDD3',
          textAlign: 'center', maxWidth: '500px', width: '100%', boxSizing: 'border-box'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '64px', display: 'block', filter: 'drop-shadow(0 10px 12px rgba(160, 43, 106, 0.1))' }}>🔒</span>
          </div>

          <h2 style={{ 
            fontSize: '22px', fontStyle: 'italic', fontWeight: '700', color: '#a02b6a', 
            margin: '0 auto 2.5rem auto', lineHeight: '1.6', maxWidth: '420px'
          }}>
            {statusMessage}
          </h2>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <button
              onClick={handleTestLogin}
              style={{
                width: '100%',
                maxWidth: '320px',
                padding: '1rem 1.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                fontSize: '15px',
                fontWeight: '600',
                color: '#334155',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                fontFamily: '"Segoe UI", sans-serif'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.91c1.71-1.57 2.68-3.88 2.68-6.57z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.24c-.8.54-1.84.87-3.05.87-2.34 0-4.33-1.58-5.03-3.71H.95v2.3A9 9 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.97 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.96H.95A8.996 8.996 0 0 0 0 9c0 1.45.35 2.82.95 4.04l3.02-2.3z"/>
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46 1.02 11.42 0 9 0 5.48 0 2.45 2.02.95 4.96l3.02 2.3c.7-2.13 2.7-3.71 5.03-3.71z"/>
              </svg>
              Google ile Giriş Yap (Geliştirici Modu)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🎁 SENARYO 2: Başrol (Admin)
  if (role === 'Admin') {
    return (
      <div style={sharedBackgroundStyle}>
        <div style={{ backgroundColor: '#ffffff', padding: '4rem 3rem', borderRadius: '28px', border: '1px solid #FECDD3', textAlign: 'center', maxWidth: '550px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🎁</div>
          <h1 style={{ fontSize: '36px', fontStyle: 'italic', color: '#a02b6a', fontWeight: '700', margin: 0 }}>Şşşşt!</h1>
          <h2 style={{ color: '#7C5858', fontStyle: 'italic', fontSize: '20px' }}>Sana Bir Sürprizimiz Var!</h2>
          <p style={{ color: '#7C5858', fontSize: '15px' }}>Kapsülün Açılmasına Kalan Süre:</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            {[{ label: 'Gün', val: timeLeft.days }, { label: 'Saat', val: timeLeft.hours }, { label: 'Dak', val: timeLeft.minutes }].map((item, i) => (
              <div key={i} style={{ padding: '0.75rem 1rem', backgroundColor: '#FFF5F5', borderRadius: '12px', border: '1px solid #FECDD3' }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#a02b6a' }}>{item.val}</div>
                <div style={{ fontSize: '12px', color: '#BFA7A7' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ✍️ SENARYO 3: Davetli Erişimi
  return (
    <div style={{...sharedBackgroundStyle, justifyContent: 'flex-start'}}>
      <div style={{ width: '100%', maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div style={{ textAlign: 'center', backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '24px', border: '1px solid #FECDD3' }}>
          <h1 style={{ fontSize: '36px', fontStyle: 'italic', fontWeight: '700', color: '#a02b6a', margin: 0 }}>🎉 {title}</h1>
          <p style={{ color: '#7C5858', fontWeight: 'bold', marginTop: '10px' }}>Oda ID: #{wallId} | ✍️ Davetli Erişimi</p>
        </div>

        {/* Anı Listesi */}
        <div style={{ backgroundColor: '#ffffff', padding: '3rem 2.5rem', borderRadius: '24px', border: '1px solid #FECDD3' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#4A2828', fontSize: '20px', fontStyle: 'italic', borderBottom: '2px dashed #FECDD3', paddingBottom: '0.75rem' }}>📝 Duvara Asılan Anılar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {memories.map((m) => (
              <div key={m.id} style={{ backgroundColor: '#FFF5F5', padding: '1.5rem', borderRadius: '16px', borderLeft: '6px solid #a02b6a' }}>
                <p style={{ margin: '0 0 1rem 0', fontStyle: 'italic', color: '#4A2828' }}>"{m.content}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#7C5858' }}>
                  <span>✍️ {m.authorName}</span>
                  <span>{new Date(m.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            ))}
            {memories.length === 0 && <p style={{ color: '#BFA7A7', fontStyle: 'italic', textAlign: 'center' }}>Henüz hiç anı yazılmamış</p>}
          </div>
        </div>

        {/* Anı Ekleme Formu */}
        <div style={{ backgroundColor: '#ffffff', padding: '3rem 2.5rem', borderRadius: '24px', border: '1px solid #FECDD3' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#4A2828', fontSize: '20px', fontStyle: 'italic' }}>✨ Duvara Bir Anı Bırak</h3>
          <form onSubmit={handleAddMemory} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <input type="text" placeholder="Adınız / Rumuzunuz" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #FCA5A5', backgroundColor: '#FFF5F5', outline: 'none' }} />
            <textarea rows={4} placeholder="Unutulmaz bir anını buraya iliştir..." value={content} onChange={(e) => setContent(e.target.value)} required style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #FCA5A5', backgroundColor: '#FFF5F5', outline: 'none', resize: 'vertical' }} />
            <button type="submit" style={{ width: '100%', padding: '1.25rem', backgroundColor: '#a02b6a', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>🚀 Anıyı Duvara As</button>
          </form>
        </div>
      </div>
    </div>
  );
}