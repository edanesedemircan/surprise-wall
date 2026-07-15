import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function WallReveal() {
  const { id } = useParams<{ id: string }>();
  
  const [wallTitle, setWallTitle] = useState<string>('Kapsülün Açıldı! ✨');
  const [combinedItems, setCombinedItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null); 
  const [loading, setLoading] = useState<boolean>(true);

  // 🧠 HİLE KORUMASI: Başrolün çözdüğü soruları localStorage'da mühürlüyoruz
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem(`wall_${id}_answers`);
    return saved ? JSON.parse(saved) : {};
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5106';

  useEffect(() => {
    const fetchWallData = async () => {
      try {
        // 1. Oda detaylarını çekiyoruz
        const wallRes = await fetch(`${apiUrl}/api/wall/${id}`);
        if (wallRes.ok) {
          const wallData = await wallRes.json();
          setWallTitle(wallData.title || wallData.Title || 'Anı Odası');
        }

        // 2. Anıları ve soruları çekiyoruz
        const memoriesRes = await fetch(`${apiUrl}/api/Memory/wall/${id}`);
        if (memoriesRes.ok) {
          const memoriesData = await memoriesRes.json();
          
          // Soruları ve anıları tarihe göre harmanlıyoruz
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

  // 🎯 Şık tıklandığında çalışan interaktif quiz fonksiyonu (Modal içinde)
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

  // 🚨 SOLDAKİ SİYAH MENÜYÜ EZİP TAM EKRAN YAPAN VE KARELİ DEFTER DESENİ VEREN STİL
  const fullScreenStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    overflowY: 'auto', // Scrollbar ekler ki anılar aşağı indikçe kaydırabilelim
    zIndex: 9999, // Tüm layout'un üstüne çıkmak için!
    backgroundColor: '#F8FAFC', // MemoryWallGrid ile aynı açık gri-mavi zemin
    backgroundImage: `linear-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(90deg, #E2E8F0 1px, transparent 1px)`,
    backgroundSize: '30px 30px', // O muazzam kareli defter deseni
    padding: '4rem 2rem', 
    boxSizing: 'border-box', 
    fontFamily: '"Georgia", serif', 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  return (
    <div style={fullScreenStyle}>
      
      {/* 👑 ÜST KISIM: Sadece Başlığımız (Siyah bar tamamen yok oldu!) */}
      <div style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '4rem' }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontStyle: 'italic', 
          fontWeight: '900', 
          color: '#334155', 
          margin: '0 0 1rem 0',
          lineHeight: '1.3'
        }}>
          {wallTitle}
        </h1>
        <div style={{ width: '80px', height: '3px', backgroundColor: '#94A3B8', margin: '1.5rem auto 0 auto', borderRadius: '2px', opacity: 0.5 }} />
      </div>

      {/* 📌 AKIŞKAN GRİD ALANI (Tam istediğin gibi MemoryWallGrid klonu) */}
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {combinedItems.map((item, index) => {
            
            // ❓ Soru Kartı Tasarımı (Genişletilmiş if koşulu ile artık kaçamazlar!)
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
                    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
                    border: '2px dashed #94A3B8', // Fotoğraftaki kesik çizgiler!
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
                      backgroundColor: '#3B82F6', 
                      color: '#ffffff', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '11px', 
                      fontWeight: 'bold', 
                      fontFamily: 'sans-serif' 
                    }}>
                      ✨ KAPSÜL SORUSU
                    </div>
                  </div>

                  <h4 style={{ margin: '0.5rem 0', color: '#1E293B', fontStyle: 'italic', fontSize: '18px', textAlign: 'center' }}>
                    "{item.questionText || item.QuestionText}"
                  </h4>

                  {/* Şıklar A, B, C, D (Görseldeki gibi kartın üstünde de gözükecek ama burada tıklanmayacak, tıklanma modalda!) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const optText = item[`option${opt}`] || item[`Option${opt}`];
                      if (!optText) return null;
                      return (
                        <div key={opt} style={{ 
                          border: '1px solid #E2E8F0', 
                          padding: '10px', 
                          borderRadius: '12px', 
                          textAlign: 'center', 
                          fontSize: '14px',
                          color: '#475569',
                          fontFamily: 'sans-serif',
                          backgroundColor: '#ffffff'
                        }}>
                          {opt}) {optText}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span style={{ backgroundColor: '#F1F5F9', padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: '800', fontSize: '12px', color: '#475569', border: '1px solid #E2E8F0' }}>❓ {item.creatorName || item.CreatorName}</span>
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'sans-serif', fontWeight: 'bold' }}>{new Date(item.createdAt || item.CreatedAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              );
            }

            // ✍️ Anı Kartı Tasarımı (Fotoğraftaki Birebir Klon)
            const imageSource = item.imageUrl || item.ImageUrl;
            return (
              <div 
                key={`mem-${item.id}-${index}`} 
                onClick={() => setSelectedItem(item)} 
                style={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #E2E8F0', 
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
                <p style={{ margin: 0, color: '#475569', fontStyle: 'italic', lineHeight: '1.7', fontSize: '16px', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                  "{item.content || item.Content}"
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #E2E8F0', paddingTop: '1rem', marginTop: 'auto' }}>
                  <span style={{ backgroundColor: '#FFF7ED', padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: '800', fontSize: '12px', color: '#9A3412', border: '1px solid #FFEDD5' }}>✍️ {item.authorName || item.AuthorName}</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'sans-serif', fontWeight: 'bold' }}>{new Date(item.createdAt || item.CreatedAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🌌 BÜYÜTEÇ MODÜLÜ (Anı Detayı ve İnteraktif Çözümlü Soru Ekranı) */}
      {selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999 }}>
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

            {/* Modal İçi İnteraktif Soru Kontrolü */}
            {selectedItem.isQuiz || selectedItem.questionText || selectedItem.QuestionText || selectedItem.optionA || selectedItem.OptionA ? (
              (() => {
                const qId = selectedItem.id;
                const isAns = !!answers[qId];
                const userChoice = answers[qId];
                const correctChoice = selectedItem.correctOption || selectedItem.CorrectOption;

                return (
                  <>
                    <h3 style={{ margin: '0.5rem 0', color: '#1E293B', fontStyle: 'italic', fontSize: '26px', lineHeight: '1.5', fontWeight: '800', textAlign: 'center' }}>
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
                            optionBorder = '#10B981';
                            optionTextColor = '#065F46';
                          } else if (optionKey === userChoice && userChoice !== correctChoice) {
                            optionBg = '#FEE2E2'; 
                            optionBorder = '#EF4444';
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
                            <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: isAns && optionKey === correctChoice ? '#10B981' : (isAns && optionKey === userChoice ? '#EF4444' : '#94A3B8'), color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
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
                <p style={{ margin: '1rem 0', color: '#334155', fontStyle: 'italic', lineHeight: '1.8', fontSize: '20px', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                  "{selectedItem.content || selectedItem.Content}"
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #E2E8F0', paddingTop: '1.2rem' }}>
                  <span style={{ backgroundColor: '#FFF7ED', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: '800', fontSize: '13px', color: '#9A3412', border: '1px solid #FFEDD5' }}>✍️ {selectedItem.authorName || selectedItem.AuthorName}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}