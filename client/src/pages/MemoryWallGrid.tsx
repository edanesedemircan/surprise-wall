import React, { useState, useEffect, useRef } from 'react';

interface Memory {
  id: number;
  authorName: string;
  content: string;
  imageUrl?: string;
  ImageUrl?: string;
  createdAt: string;
  isQuiz?: boolean; // Kartları ayırmak için kanka
}

interface QuizQuestion {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  creatorName: string;
  createdAt: string;
  isQuiz?: boolean;
}

interface MemoryWallGridProps {
  wallId: number;
  wallTitle: string;
  themeName: 'birthday' | 'romantic' | 'graduation' | 'job' | 'funny';
  apiUrl: string;
}

const themeStyles = {
  birthday: { pageBg: '#FAE8FF', heroText: '#701A75', heroSubtext: '#A21CAF', cardBg: '#ffffff', border: '#E9D5FF', text: '#4A044E', author: '#A21CAF', badge: '#F3E8FF', accent: '#D946EF' },
  romantic: { pageBg: '#FFE4E6', heroText: '#881337', heroSubtext: '#9F1238', cardBg: '#ffffff', border: '#FECDD3', text: '#4C0519', author: '#9F1238', badge: '#FFF1F2', accent: '#E11D48' },
  graduation: { pageBg: '#E0F2FE', heroText: '#0C4A6E', heroSubtext: '#0369A1', cardBg: '#ffffff', border: '#BAE6FD', text: '#0F172A', author: '#0284C7', badge: '#F0F9FF', accent: '#0284C7' },
  job: { pageBg: '#FEF9C3', heroText: '#78350F', heroSubtext: '#92400E', cardBg: '#ffffff', border: '#FEF08A', text: '#451A03', author: '#B45309', badge: '#FEFCE8', accent: '#D97706' },
  funny: { pageBg: '#FCE7F3', heroText: '#831843', heroSubtext: '#9D174D', cardBg: '#ffffff', border: '#FBCFE8', text: '#4D072B', author: '#C2185B', badge: '#FFF1F2', accent: '#DB2777' }
};

export function MemoryWallGrid({ wallId, wallTitle, themeName, apiUrl }: MemoryWallGridProps) {
  const colors = themeStyles[themeName] || themeStyles.graduation;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [memories, setMemories] = useState<Memory[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [combinedItems, setCombinedItems] = useState<any[]>([]); // Hem anı hem soruların mikslendiği yer kanka
  const [isAnıModalOpen, setIsAnıModalOpen] = useState(false);
  const [isQuizPanelOpen, setIsQuizPanelOpen] = useState(false);
  
  // Anı Form State'leri
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingMemoryId, setEditingMemoryId] = useState<number | null>(null);

  // Soru Paneli State'leri
  const [creatorName, setCreatorName] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');

  const fetchMemories = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/memory/wall/${wallId}`);
      if (response.ok) return await response.json();
    } catch (error) { console.error('Anılar çekilemedi:', error); }
    return [];
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/quiz/wall/${wallId}`);
      if (response.ok) return await response.json();
    } catch (error) { console.error('Sorular çekilemedi:', error); }
    return [];
  };

  // 🚀 İki veri kaynağını da çekip tarihe göre harmanlayan canavar fonksiyon:
  const loadAllData = async () => {
    const mems = await fetchMemories();
    const quizes = await fetchQuestions();

    // Ayırt edici flag ekliyoruz kanka
    const markedMems = mems.map((m: any) => ({ ...m, isQuiz: false }));
    const markedQuizes = quizes.map((q: any) => ({ ...q, isQuiz: true }));

    // Hepsini tek havuzda toplayıp kronolojik diziyoruz kanka
    const sortedPool = [...markedMems, ...markedQuizes].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    setMemories(mems);
    setQuestions(quizes);
    setCombinedItems(sortedPool);
  };

  useEffect(() => {
    if (wallId) loadAllData();
  }, [wallId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteMemory = async (id: number) => {
    if (!window.confirm("Bu anıyı kalıcı olarak silmek istediğine emin misin kanka? 😮")) return;
    try {
      const response = await fetch(`${apiUrl}/api/memory/${id}`, { method: 'DELETE' });
      if (response.ok) loadAllData();
    } catch (error) { console.error(error); }
  };

  const startEditMemory = (memory: Memory) => {
    setEditingMemoryId(memory.id);
    setAuthorName(memory.authorName);
    setContent(memory.content);
    setSelectedImage(memory.imageUrl || memory.ImageUrl || null);
    setIsAnıModalOpen(true);
  };

  const handleAnıSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;
    try {
      const isEditing = editingMemoryId !== null;
      const url = isEditing ? `${apiUrl}/api/memory/${editingMemoryId}` : `${apiUrl}/api/memory/add`;
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallId, authorName, content, imageUrl: selectedImage || null })
      });
      if (response.ok) {
        setAuthorName(''); setContent(''); setSelectedImage(null); setEditingMemoryId(null); setIsAnıModalOpen(false); 
        loadAllData();
      }
    } catch (error) { console.error(error); }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/quiz/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallId, questionText, optionA, optionB, optionC, optionD, correctOption, creatorName: creatorName || 'Anonim' })
      });
      if (response.ok) {
        // 🚀 Kaydet deyince panel kayıp kapansın ve temizlensin kanka
        setQuestionText(''); setOptionA(''); setOptionB(''); setOptionC(''); setOptionD(''); setCreatorName(''); setCorrectOption('A');
        setIsQuizPanelOpen(false);
        loadAllData(); // Grid güncellensin
      }
    } catch (error) { console.error(error); }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: colors.pageBg, padding: '0 0 5rem 0', fontFamily: '"Georgia", serif', margin: 0 }}>
      <style>{`
        body, html, #root { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; background-color: ${colors.pageBg} !important; overflow-x: hidden; }
      `}</style>
      
      {/* Üst Kısım: Hero Alanı */}
      <div style={{ textAlign: 'center', padding: '5rem 1.5rem 4rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '48px', fontStyle: 'italic', fontWeight: '900', color: colors.heroText, margin: '0 0 1rem 0' }}>{wallTitle}</h1>
        <p style={{ color: colors.heroSubtext, fontFamily: '"Segoe UI", sans-serif', fontSize: '17px', fontWeight: '600' }}>
          Sevdiklerinize en güzel dijital notlarınızı bırakın ve başrole özel sürpriz şıklı sorular hazırlayın! ✨
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem', boxSizing: 'border-box' }}>
        
        {/* 🚀 Yenilenen Üst Panel: Arama kaldırıldı, butonlar şık bir şekilde sağa yaslandı */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '3rem', padding: '1.25rem 1.75rem', backgroundColor: '#ffffff', borderRadius: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 10px 25px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => { setEditingMemoryId(null); setIsAnıModalOpen(true); }} style={{ padding: '0.8rem 1.6rem', borderRadius: '12px', backgroundColor: colors.accent, color: '#ffffff', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
              ✨ Anı Bırak
            </button>
            <button onClick={() => setIsQuizPanelOpen(true)} style={{ padding: '0.8rem 1.6rem', borderRadius: '12px', backgroundColor: colors.heroText, color: '#ffffff', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
              ❓ Başrole Soru Sor Kartı
            </button>
          </div>
        </div>

        {/* 🚀 Karışık Grid Yapısı (Hem Anılar Hem Sorular Bir Arada!) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {combinedItems.map((item, index) => {
            
            // 🟥 EĞER BU BİR SORU KARTI İSE:
            if (item.isQuiz) {
              return (
                <div key={`quiz-${item.id}-${index}`} style={{ backgroundColor: colors.cardBg, border: `2.5px dashed ${colors.accent}`, borderRadius: '24px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', boxShadow: '0 12px 30px rgba(0,0,0,0.03)' }}>
                  <div style={{ position: 'absolute', top: '-12px', left: '20px', backgroundColor: colors.accent, color: '#ffffff', padding: '2px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
                    🧠 DOSTLUK TESTİ
                  </div>
                  
                  <h4 style={{ margin: '10px 0 5px 0', color: colors.heroText, fontStyle: 'italic', fontSize: '18px', lineHeight: '1.5' }}>
                    "{item.questionText}"
                  </h4>

                  {/* Küçük Şık Önizlemeleri */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', opacity: 0.85, fontSize: '13px', fontFamily: 'sans-serif', fontWeight: '600' }}>
                    <div style={{ padding: '4px 8px', backgroundColor: colors.pageBg, borderRadius: '6px' }}>A) {item.optionA}</div>
                    <div style={{ padding: '4px 8px', backgroundColor: colors.pageBg, borderRadius: '6px' }}>B) {item.optionB}</div>
                    <div style={{ padding: '4px 8px', backgroundColor: colors.pageBg, borderRadius: '6px' }}>C) {item.optionC}</div>
                    <div style={{ padding: '4px 8px', backgroundColor: colors.pageBg, borderRadius: '6px' }}>D) {item.optionD}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px dashed ${colors.border}`, paddingTop: '0.8rem', marginTop: 'auto' }}>
                    <span style={{ backgroundColor: colors.badge, padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: '800', fontSize: '12px', color: colors.heroText }}>❓ {item.creatorName}</span>
                    <span style={{ fontSize: '11px', color: '#BFA7A7', fontFamily: 'sans-serif', fontWeight: 'bold' }}>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              );
            }

            // 🟦 EĞER BU NORMAL BİR ANI KARTI İSE:
            const imageSource = item.imageUrl || item.ImageUrl;
            return (
              <div key={`mem-${item.id}-${index}`} style={{ backgroundColor: colors.cardBg, border: `2px solid ${colors.border}`, borderRadius: '24px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 10, backgroundColor: 'rgba(255,255,255,0.9)', padding: '6px 10px', borderRadius: '20px', border: `1px solid ${colors.border}` }}>
                  <button onClick={() => startEditMemory(item)} title="Düzenle" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✏️</button>
                  <button onClick={() => handleDeleteMemory(item.id)} title="Sil" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
                </div>
                {imageSource && (
                  <div style={{ width: '100%', maxHeight: '240px', borderRadius: '16px', overflow: 'hidden', marginTop: '0.5rem', border: `1px solid ${colors.border}` }}>
                    <img src={imageSource} alt="Anı" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <p style={{ margin: 0, color: colors.text, fontStyle: 'italic', lineHeight: '1.7', fontSize: '16px', whiteSpace: 'pre-wrap' }}>"{item.content}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px dashed ${colors.border}`, paddingTop: '1rem', marginTop: 'auto' }}>
                  <span style={{ backgroundColor: colors.badge, padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: '800', fontSize: '12px', color: colors.heroText, border: `1px solid ${colors.border}` }}>✍️ {item.authorName}</span>
                  <span style={{ fontSize: '11px', color: '#BFA7A7', fontFamily: 'sans-serif', fontWeight: 'bold' }}>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🧠 SAĞDAN KAYARAK AÇILAN BAĞIMSIZ SORU PANELİ */}
      {isQuizPanelOpen && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.2)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end', zIndex: 99999 }}>
          <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '460px', height: '100vh', padding: '2.5rem', boxSizing: 'border-box', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '-10px 0 35px rgba(0,0,0,0.05)', borderLeft: `2px solid ${colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${colors.border}`, paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: colors.heroText, fontStyle: 'italic', fontSize: '24px', fontWeight: '900' }}>❓ Başrole Soru Hazırla</h3>
              <button onClick={() => setIsQuizPanelOpen(false)} style={{ border: 'none', background: 'none', fontSize: '22px', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
            </div>

            <form onSubmit={handleQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <input type="text" placeholder="Adınız / Rumuzunuz" value={creatorName} onChange={(e) => setCreatorName(e.target.value)} required style={{ padding: '0.85rem 1.25rem', borderRadius: '14px', border: `2px solid ${colors.border}`, backgroundColor: colors.pageBg, color: colors.text, outline: 'none', fontSize: '15px' }} />
              <textarea rows={3} placeholder="Sorunuzu yazın..." value={questionText} onChange={(e) => setQuestionText(e.target.value)} required style={{ padding: '0.85rem 1.25rem', borderRadius: '14px', border: `2px solid ${colors.border}`, backgroundColor: colors.pageBg, color: colors.text, outline: 'none', fontSize: '15px', resize: 'none', lineHeight: '1.5' }} />
              
              {[
                { key: 'A', state: optionA, setter: setOptionA, ph: 'A Şıkkı...' },
                { key: 'B', state: optionB, setter: setOptionB, ph: 'B Şıkkı...' },
                { key: 'C', state: optionC, setter: setOptionC, ph: 'C Şıkkı...' },
                { key: 'D', state: optionD, setter: setOptionD, ph: 'D Şıkkı...' }
              ].map((item) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: colors.pageBg, padding: '0.5rem 1rem', borderRadius: '14px', border: `2px solid ${colors.border}` }}>
                  <input type="radio" name="sidebarCorrectOption" checked={correctOption === item.key} onChange={() => setCorrectOption(item.key)} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: colors.accent }} />
                  <span style={{ fontWeight: 'bold', color: colors.heroText }}>{item.key})</span>
                  <input type="text" placeholder={item.ph} value={item.state} onChange={(e) => item.setter(e.target.value)} required style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '14px', color: colors.text, fontWeight: '500' }} />
                </div>
              ))}
              <button type="submit" style={{ width: '100%', padding: '1.1rem', backgroundColor: colors.heroText, color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '0.5rem' }}>
                🚀 Soruyu Kapsüle Kilitle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ✨ ANI MODALI */}
      {isAnıModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '500px', borderRadius: '28px', padding: '2.5rem', position: 'relative', border: `2px solid ${colors.border}`, boxShadow: '0 25px 50px rgba(0,0,0,0.08)' }}>
            <button onClick={() => { setIsAnıModalOpen(false); setSelectedImage(null); setEditingMemoryId(null); setAuthorName(''); setContent(''); }} style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '18px', color: '#94A3B8' }}>✕</button>
            <h3 style={{ margin: '0 0 1.75rem 0', fontStyle: 'italic', color: colors.heroText, fontSize: '24px', fontWeight: '800' }}>{editingMemoryId ? '📝 Anıyı Düzenle' : '✨ Duvara Bir Anı İliştir'}</h3>
            <form onSubmit={handleAnıSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <input type="text" placeholder="Adınız / Rumuzunuz" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required style={{ width: '100%', padding: '0.95rem 1.25rem', borderRadius: '14px', border: `2px solid ${colors.border}`, color: colors.text, outline: 'none', fontSize: '15px' }} />
              <textarea rows={4} placeholder="Anınızı buraya dökün..." value={content} onChange={(e) => setContent(e.target.value)} required style={{ width: '100%', padding: '0.95rem 1.25rem', borderRadius: '14px', border: `2px solid ${colors.border}`, color: colors.text, outline: 'none', fontSize: '15px', resize: 'none', lineHeight: '1.5' }} />
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
              {!selectedImage ? (
                <div onClick={() => fileInputRef.current?.click()} style={{ padding: '1.5rem', border: `2px dashed ${colors.accent}`, borderRadius: '14px', textAlign: 'center', cursor: 'pointer', backgroundColor: colors.badge, fontStyle: 'italic', fontSize: '14px', color: colors.heroText, fontWeight: 'bold' }}>📸 Fotoğraf Ekle / Değiştir</div>
              ) : (
                <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '14px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                  <img src={selectedImage} alt="Önizleme" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              )}
              <button type="submit" style={{ width: '100%', padding: '1.1rem', backgroundColor: colors.accent, color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                {editingMemoryId ? '💾 Değişiklikleri Kaydet' : '🚀 Anıyı Duvara As'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}