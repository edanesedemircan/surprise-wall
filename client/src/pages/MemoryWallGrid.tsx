import React, { useState, useRef } from 'react';

// --- Arayüz Tanımlamaları ---
interface DisplayMemory {
  id: number;
  authorName: string;
  content: string;
  imageUrl?: string; // 📸 Fotoğraf linki
  createdAt: string;
}

interface MemoryWallGridProps {
  wallTitle?: string;
  wallId?: number;
  themeName?: 'birthday' | 'romantic' | 'graduation' | 'job' | 'funny';
}

// 🎨 Temalara Göre Özel Renk Kombinasyonları
const cardThemeStyles = {
  birthday: { bg: '#ffffff', border: '#E9D5FF', text: '#3B0764', author: '#7C5858', badge: '#F3E8FF', accent: '#6b21a8' },
  romantic: { bg: '#ffffff', border: '#FFE4E6', text: '#4C0519', author: '#9f1238', badge: '#FFF1F2', accent: '#9f1238' },
  graduation: { bg: '#ffffff', border: '#E2E8F0', text: '#0F172A', author: '#475569', badge: '#F1F5F9', accent: '#0f172a' },
  job: { bg: '#ffffff', border: '#FDE68A', text: '#451A03', author: '#92400e', badge: '#FEF3C7', accent: '#92400e' },
  funny: { bg: '#ffffff', border: '#FBCFE8', text: '#4D072B', author: '#db2777', badge: '#FCE7F3', accent: '#db2777' }
};

export function MemoryWallGrid({
  wallTitle = "Mezuniyet Hatıra Duvarı",
  wallId = 11,
  themeName = "graduation"
}: MemoryWallGridProps) {
  
  const colors = cardThemeStyles[themeName] || cardThemeStyles.graduation;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State Yönetimi ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Form modal kontrolü
  
  // Form input stateleri
  const [formData, setFormData] = useState({ authorName: '', content: '' });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Başlangıç anıları 
  const [memories, setMemories] = useState<DisplayMemory[]>([
    { 
      id: 1, 
      authorName: "Eda", 
      content: "o gün laboratuvarda devreyi çalıştıracağız diye az uğraşmamıştık, sonunda o LED yanınca dünyalar bizim olmuştu! 🚀", 
      imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
      createdAt: "2026-07-10T12:00:00Z" 
    },
    { 
      id: 2, 
      authorName: "Selin", 
      content: "Birlikte içtiğimiz o sabah kahveleri, sınav öncesi yaptığımız o çılgın tekrarlar olmasa bu okul kesinlikle bitmezdi. İyi ki varsın! 🎉", 
      createdAt: "2026-07-09T15:30:00Z" 
    }
  ]);

  // 📸 Fotoğraf Seçildiğinde Çalışacak Mantık (Base64'e çevirip önizleme yaptırır)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✍️ Yeni Anı Kartını Listeye/Duvara Ekleme Fonksiyonu
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.authorName.trim() || !formData.content.trim()) return;

    const newMemory: DisplayMemory = {
      id: Date.now(),
      authorName: formData.authorName,
      content: formData.content,
      imageUrl: selectedImage || undefined, // Eğer fotoğraf seçildiyse karta ekle
      createdAt: new Date().toISOString()
    };

    setMemories([newMemory, ...memories]); // Yeni anıyı duvarın en başına fırlat
    
    // Formu temizle ve kapat
    setFormData({ authorName: '', content: '' });
    setSelectedImage(null);
    setIsModalOpen(false);
  };

  const filteredMemories = memories.filter(m => 
    m.authorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
      
      {/* 📊 Üst Kontrol Paneli */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
        gap: '1rem', marginBottom: '2rem', padding: '1rem 1.5rem', backgroundColor: '#ffffff',
        borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', border: `1px solid ${colors.border}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '20px' }}>📝</span>
            <span style={{ fontFamily: '"Segoe UI", sans-serif', fontSize: '15px', color: '#7C5858', fontWeight: '600' }}>
              Toplam <span style={{ color: colors.accent, fontSize: '18px' }}>{memories.length}</span> Anı
            </span>
          </div>

          {/* 🚀 TETİKLEYİCİ BUTON: Tıklayınca Modalı Açar */}
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '0.6rem 1.2rem', borderRadius: '10px', backgroundColor: colors.accent,
              color: '#ffffff', border: 'none', fontWeight: 'bold', fontFamily: '"Segoe UI", sans-serif',
              fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            ✨ Duvara Bir Anı Bırak
          </button>
        </div>

        <input 
          type="text" placeholder="Duvarda anı veya kişi ara..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.6rem 1.2rem', borderRadius: '10px', border: `1px solid ${colors.border}`,
            backgroundColor: colors.badge, outline: 'none', fontFamily: '"Segoe UI", sans-serif',
            fontSize: '13px', color: colors.text, width: '250px'
          }}
        />
      </div>

      {/* 🧱 ANILAR GRID ALANI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {filteredMemories.map((memory) => (
          <div 
            key={memory.id}
            style={{
              backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '20px',
              padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.015)', transition: 'transform 0.2s ease',
              display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {/* 📸 Eğer Kartta Fotoğraf Varsa En Üstte Gösterilir */}
            {memory.imageUrl && (
              <div style={{ width: '100%', maxHeight: '200px', borderRadius: '12px', overflow: 'hidden', marginBottom: '0.25rem' }}>
                <img src={memory.imageUrl} alt="Anı" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <p style={{ margin: 0, fontFamily: '"Georgia", serif', fontSize: '15px', fontStyle: 'italic', color: colors.text, lineHeight: '1.6', wordBreak: 'break-word' }}>
              "{memory.content}"
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem', borderTop: `1px dashed ${colors.border}` }}>
              <div style={{ backgroundColor: colors.badge, padding: '0.3rem 0.6rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ fontSize: '12px' }}>✍️</span>
                <span style={{ fontFamily: '"Segoe UI", sans-serif', fontWeight: '700', fontSize: '12px', color: colors.author }}>{memory.authorName}</span>
              </div>
              <span style={{ fontFamily: '"Segoe UI", sans-serif', fontSize: '11px', color: '#BFA7A7' }}>
                {new Date(memory.createdAt).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ==========================================
          🌟 MODAL FORM (AÇILIR ANI BIRAKMA PENCERESİ)
         ========================================== */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff', width: '100%', maxWidth: '500px', borderRadius: '24px',
            border: `1px solid ${colors.border}`, padding: '2.5rem', boxSizing: 'border-box',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)', position: 'relative'
          }}>
            {/* Kapat Butonu */}
            <button 
              onClick={() => { setIsModalOpen(false); setSelectedImage(null); }}
              style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', backgroundColor: 'transparent', fontSize: '18px', cursor: 'pointer', color: '#BFA7A7' }}
            >
              ✕
            </button>

            <h3 style={{ margin: '0 0 1.5rem 0', fontFamily: '"Georgia", serif', fontStyle: 'italic', color: colors.text, fontSize: '22px' }}>
              ✨ Duvara Bir Anı İliştir
            </h3>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <input 
                type="text" placeholder="Adınız / Rumuzunuz" required
                value={formData.authorName} onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: `1px solid ${colors.border}`, backgroundColor: colors.badge, outline: 'none', fontStyle: 'italic', fontSize: '14px', boxSizing: 'border-box' }}
              />

              <textarea 
                rows={4} placeholder="O unutulmaz günü, çılgın bir anıyı buraya dök ..." required
                value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: `1px solid ${colors.border}`, backgroundColor: colors.badge, outline: 'none', resize: 'vertical', fontStyle: 'italic', fontSize: '14px', boxSizing: 'border-box' }}
              />

              {/* 📸 FOTOĞRAF SEÇME ALANI */}
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
              
              {!selectedImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding: '1.25rem', border: `2px dashed ${colors.border}`, borderRadius: '12px', textAlign: 'center', cursor: 'pointer', color: '#7C5858', backgroundColor: colors.badge, fontSize: '13px', fontStyle: 'italic' }}
                >
                  📸 Fotoğraf Ekle
                </div>
              ) : (
                <div style={{ position: 'relative', width: '100%', height: '150px', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                  <img src={selectedImage} alt="Önizleme" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" onClick={() => setSelectedImage(null)}
                    style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    ✕
                  </button>
                </div>
              )}

              <button 
                type="submit"
                style={{ width: '100%', padding: '1.1rem', backgroundColor: colors.accent, color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.02)', marginTop: '0.5rem' }}
              >
                🚀 Anıyı Duvara As
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}