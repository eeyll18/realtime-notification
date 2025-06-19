import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(username, password, role);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };
  return (
    <div className="flex flex-col items-center -mt-16 justify-center min-h-screen px-4 py-8 ">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-2xl bg-gradient-to-br from-slate-100 to-green-100">
        <div className="text-center ">
          <h2 className="mt-2 text-3xl font-extrabold text-slate-700 ">
            Yeni Hesap Oluşturun
          </h2>
          <p className="mt-2 text-sm text-slate-600 ">
            Zaten bir hesabınız var mı?{" "}
            <Link
              to="/login"
              className="font-medium text-green-600 hover:text-green-500 "
            >
              Giriş yapın
            </Link>
          </p>
        </div>

        {/* Lokal error mesajı için */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-2">
            <div>
              <label
                htmlFor="username-register"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Kullanıcı Adı
              </label>
              <input
                id="username-register"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className=" relative block w-full px-3 py-3 pl-5 border border-slate-300  placeholder-slate-500  text-slate-700  bg-white  rounded-t-md sm:text-sm transition-colors"
                placeholder="Kullanıcı Adınız"
              />
            </div>
            <div>
              <label
                htmlFor="password-register"
                className="block text-sm font-medium text-slate-700 -mt-2 mb-1"
              >
                Şifre
              </label>
              <input
                id="password-register"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className=" relative block w-full px-3 py-3 pl-5 border border-slate-300  placeholder-slate-500  text-slate-900  bg-white rounded-b-md sm:text-sm transition-colors"
                placeholder="Şifreniz"
              />
            </div>
          </div>

          <div className="-mt-6">
            <label
              htmlFor="role-register"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Rol
            </label>
            <select
              id="role-register"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="appearance-none block w-full px-3 py-3 pl-5 border border-slate-300  placeholder-slate-500  text-slate-900  bg-white  rounded-md focus:outline-none sm:text-sm transition-colors cursor-pointer"
            >
              <option value="user">Kullanıcı</option>
              <option value="admin">Admin (Test Amaçlı)</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative w-full cursor-pointer flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white 
                         ${
                           isLoading
                             ? "bg-green-400 dark:bg-green-700 cursor-not-allowed"
                             : "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800"
                         } transition-colors`}
            >
              Hesap Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
