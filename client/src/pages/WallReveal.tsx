import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// 🎨 Diğer dosyadaki tam ve orijinal renk paletlerimiz kanka!
const themeStyles: Record<string, any> = {
  birthday: { pageBg: '#FDF4FF', heroText: '#701A75', heroSubtext: '#A21CAF', cardBg: '#ffffff', border: '#E9D5FF', text: '#4A044E', author: '#A21CAF', badge: '#F3E8FF', accent: '#D946EF', success: '#10B981', danger: '#EF4444' },
  romantic: { pageBg: '#FFF5F5', heroText: '#881337', heroSubtext: '#9F1238', cardBg: '#ffffff', border: '#FECDD3', text: '#4C0519', author: '#9F1238', badge: '#FFF1F2', accent: '#E11D48', success: '#10B981', danger: '#EF4444' },
  graduation: { pageBg: '#F8FAFC', heroText: '#0C4A6E', heroSubtext: '#0369A1', cardBg: '#ffffff', border: '#BAE6FD', text: '#0F172A', author: '#0284C7', badge: '#F0F9FF', accent: '#0284C7', success: '#10B981', danger: '#EF4444' },
  job: { pageBg: '#FEFCE8', heroText: '#78350F', heroSubtext: '#92400E', cardBg: '#ffffff', border: '#FEF08A', text: '#451A03', author: '#B45309', badge: '#FEFCE8', accent: '#D97706', success: '#10B981', danger: '#EF4444' },
  funny: { pageBg: '#FFF5F8', heroText: '#831843', heroSubtext: '#9D174D', cardBg: '#ffffff', border: '#FBCFE8', text: '#4D072B', author: '#C2185B', badge: '#FFF1F2', accent: '#DB2777', success: '#10B981', danger: '#EF4444' }
};

export default function WallReveal() {
  const { id } = useParams<{ id: string }>();
  
  const [wallTitle, setWallTitle] = useState<string>('Kapsülün Açıldı! ✨');
  const [wallTheme, setWallTheme] = useState<string>('birthday');
  const [combinedItems, setCombinedItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null); 
  const [loading, setLoading] = useState<boolean>(true);

  // 🧠 HİLE KORUMASI: Başrolün çözdüğü soruları localStorage'da mühürlüyoruz kanka
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem(`wall_${id}_answers`);
    return saved ? JSON.parse(saved) : {};
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5106';

  const normalizedTheme = (wallTheme || 'birthday').toLowerCase();
  const currentTheme = themeStyles[normalizedTheme] || themeStyles.birthday;

  useEffect(() => {
    const fetchWallData = async () => {
      try {
        // 1. Odanın detaylarını ve asıl tema ismini çekiyoruz
        const wallRes = await fetch(`${apiUrl}/api/wall/${id}`);
        if (wallRes.ok) {
          const wallData = await wallRes.json();
          setWallTitle(wallData.title || wallData.Title || 'Anı Odası');
          
          const rawTheme = (wallData.theme || wallData.Theme || 'birthday').toLowerCase();
          setWallTheme(rawTheme);
        }

        // 2. Anıları ve soruları birlikte çekiyoruz
        const memoriesRes = await fetch(`${apiUrl}/api/Memory/wall/${id}`);
        if (memoriesRes.ok) {
          const memoriesData = await memoriesRes.json();
          // Yeniden eskiye sıralama yapıyoruz
          const sorted = memoriesData.sort((a: any, b: any) => 
            new Date(b.createdAt || b.CreatedAt).getTime() - new Date(a.createdAt || a.CreatedAt).getTime()
          );
          setCombinedItems(sorted);
        }
      } catch (err) {
        console.error('Veriler çekilirken hata oluştu:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchWallData();
  }, [id, apiUrl]);

  // 🎯 Şık tıklandığında çalışan quiz mühürleme fonksiyonu
  const handleOptionClick = (questionId: number, selectedOption: string) => {
    if (answers[questionId]) return;

    const newAnswers = { ...answers, [questionId]: selectedOption };
    setAnswers(newAnswers);
    localStorage.setItem(`wall_${id}_answers`, JSON.stringify(newAnswers));
  };

  if (loading) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', zIndex: 9999 }}>
        <h2 style={{ color: '#475569', fontStyle: 'italic', fontFamily: '"Georgia", serif' }}>Kapsül yükleniyor... 🗝️</h2>
      </div>
    );
  }

  // 🚨 SOLDAKİ SİYAH MENÜYÜ EZEN TAM EKRAN VE DÜZ TEMA RENKLİ CONTAINER STİLİ
  const fullScreenStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    overflowY: 'auto', 
    zIndex: 9999, 
    backgroundColor: currentTheme.pageBg, // Tam istediğin gibi düz tema rengi kanka!
    backgroundImage: 'none', // Ekose veya grid tamamen kaldırıldı
    padding: '4rem 2rem', 
    boxSizing: 'border-box', 
    fontFamily: '"Georgia", serif', 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  return (
    <div style={fullScreenStyle}>
      
      <style>{`
        body, html, #root { 
          margin: 0 !important; 
          padding: 0 !important; 
          width: 100% !important; 
          height: 100% !important; 
          overflow-x: hidden !important; 
        }
      `}</style>

        {/* 👑 ÜST KISIM: Yukarıya, sola ve sağa tamamen sıfırlanan asil panel kuşağı! */}
      <div style={{
        width: '100%', // Sağa ve sola tamamen dayansın diye kanka
        backgroundColor: currentTheme.pageBg, // Arka planla tamamen AYNI renk!
        borderBottom: `1.5px solid ${currentTheme.border}`, // Sadece alt kenarında o incecik sınır çizgisi kalıyor
        padding: '3.5rem 2rem', // İçerideki başlığın dikeyde rahat etmesi için tatlı bir dolgu
        textAlign: 'center',
        marginTop: 0, // Üstte hiçbir boşluk kalmasın, sıfırlansın
        marginBottom: '4rem', // Alttaki anı kartlarıyla arasındaki o konforlu mesafe
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        {/* Başlığımız */}
        <h1 style={{ 
          fontSize: '44px', 
          fontStyle: 'italic', 
          fontWeight: '900', 
          color: currentTheme.heroText, // Temanın o koyu asil bordo/mürdüm tonu
          margin: 0,
          lineHeight: '1.2',
          fontFamily: '"Georgia", serif'
        }}>
          {wallTitle}
        </h1>

        {/* Panel içi incecik, narin süs çizgisi */}
        <div style={{ 
          width: '50px', 
          height: '2px', 
          backgroundColor: currentTheme.heroText, 
          marginTop: '0.75rem', 
          borderRadius: '1px', 
          opacity: 0.25 
        }} />
      </div>

      {/* 📌 AKIŞKAN GRİD ALANI */}
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {combinedItems.map((item, index) => {
            
            // ❓ Soru Kartı mı Kontrolü
            const isQuestion = item.isQuiz || item.questionText || item.QuestionText || item.optionA || item.OptionA || item.type === 'question' || item.Type === 'Question';
            
            if (isQuestion) {
              const questionId = item.id;
              const isAnswered = !!answers[questionId];
              const userAnswer = answers[questionId];
              const correctChoice = item.correctOption || item.CorrectOption;
              const isCorrect = userAnswer === correctChoice;

              return (
                <div 
                  key={`quiz-${item.id}-${index}`} 
                  onClick={() => setSelectedItem(item)} 
                  style={{ 
                    backgroundColor: currentTheme.cardBg, 
                    border: isAnswered 
                      ? `2.5px solid ${isCorrect ? currentTheme.success : currentTheme.danger}`
                      : `2px dashed ${currentTheme.accent}`, // Temaya uygun kesikli çizgiler
                    borderRadius: '24px', 
                    padding: '1.5rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1rem', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ 
                      backgroundColor: isAnswered ? (isCorrect ? currentTheme.success : currentTheme.danger) : currentTheme.accent, 
                      color: '#ffffff', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '11px', 
                      fontWeight: 'bold', 
                      fontFamily: 'sans-serif' 
                    }}>
                      {isAnswered ? (isCorrect ? '🎉 DOĞRU BİLİNDİ' : '😢 YANLIŞ CEVAP') : '✨ KAPSÜL SORUSU'}
                    </div>
                  </div>

                  <h4 style={{ margin: '0.5rem 0', color: currentTheme.heroText, fontStyle: 'italic', fontSize: '18px', textAlign: 'center' }}>
                    "{item.questionText || item.QuestionText}"
                  </h4>

                  {/* Kart üstündeki şıklar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const optText = item[`option${opt}`] || item[`Option${opt}`];
                      if (!optText) return null;
                      return (
                        <div key={opt} style={{ 
                          border: `1px solid ${currentTheme.border}`, 
                          padding: '10px', 
                          borderRadius: '12px', 
                          textAlign: 'center', 
                          fontSize: '14px',
                          color: currentTheme.text,
                          fontFamily: 'sans-serif',
                          backgroundColor: '#ffffff'
                        }}>
                          {opt}) {optText}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span style={{ backgroundColor: currentTheme.badge, padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: '800', fontSize: '12px', color: currentTheme.author || currentTheme.heroText, border: `1px solid ${currentTheme.border}` }}>❓ {item.creatorName || item.CreatorName}</span>
                    <span style={{ fontSize: '11px', color: currentTheme.accent, fontFamily: 'sans-serif', fontWeight: 'bold' }}>{new Date(item.createdAt || item.CreatedAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              );
            }

            // ✍️ Anı Kartı Tasarımı
            const imageSource = item.imageUrl || item.ImageUrl;
            return (
              <div 
                key={`mem-${item.id}-${index}`} 
                onClick={() => setSelectedItem(item)} 
                style={{ 
                  backgroundColor: currentTheme.cardBg, 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '24px', 
                  padding: '1.75rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1.25rem', 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {imageSource && (
                  <div style={{ width: '100%', maxHeight: '240px', borderRadius: '16px', overflow: 'hidden' }}>
                    <img src={imageSource} alt="Anı" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <p style={{ margin: 0, color: currentTheme.text, fontStyle: 'italic', lineHeight: '1.7', fontSize: '16px', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                  "{item.content || item.Content}"
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px dashed ${currentTheme.border}`, paddingTop: '1rem', marginTop: 'auto' }}>
                  <span style={{ backgroundColor: currentTheme.badge, padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: '800', fontSize: '12px', color: currentTheme.author || currentTheme.heroText, border: `1px solid ${currentTheme.border}` }}>✍️ {item.authorName || item.AuthorName}</span>
                  <span style={{ fontSize: '11px', color: currentTheme.accent, fontFamily: 'sans-serif', fontWeight: 'bold' }}>{new Date(item.createdAt || item.CreatedAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🌌 BÜYÜTEÇ MODÜLÜ (Modal - Soru Çözme ve Büyük Anı Ekranı) */}
      {selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100000 }}>
          <div style={{ 
            backgroundColor: '#ffffff', 
            width: '90%', 
            maxWidth: '650px', 
            borderRadius: '28px', 
            padding: '2.5rem', 
            position: 'relative', 
            boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            animation: 'scaleIn 0.3s ease-out'
          }}>
            <button 
              onClick={() => setSelectedItem(null)} 
              style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '20px', color: '#94A3B8' }}
            >
              ✕
            </button>

            {/* Modal İçi Soru Çözme Modülü */}
            {selectedItem.isQuiz || selectedItem.questionText || selectedItem.QuestionText || selectedItem.optionA || selectedItem.OptionA ? (
              (() => {
                const qId = selectedItem.id;
                const isAns = !!answers[qId];
                const userChoice = answers[qId]; // 🚨 İsmi userChoice olarak mühürlendi, hata vermez!
                const correctChoice = selectedItem.correctOption || selectedItem.CorrectOption;

                return (
                  <>
                    <h3 style={{ margin: '0.5rem 0', color: currentTheme.heroText, fontStyle: 'italic', fontSize: '26px', lineHeight: '1.5', fontWeight: '800', textAlign: 'center' }}>
                      "{selectedItem.questionText || selectedItem.QuestionText}"
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
                      {['A', 'B', 'C', 'D'].map((optionKey) => {
                        const optionText = selectedItem[`option${optionKey}`] || selectedItem[`Option${optionKey}`];
                        if (!optionText) return null;

                        let optionBg = '#F8FAFC';
                        let optionBorder = '#E2E8F0';
                        let optionTextColor = '#475569';

                        if (isAns) {
                          if (optionKey === correctChoice) {
                            optionBg = '#D1FAE5'; 
                            optionBorder = currentTheme.success;
                            optionTextColor = '#065F46';
                          } else if (optionKey === userChoice && userChoice !== correctChoice) {
                            optionBg = '#FEE2E2'; 
                            optionBorder = currentTheme.danger;
                            optionTextColor = '#991B1B';
                          }
                        }

                        return (
                          <div 
                            key={optionKey} 
                            onClick={() => handleOptionClick(qId, optionKey)}
                            style={{ 
                              padding: '14px 18px', 
                              backgroundColor: optionBg, 
                              borderRadius: '16px', 
                              border: `2px solid ${optionBorder}`, 
                              color: optionTextColor, 
                              fontWeight: '600', 
                              fontSize: '15px',
                              cursor: isAns ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              fontFamily: 'sans-serif'
                            }}
                          >
                            <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: isAns && optionKey === correctChoice ? currentTheme.success : (isAns && optionKey === userChoice ? currentTheme.danger : '#94A3B8'), color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                              {optionKey}
                            </span>
                            {optionText}
                          </div>
                        );
                      })}
                    </div>

                    {isAns && (
                      <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '14px', backgroundColor: userChoice === correctChoice ? '#ECFDF5' : '#FEF2F2', color: userChoice === correctChoice ? '#047857' : '#B91C1C', textAlign: 'center', fontWeight: 'bold', fontStyle: 'italic', fontSize: '15px' }}>
                        {userChoice === correctChoice ? '🎉 Harika! Doğru bildin! 🥳' : `😢 Maalesef yanlış! Doğru cevap "${correctChoice}" olmalıydı. ❤️`}
                      </div>
                    )}
                  </>
                );
              })()
            ) : (
              /* Modal İçi Detaylı Anı */
              <>
                {(selectedItem.imageUrl || selectedItem.ImageUrl) && (
                  <div style={{ width: '100%', maxHeight: '380px', borderRadius: '20px', overflow: 'hidden' }}>
                    <img src={selectedItem.imageUrl || selectedItem.ImageUrl} alt="Anı" style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#F8FAFC' }} />
                  </div>
                )}
                <p style={{ margin: '1rem 0', color: currentTheme.text, fontStyle: 'italic', lineHeight: '1.8', fontSize: '20px', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                  "{selectedItem.content || selectedItem.Content}"
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px dashed ${currentTheme.border}`, paddingTop: '1.2rem' }}>
                  <span style={{ backgroundColor: currentTheme.badge, padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: '800', fontSize: '13px', color: currentTheme.text, border: `1px solid ${currentTheme.border}` }}>✍️ {selectedItem.authorName || selectedItem.AuthorName}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}