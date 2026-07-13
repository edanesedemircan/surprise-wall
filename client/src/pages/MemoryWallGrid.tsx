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

const cardThemeStyles = {
  birthday: { bg: '#ffffff', border: '#E9D5FF', text: '#3B0764', author: '#7C5858', badge: '#F3E8FF', accent: '#6b21a8' },
  romantic: { bg: '#ffffff', border: '#FFE4E6', text: '#4C0519', author: '#9f1238', badge: '#FFF1F2', accent: '#9f1238' },
  graduation: { bg: '#ffffff', border: '#E2E8F0', text: '#0F172A', author: '#475569', badge: '#F1F5F9', accent: '#0f172a' },
  job: { bg: '#ffffff', border: '#FDE68A', text: '#451A03', author: '#92400e', badge: '#FEF3C7', accent: '#92400e' },
  funny: { bg: '#ffffff', border: '#FBCFE8', text: '#4D072B', author: '#db2777', badge: '#FCE7F3', accent: '#db2777' }
};

export function MemoryWallGrid({ wallId, wallTitle, themeName, apiUrl }: MemoryWallGridProps) {
  const colors = cardThemeStyles[themeName] || cardThemeStyles.graduation;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    try {
      const response = await fetch(`${apiUrl}/api/memory/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          wallId, 
          authorName, 
          content, 
          imageUrl: selectedImage || null 
        })
      });

      if (response.ok) {
        setAuthorName('');
        setContent('');
        setSelectedImage(null);
        setIsModalOpen(false);
        fetchMemories();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', boxSizing: 'border-box', padding: '3rem 1.5rem', fontFamily: '"Georgia", serif' }}>
      <style>{`body, html, #root { margin:0; padding:0; width:100%; height:100%; overflow-x:hidden; }`}</style>
      
      <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Üst Bilgi Kartı */}
        <div style={{ textAlign: 'center', backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.01)', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '36px', fontStyle: 'italic', fontWeight: '700', color: colors.accent, margin: 0 }}>🎉 {wallTitle}</h1>
          <p style={{ color: '#7C5858', fontFamily: '"Segoe UI", sans-serif', fontWeight: 'bold', marginTop: '10px', fontSize: '14px' }}>Oda ID: #{wallId} | ✍️ Davetli Anı Akışı</p>
        </div>

        {/* Aksiyon Barı */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '1rem 1.5rem', backgroundColor: '#ffffff', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontFamily: '"Segoe UI", sans-serif', fontSize: '15px', color: '#7C5858', fontWeight: '600' }}>
              Duvarda <span style={{ color: colors.accent, fontSize: '18px' }}>{memories.length}</span> Anı Var
            </span>
            <button onClick={() => setIsModalOpen(true)} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', backgroundColor: colors.accent, color: '#ffffff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
              ✨ Duvara Bir Anı Bırak
            </button>
          </div>
          <input type="text" placeholder="Duvarda ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: `1px solid ${colors.border}`, backgroundColor: colors.badge, width: '250px', outline: 'none' }} />
        </div>

        {/* Anı Grid Yapısı */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {memories
            .filter(m => m.authorName.toLowerCase().includes(searchTerm.toLowerCase()) || m.content.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((memory) => {
              const imageSource = memory.imageUrl || memory.ImageUrl;

              return (
                <div key={memory.id} style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  

                  {imageSource && (
                    <div style={{ width: '100%', maxHeight: '200px', borderRadius: '12px', overflow: 'hidden' }}>
                      <img src={imageSource} alt="Anı" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  <p style={{ margin: 0, color: colors.text, fontStyle: 'italic', lineHeight: '1.6', fontSize: '15px' }}>"{memory.content}"</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px dashed ${colors.border}`, paddingTop: '0.75rem', marginTop: 'auto' }}>
                    <span style={{ backgroundColor: colors.badge, padding: '0.3rem 0.6rem', borderRadius: '8px', fontWeight: '700', fontSize: '12px', color: colors.author }}>✍️ {memory.authorName}</span>
                    <span style={{ fontSize: '11px', color: '#BFA7A7' }}>{new Date(memory.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Anı Ekleme Modalı */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '2.5rem', position: 'relative', border: `1px solid ${colors.border}` }}>
            <button onClick={() => { setIsModalOpen(false); setSelectedImage(null); }} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            <h3 style={{ margin: '0 0 1.5rem 0', fontStyle: 'italic', color: colors.text, fontSize: '22px' }}>✨ Duvara Bir Anı İliştir</h3>
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <input type="text" placeholder="Adınız / Rumuzunuz" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: `1px solid ${colors.border}`, backgroundColor: colors.badge, outline: 'none' }} />
              <textarea rows={4} placeholder="Anınızı dökün..." value={content} onChange={(e) => setContent(e.target.value)} required style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: `1px solid ${colors.border}`, backgroundColor: colors.badge, outline: 'none' }} />
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
              
              {!selectedImage ? (
                <div onClick={() => fileInputRef.current?.click()} style={{ padding: '1.25rem', border: `2px dashed ${colors.border}`, borderRadius: '12px', textAlign: 'center', cursor: 'pointer', backgroundColor: colors.badge, fontStyle: 'italic', fontSize: '13px' }}>📸 Fotoğraf Ekle</div>
              ) : (
                <div style={{ position: 'relative', width: '100%', height: '150px', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={selectedImage} alt="Önizleme" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>✕</button>
                </div>
              )}
              
              <button type="submit" style={{ width: '100%', padding: '1.1rem', backgroundColor: colors.accent, color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' }}>🚀 Anıyı Duvara As</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}