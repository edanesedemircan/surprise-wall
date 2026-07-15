import { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { CreateWall } from './pages/CreateWall';
import { WallDetail } from './pages/WallDetail';
import { Welcome } from './pages/Welcome';
import WallReveal from './pages/WallReveal'; 

function App() {
  // Giriş durumunu tarayıcıda geçici tutuyoruz ki otomatik yönlendirmeyle sabit odaya kilitlemesin
  const [userAuth, setUserAuth] = useState<{ role: string; title: string; wallId: number } | null>(null);

  const handleLoginSuccess = (role: string, title: string, wallId: number) => {
    const authData = { role, title, wallId };
    setUserAuth(authData);
    // Giriş anındaki aktif veriyi kaydediyoruz
    localStorage.setItem('user', JSON.stringify(authData));
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#FFF5F5', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        <Routes>
          {/* Karşılama Ekranı */}
          <Route path="/" element={<Welcome />} />
          
          {/* Giriş Ekranı */}
          <Route 
            path="/login" 
            element={
              <Home onLoginSuccess={handleLoginSuccess} />
            } 
          />
          
          {/* Oda Oluşturma */}
          <Route path="/create" element={<CreateWall />} />
          
          {/* Oda Detayı / Anı Duvarı */}
          <Route 
            path="/wall/:id" 
            element={
              <WallDetail 
                role={userAuth?.role || 'Guest'} 
                title={userAuth?.title || 'Yükleniyor...'} 
              />
            } 
          />

          <Route 
            path="/wall/:id/reveal" 
            element={<WallReveal />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;