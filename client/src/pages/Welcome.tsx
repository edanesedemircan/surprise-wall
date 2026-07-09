import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Welcome() {
  const navigate = useNavigate();
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUserExists(true);
    } else {
      window.google?.accounts.id.initialize({
        client_id: "200628903576-matrf8d1fosen9d64ralgu3fetpltcmh.apps.googleusercontent.com", 
        callback: handleGoogleResponse,
        use_fedcm_for_prompt: false
      });


      window.google?.accounts.id.renderButton(
        document.getElementById("google-signin-inside-card"),
        { 
          theme: "outline", 
          size: "large", 
          text: "signin_with", 
          shape: "rectangular",
          width: 294 
        }
      );
    }
  }, [userExists]);

  const handleGoogleResponse = (response: any) => {
    console.log("Google Girişi Başarılı! Token:", response.credential);
    localStorage.setItem('user', JSON.stringify({ email: "eda@gmail.com", name: "Eda Neşe" }));
    setUserExists(true);
    navigate('/create');
  };

  const handleCapsuleClick = () => {
    if (userExists) {
      navigate('/create');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#FFF5F5', 
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      margin: 0,
      padding: 0,
      width: '100vw', 
      boxSizing: 'border-box'
    }}>
      
      <style>{`
        body, html, #root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow-x: hidden;
        }
      `}</style>

      {/* SOL PANEL */}
      <div style={{ 
        flex: '1.6', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#FFF5F5', 
        paddingBottom: '5rem',
        boxSizing: 'border-box'
      }}>
        
        <div style={{ 
          backgroundColor: '#FFE4E6', 
          backgroundImage: `
            linear-gradient(90deg, rgba(244, 63, 94, 0.03) 50%, transparent 50%),
            linear-gradient(rgba(244, 63, 94, 0.03) 50%, transparent 50%)
          `,
          backgroundSize: '80px 80px',
          padding: '6.25rem 4rem 6.25rem 4rem',
          textAlign: 'center',
          borderBottom: '1px solid #FCA5A5',
          boxSizing: 'border-box'
        }}>
          
          <h1 style={{ 
            fontSize: '56px', 
            fontStyle: 'italic', 
            fontWeight: '700', 
            margin: '0 0 1.25rem 0', 
            lineHeight: '1.1', 
            letterSpacing: '-1px', 
            fontFamily: '"Georgia", "Baskerville", "Times New Roman", serif',
            color: '#a02b6a',
            textShadow: '1px 1px 2px rgba(160, 43, 106, 0.1)'
          }}>
            Sürpriz Duvarı
          </h1>
          
          <p style={{ 
            color: '#7C5858', 
            fontSize: '20px', 
            maxWidth: '820px', 
            lineHeight: '1.8', 
            margin: '0 auto', 
            fontWeight: '500',
            fontFamily: '"Georgia", "Baskerville", "Times New Roman", serif',
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
           Sıradan kutlama mesajlarını ve kaybolup giden story'leri geride bırakın. Burası, sevdiklerinizin en özel 
           anlarını ölümsüzleştirebileceğiniz size özel dijital bir zaman kapsülü! 
           Kutlamak istediğiniz dönüm noktası her neyse;
            <strong style={{ color: '#a02b6a', fontStyle: 'normal' }}>ister coşkulu bir doğum günü, ister romantik bir yıldönümü, ister gurur dolu bir mezuniyet, ister yeni bir iş başarısı ya da sadece sebepsizce kutlamak istediğiniz şeyler...</strong>,
          ister coşkulu bir doğum günü, ister romantik bir yıldönümü, ister gurur dolu bir mezuniyet, ister yeni bir iş başarısı ya da sadece sebepsizce kutlamak istediğiniz şeyler...
          </p>
        </div>

        {/* TEMA BANNERLARI ALANI */}
        <div style={{ 
          padding: '5rem 3rem 0 3rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          <h3 style={{ color: '#a02b6a', fontSize: '24px', fontWeight: '800', margin: '0 0 3.5rem 0', letterSpacing: '0.5px', fontFamily: '"Georgia", Times, serif', textAlign: 'center' }}>
            ✨ Konseptlerimiz ve Temalarımız ✨
          </h3>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '3rem', 
            maxWidth: '800px', 
            width: '100%',
            boxSizing: 'border-box'
          }}>
            
            {/* 1. DOĞUM GÜNÜ */}
            <div style={{ 
              height: '400px',
              backgroundImage: 'linear-gradient(to bottom, rgba(107, 33, 168, 0.85), rgba(107, 33, 168, 0.85)), url("https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80")',
              backgroundSize: 'cover', backgroundPosition: 'center',
              borderRadius: '24px', padding: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 15px 35px rgba(107, 33, 168, 0.15)',
              boxSizing: 'border-box',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#F3E8FF', margin: '0 0 1rem 0', fontSize: '28px', fontWeight: '800' }}>🎉 Doğum Günü Kutlaması</h4>
              <p style={{ color: '#E9D5FF', fontSize: '15px', maxWidth: '550px', margin: 0, lineHeight: '1.7' }}>
                Konfetiler, neon ışıklar ve parti havasıyla coşkulu kutlama odaları. Arkadaşlarınızın yeni yaşını dijital bir şölene dönüştürün.
              </p>
            </div>

            {/* 2. ROMANTİK ANILAR */}
            <div style={{ 
              height: '400px',
              backgroundImage: 'linear-gradient(to bottom, rgba(159, 18, 57, 0.85), rgba(159, 18, 57, 0.85)), url("https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80")',
              backgroundSize: 'cover', backgroundPosition: 'center',
              borderRadius: '24px', padding: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 15px 35px rgba(159, 18, 57, 0.15)',
              boxSizing: 'border-box',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#FFF1F2', margin: '0 0 1rem 0', fontSize: '28px', fontWeight: '800' }}> ❤️ Romantik Anılar</h4>
              <p style={{ color: '#FFE4E6', fontSize: '15px', maxWidth: '550px', margin: 0, lineHeight: '1.7' }}>
                Gül yaprakları, soft kırmızı tonlarıyla aşk dolu dijital duvarlar. Yıldönümleri ve en özel anlar için birebir.
              </p>
            </div>

            {/* 3. MEZUNİYET */}
            <div style={{ 
              height: '400px',
              backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80")',
              backgroundSize: 'cover', backgroundPosition: 'center',
              borderRadius: '24px', padding: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 15px 35px rgba(15, 23, 42, 0.15)',
              boxSizing: 'border-box',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#F8FAFC', margin: '0 0 1rem 0', fontSize: '28px', fontWeight: '800' }}>🎓 Kep Fırlatma Sevinci</h4>
              <p style={{ color: '#E2E8F0', fontSize: '15px', maxWidth: '550px', margin: 0, lineHeight: '1.7' }}>
                Gece mavisi ve altın parıltılarıyla okul hatıralarına özel konsept. Zorlu yılların ve kazanılan dostlukların taçlandığı ekran.
              </p>
            </div>

            {/* 4. YENİ İŞ / TEBRİK */}
            <div style={{ 
              height: '400px',
              backgroundImage: 'linear-gradient(to bottom, rgba(146, 64, 14, 0.85), rgba(146, 64, 14, 0.85)), url("https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80")',
              backgroundSize: 'cover', backgroundPosition: 'center',
              borderRadius: '24px', padding: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 15px 35px rgba(146, 64, 14, 0.15)',
              boxSizing: 'border-box',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#FEF3C7', margin: '0 0 1rem 0', fontSize: '28px', fontWeight: '800' }}>💼 Yeni Başlangıçlar</h4>
              <p style={{ color: '#FDE68A', fontSize: '15px', maxWidth: '550px', margin: 0, lineHeight: '1.7' }}>
                Soft gold ve şampanya tonlarıyla kariyer adımlarını kutlama ekranı. Yeni iş, terfi veya başarılı bir girişimi tebrik etmek için ideal.
              </p>
            </div>

            {/* 5. SEBEPSİZCE KUTLAMAK İSTEDİKLERİMİZ */}
            <div style={{ 
              height: '400px',
              backgroundImage: 'linear-gradient(to bottom, rgba(219, 39, 119, 0.85), rgba(219, 39, 119, 0.85)), url("https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80")',
              backgroundSize: 'cover', backgroundPosition: 'center',
              borderRadius: '24px', padding: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 15px 35px rgba(219, 39, 119, 0.15)',
              boxSizing: 'border-box',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#FCE7F3', margin: '0 0 1rem 0', fontSize: '28px', fontWeight: '800' }}>🎉 Sebepsizce Sadece Kutlamak İstediklerimiz</h4>
              <p style={{ color: '#FBCFE8', fontSize: '15px', maxWidth: '550px', margin: 0, lineHeight: '1.7' }}>
                Arkadaşınız bugün ilk defa paralel park mı yaptı? Hayatın ciddiyetini kırın; canınız o an neyi istiyorsa, hiçbir sebebe ihtiyaç duymadan çılgınca onu kutlayın!
                
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* SAĞ PANEL */}
      <div style={{ 
        width: '350px', 
        position: 'sticky',
        top: 0,
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'flex-start', 
        alignItems: 'center',
        gap: '1.5rem', 
        padding: '3rem 1.75rem',
        backgroundColor: '#FFE4E6', 
        borderLeft: '1px solid #FCA5A5',
        boxSizing: 'border-box',
        borderRadius: '0px 0 0 35px' 
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          
          {/* KUTLAMA ODASI OLUŞTUR KARTI */}
          <div 
            onClick={handleCapsuleClick}
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '14px', 
              padding: '1.25rem 1rem', 
              boxShadow: '0 6px 15px rgba(159, 18, 57, 0.04)', 
              border: '1px solid #FECDD3',
              cursor: userExists ? 'pointer' : 'default', 
              transition: 'all 0.2s ease', 
              position: 'relative', 
              zIndex: 2,
              textAlign: 'center'
            }}
            onMouseEnter={(e) => { if(userExists) e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={(e) => { if(userExists) e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <div style={{ fontSize: '20px', marginBottom: '0.4rem' }}>✨</div>
            <h4 style={{ color: '#9F1239', fontSize: '14px', margin: '0 0 0.4rem 0', fontWeight: '800' }}>Kutlama Odası Oluştur</h4>
            <p style={{ color: '#881337', fontSize: '11px', lineHeight: '1.4', margin: '0 0 1rem 0' }}>
              Hemen bir zaman kapsülü oluştur ve sihirli linki kap. Temanı seç arkadaşlarını davet et.
            </p>

            {!userExists && (
              <div 
                onClick={(e) => e.stopPropagation()} 
                id="google-signin-inside-card" 
                style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '0.5rem' }}
              ></div>
            )}
          </div>

          {/* ODAYA DAHİL OL KARTI */}
          <div 
            onClick={() => navigate('/login')}
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '14px', 
              padding: '1.25rem 1rem', 
              boxShadow: '0 6px 15px rgba(159, 18, 57, 0.04)', 
              border: '1px solid #FECDD3',
              cursor: 'pointer', 
              transition: 'all 0.2s ease', 
              position: 'relative', 
              zIndex: 2,
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: '20px', marginBottom: '0.4rem' }}>🔑</div>
            <h4 style={{ color: '#9F1239', fontSize: '14px', margin: '0 0 0.4rem 0', fontWeight: '800' }}>Kapsüle Dahil Ol</h4>
            <p style={{ color: '#881337', fontSize: '12px', lineHeight: '1.4', margin: 0 }}>
              Sana atılan şifreyle kapsülü aç ve anı bırakmaya başla.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}