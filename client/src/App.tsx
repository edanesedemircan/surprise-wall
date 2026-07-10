import { useState } from 'react';
//import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { CreateWall } from './pages/CreateWall';
import { WallDetail } from './pages/WallDetail';
import { Welcome } from './pages/Welcome';

function App() {
  const [userAuth, setUserAuth] = useState<{ role: string; title: string; wallId: number } | null>(null);

  const handleLoginSuccess = (role: string, title: string, wallId: number) => {
    setUserAuth({ role, title, wallId });
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#FFF5F5', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route 
            path="/login" 
            element={
              userAuth ? <Navigate to={`/wall/${userAuth.wallId}`} /> : <Home onLoginSuccess={handleLoginSuccess} />
            } 
          />
          <Route path="/create" element={<CreateWall />} />
          <Route 
            path="/wall/:id" 
            element={
              <WallDetail 
  role={userAuth?.role || 'Guest'} 
  title={userAuth?.title || 'Yükleniyor...'} 
  onLoginSuccess={(role, title, wallId) => {
    // Giriş başarılı olunca App.tsx state'ini güncelleyen fonksiyon
    setUserAuth({ role, title, wallId });
    localStorage.setItem('user', JSON.stringify({ role, title, wallId }));
  }}
/>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;