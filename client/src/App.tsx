import { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { CreateWall } from './pages/CreateWall';
import { WallDetail } from './pages/WallDetail';
import { Welcome } from './pages/Welcome';

function App() {
  const [userAuth, setUserAuth] = useState<{ role: string; title: string; wallId: number } | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLoginSuccess = (role: string, title: string, wallId: number) => {
    const authData = { role, title, wallId };
    setUserAuth(authData);
    localStorage.setItem('user', JSON.stringify(authData));
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#FFF5F5', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        <Routes>
          {/* İlk Giriş Karşılama Ekranı */}
          <Route path="/" element={<Welcome />} />
          
          {/* Güvenli Geçiş Kapısı (Giriş yaptıysa doğrudan odasına fırlatır) */}
          <Route 
            path="/login" 
            element={
              userAuth ? <Navigate to={`/wall/${userAuth.wallId}`} replace /> : <Home onLoginSuccess={handleLoginSuccess} />
            } 
          />
          
          {/* Oda Oluşturma */}
          <Route path="/create" element={<CreateWall />} />
          
          {/* Oda Detayı: "Guest" veya diğer rollere göre kendi içinden kararı verir */}
          <Route 
            path="/wall/:id" 
            element={
              <WallDetail 
                role={userAuth?.role || 'Guest'} 
                title={userAuth?.title || 'Yükleniyor...'} 
                onLoginSuccess={handleLoginSuccess}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;