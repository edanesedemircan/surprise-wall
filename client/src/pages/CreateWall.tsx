// Yeni Oda Oluşturma Ekranı
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CreateWall() {
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null'); 


  const [title, setTitle] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  
  // dinamik tema state'i (Varsayılan: birthday)
  const [selectedTheme, setSelectedTheme] = useState('birthday');
  
  // Yeni oluşturulan odanın ID'sini link paneli için hafızada tutan state
  const [createdWallId, setCreatedWallId] = useState<number | null>(null);

  // SAYAÇ İÇİN YENİ STATE YAPILARI
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [targetDate, setTargetDate] = useState('');

  // Konsept Kart Bilgileri
  const themes = [
    { id: 'birthday', label: 'Doğum Günü', icon: '🎉', color: '#6b21a8', bg: '#F3E8FF' },
    { id: 'romantic', label: 'Romantik Anılar', icon: '❤️', color: '#9f1238', bg: '#FFF1F2' },
    { id: 'graduation', label: 'Kep Fırlatma', icon: '🎓', color: '#0f172a', bg: '#F1F5F9' },
    { id: 'job', label: 'Yeni Başlangıç', icon: '💼', color: '#92400e', bg: '#FEF3C7' },
    { id: 'funny', label: 'Sadece Kutlama', icon: '🤪', color: '#db2777', bg: '#FCE7F3' },
  ];

  // EĞER KULLANICI GİRİŞ YAPMADIYSA FORMU GÖSTERMİYORUZ, BİR UYARI EKRANI VERİYORUZ
  if (!loggedInUser) {
    return (
      <div style={{ 
        minHeight: '100vh', width: '100vw', backgroundColor: '#FFF5F5',
        backgroundImage: `linear-gradient(90deg, rgba(244, 63, 94, 0.03) 50%, transparent 50%), linear-gradient(rgba(244, 63, 94, 0.03) 50%, transparent 50%)`,
        backgroundSize: '80px 80px', display: 'flex', justifyContent: 'center', alignItems: 'center',
        fontFamily: '"Georgia", serif', boxSizing: 'border-box', padding: '2rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff', padding: '3.5rem 3rem', borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(160, 43, 106, 0.06)', border: '1px solid #FECDD3',
          textAlign: 'center', maxWidth: '500px', width: '100%'
        }}>
          <span style={{ fontSize: '50px', display: 'block', marginBottom: '1rem' }}>🔑</span>
          <h3 style={{ fontSize: '26px', color: '#a02b6a', margin: '0 0 1rem 0', fontStyle: 'italic' }}>Giriş Yapılması Zorunlu</h3>
          <p style={{ color: '#7C5858', fontSize: '15px', lineHeight: '1.6', marginBottom: '2rem' }}>
            Kendi Zaman Kapsülünüzü oluşturmak ve odanın tam admin yetkisine sahip olmak için öncelikli olarak Google hesabınızla giriş yapmalısınız.
          </p>
          <button 
            onClick={() => navigate('/login')}
            style={{
              backgroundColor: '#a02b6a', color: 'white', border: 'none', padding: '1rem 2rem',
              borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer',
              fontStyle: 'italic', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#821f52'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#a02b6a'}
          >
            Google ile Giriş Yap ekranına Git
          </button>
        </div>
      </div>
    );
  }

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = emailInput.trim().toLowerCase();
    if (trimmed && !allowedEmails.includes(trimmed)) {
      setAllowedEmails([...allowedEmails, trimmed]);
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setAllowedEmails(allowedEmails.filter(email => email !== emailToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatusMessage('Zaman kapsülü oluşturuluyor...');
  setCreatedWallId(null); 

  // Güvenlik Kilidi: Eğer loggedInUser yoksa veya email'i boşsa çökmesin, elle yazılan targetEmail'i veya geçici bir şeyi baz alsın
  const creatorEmailValue = loggedInUser?.email || targetEmail || "test@gmail.com";

  // Tarih boşsa .NET DateTime modelinin çökmemesi için geçerli bir gelecek tarih verelim (Örn: 1 gün sonrası)
  let finalTargetDate = null;
  if (isCountdownActive && targetDate) {
    finalTargetDate = new Date(targetDate).toISOString();
  } else {
    // Sayaç aktif değilse bile .NET DateTime? (Nullable) değilse patlar. Garanti olsun diye bugünün tarihini ISO formatında verelim
    finalTargetDate = new Date().toISOString();
  }

  const payload = {
    title: title || "İsimsiz Duvar",
    theme: selectedTheme || "birthday",
    targetEmail: targetEmail,
    // Eğer allowedEmails array ise ve backend string[] bekliyorsa okey, ama düz string bekliyorsa .join(',') yapmak gerekir. Şimdilik array yolluyoruz:
    allowedEmails: allowedEmails || [], 
    creatorEmail: creatorEmailValue,
    isCountdownActive: !!isCountdownActive,
    targetDate: finalTargetDate
  };

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5106';
    const response = await fetch(`${apiUrl}/api/wall/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // 400 hatası alındığında mesajı okuyabilmek için önceden text olarak almayı deneyelim
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        setStatusMessage(`Hata: ${errorJson.message || errorText}`);
      } catch {
        setStatusMessage(`Hata (Kod 400): ${errorText || 'Backend veriyi kabul etmedi.'}`);
      }
      return;
    }

    const data = await response.json();
    setStatusMessage('🚀 Zaman kapsülü başarıyla oluşturuldu!');
    setCreatedWallId(data.wallId); 
    setTitle('');
    setTargetEmail('');
    setAllowedEmails([]);
    setIsCountdownActive(false);
    setTargetDate('');

  } catch (error) {
    setStatusMessage('API bağlantı hatası oluştu!');
  }
};

  const handleCopyLink = () => {
    if (!createdWallId) return;
    const currentUrl = window.location.origin;
    const magicLink = `${currentUrl}/#/wall/${createdWallId}` ;
    
    navigator.clipboard.writeText(magicLink)
      .then(() => {
        alert('Sihirli link panoya kopyalandı! 📋✨');
      })
      .catch(() => {
        alert('Kopyalama sırasında bir sorun oluştu.');
      });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      backgroundColor: '#FFF5F5', 
      backgroundImage: `linear-gradient(90deg, rgba(244, 63, 94, 0.03) 50%, transparent 50%), linear-gradient(rgba(244, 63, 94, 0.03) 50%, transparent 50%)`,
      backgroundSize: '80px 80px',
      fontFamily: '"Georgia", "Baskerville", "Times New Roman", serif', 
      margin: 0,
      padding: '4rem 2rem',
      boxSizing: 'border-box',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>

      <style>{`
        body, html, #root { margin: 0 !important; padding: 0 !important; width: 100% !important; overflow-x: hidden; }
        input::placeholder { color: '#BFA7A7' !important; font-style: italic; opacity: 0.7; }
      `}</style>

      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '750px',
        padding: '3.5rem 3rem',
        borderRadius: '24px', 
        boxShadow: '0 20px 50px rgba(160, 43, 106, 0.06)',
        border: '1px solid #FECDD3',
        boxSizing: 'border-box'
      }}>
        
        {/* Sayfa Başlığı */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '36px', fontStyle: 'italic', fontWeight: '700', color: '#a02b6a', margin: '0 0 0.5rem 0' }}>
            Bir Kutlama Odası Oluştur
          </h2>
          {statusMessage && (
            <p style={{ color: '#a02b6a', fontSize: '15px', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
              {statusMessage}
            </p>
          )}
          <p style={{ color: '#7C5858', fontSize: '15px', margin: 0, fontWeight: '500' }}>
            Sevdikleriniz için her ayrıntısını özgürce tasarlayacağınız Parti Duvarı'nı hazırlayın.
          </p>
        </div>

        {/* SİHİRLİ LINK KOPYALAMA PANELİ */}
        {createdWallId && (
          <div style={{ 
            marginBottom: '2rem', padding: '1.25rem', backgroundColor: '#FFF5F5', 
            borderRadius: '14px', border: '1px solid #FCA5A5', textAlign: 'center',
            boxShadow: '0 4px 15px rgba(160, 43, 106, 0.03)'
          }}>
            <p style={{ margin: '0 0 0.75rem 0', fontWeight: 'bold', color: '#a02b6a', fontSize: '15px', fontStyle: 'italic' }}>
              🔗 Arkadaş Grubu İçin Sihirli Link Hazır!
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', alignItems: 'center' }}>
              <input 
                type="text" 
                readOnly 
                value={`http://localhost:5173/wall/${createdWallId}`} 
                style={{ 
                  padding: '0.75rem 1rem', width: '70%', borderRadius: '10px', 
                  border: '1px solid #FCA5A5', fontSize: '13px', backgroundColor: '#fff',
                  color: '#7C5858', fontFamily: '"Segoe UI", sans-serif'
                }}
              />
              <button 
                type="button" 
                onClick={handleCopyLink} 
                style={{ 
                  padding: '0.75rem 1.25rem', backgroundColor: '#a02b6a', color: 'white', 
                  border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', 
                  fontSize: '13px', fontFamily: '"Segoe UI", sans-serif', transition: 'all 0.2s' 
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#821f52'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#a02b6a'}
              >
                📋 Kopyala
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* 1. INPUT: DUVAR BAŞLIĞI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#4A2828', fontSize: '16px', fontWeight: '700', fontStyle: 'italic' }}>Kapsül / Duvar Başlığı:</label>
            <input 
              type="text" 
              placeholder="Örn: X'nin Doğum Günü" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              style={{ 
                padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #FCA5A5', 
                backgroundColor: '#FFF5F5', color: '#4A2828', fontSize: '15px', outline: 'none',
                fontFamily: 'inherit', fontStyle: 'italic'
              }} 
              onFocus={(e) => e.target.style.borderColor = '#a02b6a'}
              onBlur={(e) => e.target.style.borderColor = '#FCA5A5'}
            />
          </div>

          {/* 2. INPUT: HEDEF E-POSTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#4A2828', fontSize: '16px', fontWeight: '700', fontStyle: 'italic' }}>Kimin İçin? (Hedef E-posta):</label>
            <input 
              type="email" 
              placeholder="Örn: xxx@gmail.com" 
              value={targetEmail} 
              onChange={(e) => setTargetEmail(e.target.value)} 
              required 
              style={{ 
                padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #FCA5A5', 
                backgroundColor: '#FFF5F5', color: '#4A2828', fontSize: '15px', outline: 'none',
                fontFamily: 'inherit', fontStyle: 'italic'
              }} 
              onFocus={(e) => e.target.style.borderColor = '#a02b6a'}
              onBlur={(e) => e.target.style.borderColor = '#FCA5A5'}
            />
          </div>

          {/* TEMA SEÇİM ALANI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ color: '#4A2828', fontSize: '16px', fontWeight: '700', fontStyle: 'italic' }}>Bir Kutlama Teması Seçin:</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
              {themes.map((t) => {
                const isSelected = selectedTheme === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTheme(t.id)}
                    style={{
                      flex: '1', minWidth: '110px', padding: '1rem 0.5rem', borderRadius: '14px',
                      backgroundColor: isSelected ? t.bg : '#ffffff',
                      border: isSelected ? `2px solid ${t.color}` : '1px solid #FCA5A5',
                      textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease',
                      transform: isSelected ? 'scale(1.03)' : 'scale(1)'
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '0.4rem' }}>{t.icon}</div>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: isSelected ? t.color : '#7C5858', fontFamily: '"Segoe UI", sans-serif' }}>
                      {t.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🎯 SÜRPRIZ SAYAÇ AYARLAMA ALANI (Yeni Eklenen Bölüm) */}
          <div style={{ 
            padding: '1.5rem', backgroundColor: '#FFF5F5', borderRadius: '16px', 
            border: '1px dashed #FCA5A5', display: 'flex', flexDirection: 'column', gap: '1rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setIsCountdownActive(!isCountdownActive)}>
              <input 
                type="checkbox" 
                checked={isCountdownActive} 
                onChange={(e) => setIsCountdownActive(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#a02b6a', cursor: 'pointer' }} 
              />
              <label style={{ color: '#4A2828', fontSize: '16px', fontWeight: '700', fontStyle: 'italic', cursor: 'pointer' }}>
                Zaman Ayarlı Kapsül / Geri Sayım Aktif Olsun mu? ⏳
              </label>
            </div>

            {isCountdownActive && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '13.5px', color: '#7C5858', fontStyle: 'italic' }}>Kapsülün Açılacağı Tarih ve Saati Seçin:</span>
                <input 
                  type="datetime-local" 
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required={isCountdownActive}
                  style={{ 
                    padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #FCA5A5',
                    backgroundColor: '#ffffff', color: '#4A2828', fontSize: '15px', fontFamily: '"Segoe UI", sans-serif', outline: 'none'
                  }} 
                />
              </div>
            )}
          </div>

          {/* 3. INPUT: DAVETLİLER LİSTESİ ALANI */}
          <div style={{ padding: '1.5rem', backgroundColor: '#FFF5F5', borderRadius: '16px', border: '1px dashed #FCA5A5' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', color: '#4A2828', fontSize: '16px', fontWeight: '700', fontStyle: 'italic' }}>
              Anı Yazabilecek Davetliler:
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <input 
                type="email" 
                placeholder="Örn: xxx@gmail.com" 
                value={emailInput} 
                onChange={(e) => setEmailInput(e.target.value)} 
                style={{ 
                  flex: 1, padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #FCA5A5',
                  backgroundColor: '#ffffff', color: '#4A2828', fontSize: '15px', outline: 'none', fontFamily: 'inherit', fontStyle: 'italic'
                }} 
              />
              <button 
                type="button" 
                onClick={handleAddEmail} 
                style={{ padding: '0 1.5rem', backgroundColor: '#a02b6a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', fontFamily: '"Segoe UI", sans-serif' }}
              >
                Ekle
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {allowedEmails.map((email, i) => (
                <span key={i} style={{ backgroundColor: '#FFE4E6', color: '#a02b6a', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', border: '1px solid #FECDD3', fontFamily: '"Segoe UI", sans-serif' }}>
                  {email} 
                  <button type="button" onClick={() => handleRemoveEmail(email)} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>✕</button>
                </span>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            style={{ 
              width: '100%', padding: '1.25rem', backgroundColor: '#a02b6a', color: 'white', 
              border: 'none', borderRadius: '14px', fontSize: '18px', fontWeight: 'bold', 
              cursor: 'pointer', fontFamily: 'inherit', fontStyle: 'italic',
              boxShadow: '0 8px 20px rgba(160, 43, 106, 0.15)'
            }}
          >
            🚀 Zaman Kapsülünü Oluştur
          </button>
        </form>
      </div>

    </div>
  );
}