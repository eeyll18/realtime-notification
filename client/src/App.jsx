import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import NotificationArea from './components/NotificationArea';
import AdminPanel from './components/AdminPanel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'; 

function AppContent() {
  const { currentUser, logout, isAuthenticated } = useAuth();

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <nav>
        <Link to="/">Ana Sayfa</Link>
        {isAuthenticated ? (
          <>
            {currentUser && currentUser.role === 'admin' && <Link to="/admin" style={{ marginLeft: '10px' }}>Admin Panel</Link>}
            <button onClick={logout} style={{ marginLeft: '10px' }}>Çıkış Yap ({currentUser?.username})</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginLeft: '10px' }}>Giriş Yap</Link>
            <Link to="/register" style={{ marginLeft: '10px' }}>Kayıt Ol</Link>
          </>
        )}
      </nav>
      <div className="container">
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
          <Route path="/admin" element={
            isAuthenticated && currentUser?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />
          } />
          <Route path="/" element={
            isAuthenticated ? (
              <>
                <h1>Hoş Geldiniz, {currentUser?.username}!</h1>
                <NotificationArea />
              </>
            ) : <Navigate to="/login" />
          } />
           <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;