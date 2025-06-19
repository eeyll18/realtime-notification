import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import NotificationArea from "./components/NotificationArea";
import AdminPanel from "./components/AdminPanel";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function AppContent() {
  const { currentUser, logout, isAuthenticated } = useAuth();

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <nav className="bg-slate-800 text-slate-100 shadow-lg w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="text-xl font-bold hover:text-slate-300 transition-colors"
              >
                Ana Sayfa
              </Link>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              {isAuthenticated ? (
                <>
                  {currentUser && currentUser.role === "admin" && (
                    <Link
                      to="/admin"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <div className="flex items-center">
                    {/* <span className="text-sm mr-2 hidden sm:inline">
                      ({currentUser?.username})
                    </span> */}
                    <button
                      onClick={logout}
                      className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-2 rounded-md text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white transition-colors"
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" /> : <Register />}
          />
          <Route
            path="/admin"
            element={
              isAuthenticated && currentUser?.role === "admin" ? (
                <AdminPanel />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <>
                  <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                      Hoş Geldiniz, {currentUser?.username}!
                    </h1>
                    <NotificationArea />
                  </div>
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
          />
        </Routes>
      </main>
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
