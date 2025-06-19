import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      toast.success(`Hoş geldiniz, ${username}!`);
      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    }
  };
  return (
    <div className="flex flex-col items-center -mt-20 justify-center min-h-screen px-4 py-8 ">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-2xl  bg-gradient-to-br from-slate-100 to-sky-100">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-slate-700 ">
            Hesabınıza Giriş Yapın
          </h2>
          <p className="mt-2 text-sm text-slate-600 ">
            veya{" "}
            <Link
              to="/register"
              className="font-medium text-sky-600 hover:text-sky-500"
            >
              yeni bir hesap oluşturun
            </Link>
          </p>
        </div>

        {error && (
          <p className="mb-4 text-center text-red-600 font-semibold">{error}</p>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-2">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                Kullanıcı Adı
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-slate-300  placeholder-slate-500  text-slate-700  bg-white  rounded-t-md   sm:text-sm transition-colors"
                placeholder="Kullanıcı Adınız"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-slate-300  placeholder-slate-500 da text-slate-900  bg-white  rounded-b-md  sm:text-sm transition-colors"
                placeholder="Şifreniz"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full cursor-pointer flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white 
                         ${
                           isLoading
                             ? "bg-sky-400  cursor-not-allowed"
                             : "bg-sky-600 hover:bg-sky-700 "
                         } transition-colors`}
            >
              Giriş Yap
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
