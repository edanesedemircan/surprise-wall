import React, { useState, useEffect, useRef } from 'react';

interface Memory {
  id: number;
  authorName: string;
  content: string;
  imageUrl?: string;
  ImageUrl?: string;
  createdAt: string;
}

interface MemoryWallGridProps {
  wallId: number;
  wallTitle: string;
  themeName: 'birthday' | 'romantic' | 'graduation' | 'job' | 'funny';
  apiUrl: string;
}

// 🎨 Temaların tüm sayfaya hükmeden genişletilmiş renk paletleri:
const themeStyles = {
  birthday: {
    pageBg: '#FDF4FF', 
    heroText: '#4A044E',
    heroSubtext: '#701A75',
    cardBg: '#ffffff',
    border: '#F3E8FF',
    text: '#3B0764',
    author: '#7C5858',
    badge: '#F3E8FF',
    accent: '#a21caf', 
    gridGap: '#FAE8FF'
  },
  romantic: {
    pageBg: '#FFF5F5', 
    heroText: '#4C0519',
    heroSubtext: '#881337',
    cardBg: '#ffffff',
    border: '#FFE4E6',
    text: '#4C0519',
    author: '#9f1238',
    badge: '#FFF1F2',
    accent: '#e11d48', 
    gridGap: '#FFE4E6'
  },
  graduation: {
    pageBg: '#F8FAFC', 
    heroText: '#0F172A',
    heroSubtext: '#334155',
    cardBg: '#ffffff',
    border: '#E2E8F0',
    text: '#0F172A',
    author: '#475569',
    badge: '#F1F5F9',
    accent: '#2563eb', 
    gridGap: '#E2E8F0'
  },
  job: {
    pageBg: '#FEFCE8', 
    heroText: '#451A03',
    heroSubtext: '#78350F',
    cardBg: '#ffffff',
    border: '#FEF3C7',
    text: '#451A03',
    author: '#92400e',
    badge: '#FEF3C7',
    accent: '#d97706', 
    gridGap: '#FEF3C7'
  },
  funny: {
    pageBg: '#FFF5F8',
    heroText: '#4D072B',
    heroSubtext: '#831843',
    cardBg: '#ffffff',
    border: '#FCE7F3',
    text: '#4D072B',
    author: '#db2777',
    badge: '#FCE7F3',
    accent: '#db2777', 
    gridGap: '#FCE7F3'
  }
};

export function MemoryWallGrid({ wallId, wallTitle, themeName, apiUrl }: MemoryWallGridProps) {
  const colors = themeStyles[themeName] || themeStyles.graduation;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State'leri
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingMemoryId, setEditingMemoryId] = useState<number | null>(null);

  const fetchMemories = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/memory/wall/${wallId}`);
      if (response.ok) {
        const data = await response.json();
        setMemories(data);
      }
    } catch (error) {
      console.error('Anılar çekilemedi:', error);
    }
  };

  useEffect(() => {
    if (wallId) fetchMemories();
  }, [wallId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bu anıyı kalıcı olarak silmek istediğine emin misin?")) return;
    try {
      const response = await fetch(`${apiUrl}/api/memory/${id}`, { method: 'DELETE' });
      if (response.ok) fetchMemories();
    } catch (error) {
      console.error("Silme işlemi başarısız:", error);
    }
  };

  const startEdit = (memory: Memory) => {
    setEditingMemoryId(memory.id);
    setAuthorName(memory.authorName);
    setContent(memory.content);
    setSelectedImage(memory.imageUrl || memory.ImageUrl || null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
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
        setAuthorName('');
        setContent('');
        setSelectedImage(null);
        setEditingMemoryId(null);
        setIsModalOpen(false);
        fetchMemories();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
 
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      backgroundColor: colors.pageBg, 
      boxSizing: 'border-box', 
      padding: '0 0 5rem 0', 
      fontFamily: '"Georgia", serif',
      margin: 0
    }}>
      <style>{`
        body, html, #root { 
          margin: 0 !important; 
          padding: 0 !important; 
          width: 100% !important; 
          height: 100% !important; 
          background-color: ${colors.pageBg} !important;
          overflow-x: hidden; 
        }
      `}</style>
      
      <div style={{ 
        textAlign: 'center', 
        padding: '5rem 1.5rem 4rem 1.5rem', 
        maxWidth: '800px', 
        margin: '0 auto' 
      }}>
        <h1 style={{ 
          fontSize: '46px', 
          fontStyle: 'italic', 
          fontWeight: '800', 
          color: colors.heroText, 
          margin: '0 0 1rem 0',
          letterSpacing: '-0.5px'
        }}>
          {wallTitle}
        </h1>
        <p style={{ 
          color: colors.heroSubtext, 
          fontFamily: '"Segoe UI", sans-serif', 
          fontSize: '16px', 
          lineHeight: '1.6',
          margin: '0 0 0.5rem 0',
          fontStyle: 'italic'
        }}>
          Sevdiklerinize en güzel dijital notlarınızı, fotoğraflarınızı ve kalıcı anılarınızı bırakın... ✨
        </p>
        <span style={{ 
          display: 'inline-block',
          backgroundColor: colors.badge, 
          color: colors.heroText, 
          fontFamily: 'sans-serif', 
          fontWeight: 'bold', 
          fontSize: '12px', 
          padding: '0.4rem 1rem', 
          borderRadius: '20px',
          marginTop: '10px',
          border: `1px solid ${colors.border}`
        }}>
          📌 Kapsül Kodu: #{wallId}
        </span>
      </div>

      <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem', boxSizing: 'border-box' }}>
        
        {/* Kontrol ve Arama Çubuğu */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: '1rem', 
          marginBottom: '3rem', 
          padding: '1.25rem 1.75rem', 
          backgroundColor: '#ffffff', 
          borderRadius: '20px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
          border: `1px solid ${colors.border}` 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontFamily: '"Segoe UI", sans-serif', fontSize: '15px', color: '#7C5858', fontWeight: '600' }}>
              Duvarda <span style={{ color: colors.accent, fontSize: '18px', fontWeight: 'bold' }}>{memories.length}</span> Anı Bulunuyor
            </span>
            <button onClick={() => { setEditingMemoryId(null); setIsModalOpen(true); }} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', backgroundColor: colors.accent, color: '#ffffff', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s', boxShadow: `0 4px 12px ${colors.border}` }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              ✨ Anı Bırak
            </button>
          </div>
          <input type="text" placeholder="Anılarda ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: `1px solid ${colors.border}`, backgroundColor: colors.pageBg, width: '280px', outline: 'none', fontFamily: 'sans-serif', fontSize: '14px' }} />
        </div>

        {/* Anı Kartları Grid Yapısı */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {memories
            .filter(m => m.authorName.toLowerCase().includes(searchTerm.toLowerCase()) || m.content.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((memory) => {
              const imageSource = memory.imageUrl || memory.ImageUrl;

              return (
                <div key={memory.id} style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.04)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.02)'; }}>
                  
                  {/* Düzenle ve Sil Butonları */}
                  <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 10, backgroundColor: 'rgba(255,255,255,0.85)', padding: '6px 10px', borderRadius: '20px', backdropFilter: 'blur(6px)', border: `1px solid ${colors.border}` }}>
                    <button onClick={() => startEdit(memory)} title="Düzenle" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', padding: 0 }}>✏️</button>
                    <button onClick={() => handleDelete(memory.id)} title="Sil" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', padding: 0 }}>🗑️</button>
                  </div>

                  {/* Görsel Alanı */}
                  {imageSource && (
                    <div style={{ width: '100%', maxHeight: '240px', borderRadius: '16px', overflow: 'hidden', marginTop: '0.5rem', border: `1px solid ${colors.pageBg}` }}>
                      <img src={imageSource} alt="Anı Görseli" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  <p style={{ margin: 0, color: colors.text, fontStyle: 'italic', lineHeight: '1.7', fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                    "{memory.content}"
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px dashed ${colors.border}`, paddingTop: '1rem', marginTop: 'auto' }}>
                    <span style={{ backgroundColor: colors.badge, padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: '700', fontSize: '12px', color: colors.author, fontFamily: 'sans-serif' }}>✍️ {memory.authorName}</span>
                    <span style={{ fontSize: '11px', color: '#BFA7A7', fontFamily: 'sans-serif' }}>{new Date(memory.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Anı Ekleme / Düzenleme Modalı */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '500px', borderRadius: '28px', padding: '2.5rem', position: 'relative', border: `1px solid ${colors.border}`, boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}>
            <button onClick={() => { setIsModalOpen(false); setSelectedImage(null); setEditingMemoryId(null); setAuthorName(''); setContent(''); }} style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '18px', color: '#94A3B8' }}>✕</button>
            
            <h3 style={{ margin: '0 0 1.75rem 0', fontStyle: 'italic', color: colors.text, fontSize: '24px', fontWeight: '700' }}>
              {editingMemoryId ? '📝 Anıyı Düzenle' : '✨ Duvara Bir Anı İliştir'}
            </h3>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <input type="text" placeholder="Adınız / Rumuzunuz" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required style={{ width: '100%', padding: '0.95rem 1.25rem', borderRadius: '14px', border: `1px solid ${colors.border}`, backgroundColor: colors.pageBg, outline: 'none', fontSize: '15px', fontFamily: 'sans-serif', boxSizing: 'border-box' }} />
              <textarea rows={4} placeholder="Anınızı buraya dökün..." value={content} onChange={(e) => setContent(e.target.value)} required style={{ width: '100%', padding: '0.95rem 1.25rem', borderRadius: '14px', border: `1px solid ${colors.border}`, backgroundColor: colors.pageBg, outline: 'none', fontSize: '15px', fontFamily: 'sans-serif', resize: 'none', boxSizing: 'border-box', lineHeight: '1.5' }} />
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
              
              {!selectedImage ? (
                <div onClick={() => fileInputRef.current?.click()} style={{ padding: '1.5rem', border: `2px dashed ${colors.border}`, borderRadius: '14px', textAlign: 'center', cursor: 'pointer', backgroundColor: colors.pageBg, fontStyle: 'italic', fontSize: '14px', color: colors.heroSubtext }}>📸 Fotoğraf Ekle / Değiştir</div>
              ) : (
                <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '14px', overflow: 'hidden' }}>
                  <img src={selectedImage} alt="Önizleme" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✕</button>
                </div>
              )}
              
              <button type="submit" style={{ width: '100%', padding: '1.1rem', backgroundColor: colors.accent, color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: `0 4px 12px ${colors.border}` }}>
                {editingMemoryId ? '💾 Değişiklikleri Kaydet' : '🚀 Anıyı Duvara As'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}