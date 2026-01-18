import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '../Components/ReusableUI';
import Icon from '../Components/Icon';

const Welcome: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' ||
       (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        setIsDark(false);
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        setIsDark(true);
    }
  };

  const handleLoginClick = () => {
      router.visit(route('login'));
  };

  return (
    <>
    <Head title="Welcome - Universitas Shane" />

    <div className="min-h-screen bg-white dark:bg-background-dark text-gray-900 dark:text-white flex flex-col font-sans transition-colors duration-200">

      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-background-dark/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-[#0A2647] flex items-center justify-center text-white shadow-md">
             <Icon name="school" className="text-2xl" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight leading-none text-[#0A2647] dark:text-white">Universitas Shane</span>
            <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">Official Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Toggle Theme"
            >
              <Icon name={isDark ? "light_mode" : "dark_mode"} />
            </button>
            <Button onClick={handleLoginClick} icon="login">Login Portal</Button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden bg-gray-50 dark:bg-[#0d151c]">

        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent dark:from-[#0A2647]/20 dark:to-transparent -z-10"></div>

        <div className="max-w-4xl mx-auto animate-fade-in-up z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 shadow-sm text-sm font-medium text-gray-600 dark:text-gray-300 mb-8">
                <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                System Operational
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-[#0A2647] dark:text-white">
                Sistem Informasi Akademik <br/>
                <span className="text-primary">Universitas Shane</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Selamat datang di portal layanan akademik terpadu. Silakan login untuk mengakses KRS, KHS, Jadwal Kuliah, dan layanan administrasi lainnya.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button onClick={handleLoginClick} className="px-10 py-4 text-lg h-auto shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform">
                    Masuk ke Portal
                    <Icon name="login" />
                </Button>
                <a href="#" className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium hover:text-primary transition-colors flex items-center gap-2">
                    <Icon name="help_center" />
                    Bantuan Login
                </a>
            </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-[#151d25] border-t border-gray-200 dark:border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Universitas Shane</p>
                <p className="text-xs text-gray-500 mt-1">Jl. Pendidikan No. 1, Jakarta Selatan</p>
            </div>

            <div className="flex items-center gap-6">
                 <a href="#" className="text-xs text-gray-500 hover:text-primary">Privacy Policy</a>
                 <a href="#" className="text-xs text-gray-500 hover:text-primary">Terms of Use</a>
                 <a href="#" className="text-xs text-gray-500 hover:text-primary">Help Desk</a>
            </div>

            <div className="text-xs text-gray-400 flex items-center gap-1">
                <span>Powered by</span>
                <strong className="text-primary/80">StudyFlow</strong>
            </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Welcome;
