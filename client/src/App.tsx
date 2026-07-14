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
          {/* Giriş Sayfası / Karşılama */}
          <Route path="/" element={<Welcome />} />
          
          {/* Güvenli Geçiş Kapısı */}
          <Route 
            path="/login" 
            element={
              userAuth ? <Navigate to={`/wall/${userAuth.wallId}`} /> : <Home onLoginSuccess={handleLoginSuccess} />
            } 
          />
          
          {/* Oda Oluşturma Ekranı */}
          <Route path="/create" element={<CreateWall />} />
          
          {/* Oda Detay / Duvar Ekranı */}
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