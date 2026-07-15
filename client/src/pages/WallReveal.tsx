import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Temalarımıza göre dinamik renk eşleştirmesi 
const themes: Record<string, any> = {
  default: {
    pageBg: '#FAF5F5',
    cardBg: '#ffffff',
    border: '#F2E8E8',
    text: '#5c4848',
    heroText: '#2D3E50',
    badge: '#F7EFEF',
    accent: '#0D80BF',
    success: '#10B981', // Doğru şık yeşili
    danger: '#EF4444',   // Yanlış şık kırmızısı
  },
  purple: {
    pageBg: '#f8f5fa',
    cardBg: '#ffffff',
    border: '#ebdff2',
    text: '#4a3b54',
    heroText: '#5e2780',
    badge: '#f0e6f7',
    accent: '#8a2be2',
    success: '#10B981',
    danger: '#EF4444',
  }
};

export default function WallReveal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State tanımlamalarımız
  const [wallTitle, setWallTitle] = useState<string>('Kapsülün Açıldı! ✨');
  const [combinedItems, setCombinedItems] = useState<any[]>([]);
  const [currentTheme, setCurrentTheme] = useState<any>(themes.default);
  const [selectedItem, setSelectedItem] = useState<any | null>(null); // Büyüteç modalı için
  const [loading, setLoading] = useState<boolean>(true);

  // 🧠 HİLE KORUMASI: Cevaplanan soruları localStorage'da mühürlüyoruz ki yenilese de gitmesin!
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem(`wall_${id}_answers`);
    return saved ? JSON.parse(saved) : {};
  });

  // Arka plandaki o şık ekose kare desenli kağıt yapısı
  const gridPatternStyle = `radial-gradient(${currentTheme.border} 1.5px, transparent 1.5px)`;

  useEffect(() => {
    const fetchWallData = async () => {
      try {
        // 1. Odanın detaylarını ve temasını çekiyoruz
        const wallRes = await fetch(`/api/Wall/${id}`);
        if (!wallRes.ok) throw new Error('Oda yüklenemedi');
        const wallData = await wallRes.json();
        
        if (wallData.title) setWallTitle(wallData.title);
        
        // Temayı eşleştiriyoruz
        const matchedTheme = themes[wallData.theme?.toLowerCase()] || themes.default;
        setCurrentTheme(matchedTheme);

        // 2. Odaya yazılan tüm anı ve soruları çekiyoruz
        const userEmail = localStorage.getItem('userEmail') || '';
        const memoriesRes = await fetch(`/api/Memory/wall/${id}?userEmail=${encodeURIComponent(userEmail)}`);
        if (memoriesRes.ok) {
          const memoriesData = await memoriesRes.json();
          // Hepsini tarihe göre sıralayarak akışa diziyoruz
          const sorted = memoriesData.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setCombinedItems(sorted);
        }
      } catch (err) {
        console.error('Veriler çekilirken hata oluştu:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallData();
  }, [id]);

  // 🎯 Şık tıklandığında çalışan interaktif quiz fonksiyonu
  const handleOptionClick = (questionId: number, selectedOption: string, correctOption: string) => {
    // 🔐 HİLE KORUMASI: Eğer bu soru zaten cevaplandıysa tıklamayı yok say!
    if (answers[questionId]) return;

    const newAnswers = { ...answers, [questionId]: selectedOption };
    setAnswers(newAnswers);
    localStorage.setItem(`wall_${id}_answers`, JSON.stringify(newAnswers));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentTheme.pageBg, color: currentTheme.heroText, fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '24px' }}>
        Kapsülün kapağı aralanıyor... 🗝️
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      backgroundColor: currentTheme.pageBg, 
      backgroundImage: gridPatternStyle,
      backgroundSize: '24px 24px',
      padding: '4rem 2rem', 
      boxSizing: 'border-box', 
      fontFamily: '"Georgia", serif', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: 0 
    }}>
      
      {/* 👑 1 NUMARALI ÜST KISIM: Sadece Odana Ait O Edebi Şık Başlık */}
      <div style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '4rem', animation: 'fadeIn 1s ease-out' }}>
        <h1 style={{ 
          fontSize: '42px', 
          fontStyle: 'italic', 
          fontWeight: '900', 
          color: currentTheme.heroText, 
          margin: '0 0 1rem 0',
          lineHeight: '1.3'
        }}>
          {wallTitle}
        </h1>
        <div style={{ width: '80px', height: '3px', backgroundColor: currentTheme.heroText, margin: '1.5rem auto 0 auto', borderRadius: '2px', opacity: 0.3 }} />
      </div>

      {/* 📌 AKIŞKAN GRID ALANI */}
      <div style={{ width: '100%', maxWidth: '1200px', animation: 'fadeIn 1.2s ease-out' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {combinedItems.map((item, index) => {
            
            // ❓ Soru Kartı Tasarımı
            if (item.isQuiz || item.questionText) {
              const questionId = item.id;
              const isAnswered = !!answers[questionId];
              const userAnswer = answers[questionId];
              const isCorrect = userAnswer === item.correctOption;

              return (
                <div 
                  key={`quiz-${item.id}-${index}`} 
                  onClick={() => setSelectedItem(item)} // Tıklanınca büyüteç modalı açılacak 
                  style={{ 
                    backgroundColor: currentTheme.cardBg, 
                    border: isAnswered 
                      ? `2.5px solid ${isCorrect ? currentTheme.success : currentTheme.danger}`
                      : `2.5px dashed ${currentTheme.accent}`, 
                    borderRadius: '24px', 
                    padding: '1.75rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1.25rem', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ 
                    display: 'inline-block', 
                    alignSelf: 'flex-start', 
                    backgroundColor: isAnswered ? (isCorrect ? currentTheme.success : currentTheme.danger) : currentTheme.accent, 
                    color: '#ffffff', 
                    padding: '3px 14px', 
                    borderRadius: '20px', 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    fontFamily: 'sans-serif' 
                  }}>
                    {isAnswered ? (isCorrect ? '🎉 DOĞRU BİLİNDİ' : '😢 MAALESEF YANLIŞ') : '✨ KAPSÜL SORUSU'}
                  </div>
                  <h4 style={{ margin: '5px 0', color: currentTheme.heroText, fontStyle: 'italic', fontSize: '18px', lineHeight: '1.5' }}>
                    "{item.questionText}"
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px dashed ${currentTheme.border}`, paddingTop: '0.8rem', marginTop: 'auto' }}>
                    <span style={{ backgroundColor: currentTheme.badge, padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: '800', fontSize: '12px', color: currentTheme.heroText, border: `1px solid ${currentTheme.border}` }}>❓ {item.creatorName}</span>
                    <span style={{ fontSize: '11px', color: '#BFA7A7', fontFamily: 'sans-serif', fontWeight: 'bold' }}>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
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
                  border: `2px solid ${currentTheme.border}`, 
                  borderRadius: '24px', 
                  padding: '1.75rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1.25rem', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.01)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {imageSource && (
                  <div style={{ width: '100%', maxHeight: '240px', borderRadius: '16px', overflow: 'hidden', border: `1px solid ${currentTheme.border}` }}>
                    <img src={imageSource} alt="Anı" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <p style={{ margin: 0, color: currentTheme.text, fontStyle: 'italic', lineHeight: '1.7', fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                  "{item.content}"
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px dashed ${currentTheme.border}`, paddingTop: '1rem', marginTop: 'auto' }}>
                  <span style={{ backgroundColor: currentTheme.badge, padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: '800', fontSize: '12px', color: currentTheme.heroText, border: `1px solid ${currentTheme.border}` }}>✍️ {item.authorName}</span>
                  <span style={{ fontSize: '11px', color: '#BFA7A7', fontFamily: 'sans-serif', fontWeight: 'bold' }}>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🌌 BÜYÜTEÇ MODÜLÜ (Anı / Soru Detay ve İnteraktif Çözüm Ekranı) */}
      {selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999 }}>
          <div style={{ 
            backgroundColor: '#ffffff', 
            width: '90%', 
            maxWidth: '650px', 
            borderRadius: '28px', 
            padding: '2.5rem', 
            position: 'relative', 
            border: `2px solid ${currentTheme.border}`, 
            boxShadow: '0 25px 50px rgba(0,0,0,0.12)',
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

            {selectedItem.isQuiz || selectedItem.questionText ? (
              /* ❓ İNTERAKTİF SORU MODAL İÇERİĞİ */
              (() => {
                const qId = selectedItem.id;
                const isAns = !!answers[qId];
                const userChoice = answers[qId];
                const correctChoice = selectedItem.correctOption; // Backend'deki doğru şık harfi

                return (
                  <>
                    <div style={{ 
                      display: 'inline-block', 
                      alignSelf: 'flex-start', 
                      backgroundColor: isAns ? (userChoice === correctChoice ? currentTheme.success : currentTheme.danger) : currentTheme.accent, 
                      color: '#ffffff', 
                      padding: '4px 14px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: 'bold', 
                      fontFamily: 'sans-serif' 
                    }}>
                      {isAns ? (userChoice === correctChoice ? '🎉 TEBRİKLER, DOĞRU!' : '😢 YANLIŞ CEVAP') : '✨ SÜRPRİZ KAPSÜL TESTİ'}
                    </div>
                    
                    <h3 style={{ margin: '0.5rem 0', color: currentTheme.heroText, fontStyle: 'italic', fontSize: '24px', lineHeight: '1.5', fontWeight: '800' }}>
                      "{selectedItem.questionText}"
                    </h3>

                    {/* Şıklar Listesi */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '0.5rem' }}>
                      {['A', 'B', 'C', 'D'].map((optionKey) => {
                        const optionText = selectedItem[`option${optionKey}`];
                        if (!optionText) return null;

                       
                        let optionBg = currentTheme.badge;
                        let optionBorder = currentTheme.border;
                        let optionTextColor = currentTheme.text;

                        if (isAns) {
                          if (optionKey === correctChoice) {
                            // Doğru olan şık her zaman yeşil yanar
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
                            onClick={() => handleOptionClick(qId, optionKey, correctChoice)}
                            style={{ 
                              padding: '14px 18px', 
                              backgroundColor: optionBg, 
                              borderRadius: '16px', 
                              border: `2px solid ${optionBorder}`, 
                              color: optionTextColor, 
                              fontWeight: '600', 
                              fontSize: '15px',
                              cursor: isAns ? 'default' : 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px'
                            }}
                            onMouseEnter={(e) => {
                              if (!isAns) {
                                e.currentTarget.style.transform = 'translateX(6px)';
                                e.currentTarget.style.borderColor = currentTheme.accent;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isAns) {
                                e.currentTarget.style.transform = 'translateX(0)';
                                e.currentTarget.style.borderColor = optionBorder;
                              }
                            }}
                          >
                            <span style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '50%', 
                              backgroundColor: isAns && optionKey === correctChoice ? currentTheme.success : (isAns && optionKey === userChoice ? currentTheme.danger : '#94A3B8'),
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {optionKey}
                            </span>
                            {optionText}
                          </div>
                        );
                      })}
                    </div>

                    {/* Eğlenceli geri bildirim mesajları */}
                    {isAns && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        borderRadius: '14px',
                        backgroundColor: userChoice === correctChoice ? '#ECFDF5' : '#FEF2F2',
                        color: userChoice === correctChoice ? '#047857' : '#B91C1C',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontStyle: 'italic',
                        fontSize: '15px',
                        animation: 'fadeIn 0.5s'
                      }}>
                        {userChoice === correctChoice 
                          ? '🎉 Vay be! Seni gerçekten çok iyi tanıyorlar, helal olsun! 🥳' 
                          : `😢 Uuuu, yanlış cevap! Doğru cevap "${correctChoice}" şıkkıydı. Olsun, canın sağ olsun! ❤️`}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px dashed ${currentTheme.border}`, paddingTop: '1.2rem', marginTop: '1rem' }}>
                      <span style={{ backgroundColor: currentTheme.badge, padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: '800', fontSize: '13px', color: currentTheme.heroText, border: `1px solid ${currentTheme.border}` }}>❓ {selectedItem.creatorName}</span>
                      <span style={{ fontSize: '12px', color: '#BFA7A7', fontWeight: 'bold' }}>{new Date(selectedItem.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </>
                );
              })()
            ) : (
              /* ✍️ DETAY: ANI MODAL İÇERİĞİ */
              <>
                {selectedItem.imageUrl || selectedItem.ImageUrl ? (
                  <div style={{ width: '100%', maxHeight: '380px', borderRadius: '20px', overflow: 'hidden', border: `1px solid ${currentTheme.border}` }}>
                    <img src={selectedItem.imageUrl || selectedItem.ImageUrl} alt="Büyük Anı Görseli" style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#fafafa' }} />
                  </div>
                ) : null}
                <p style={{ 
                  margin: '1rem 0', 
                  color: currentTheme.text, 
                  fontStyle: 'italic', 
                  lineHeight: '1.8', 
                  fontSize: '18px', 
                  whiteSpace: 'pre-wrap',
                  textAlign: 'center' 
                }}>
                  "{selectedItem.content}"
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px dashed ${currentTheme.border}`, paddingTop: '1.2rem' }}>
                  <span style={{ backgroundColor: currentTheme.badge, padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: '800', fontSize: '13px', color: currentTheme.heroText, border: `1px solid ${currentTheme.border}` }}>✍️ {selectedItem.authorName}</span>
                  <span style={{ fontSize: '12px', color: '#BFA7A7', fontWeight: 'bold' }}>{new Date(selectedItem.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}