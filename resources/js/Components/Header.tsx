import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import { router } from '@inertiajs/react';

interface HeaderProps {
    onNavigate: (view: string) => void;
    isDark: boolean;
    toggleTheme: () => void;
    language: 'en' | 'id';
    toggleLanguage: () => void;
    user?: {
        name: string;
        avatar?: string;
        role?: string;
        role_id?: number;
    };
}

const Header: React.FC<HeaderProps> = ({ onNavigate, isDark, toggleTheme, language, toggleLanguage, user }) => {
  const [openDropdown, setOpenDropdown] = useState<'settings' | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role_id === 1;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        if (openDropdown === 'settings') setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const toggleDropdown = () => {
      setOpenDropdown(openDropdown === 'settings' ? null : 'settings');
  };

  const getRoleLabel = () => {
      if (user?.role) return user.role;
      if (user?.role_id === 1) return 'Administrator';
      if (user?.role_id === 2) return 'Lecturer';
      if (user?.role_id === 3) return 'Student';
      return 'User';
  };

  const switchLanguage = () => {
      const newLang = language === 'en' ? 'id' : 'en';
      router.get(route('language.switch', newLang));
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-end border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md px-4 sm:px-8 transition-colors duration-200">
      <div className="flex items-center gap-3 sm:gap-4">

        <div className="relative" ref={settingsRef}>
            <button
            onClick={toggleDropdown}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${openDropdown === 'settings' ? 'bg-gray-100 dark:bg-gray-800 text-primary' : 'text-gray-600 dark:text-gray-300'}`}
            >
            <Icon name="settings" />
            </button>

            {openDropdown === 'settings' && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#19222c] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden animate-fade-in z-50 p-2">
                <div className="space-y-1">
                    <button onClick={toggleTheme} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                            <Icon name={isDark ? "dark_mode" : "light_mode"} />
                            <span>Appearance</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded capitalize">{isDark ? "Dark" : "Light"}</span>
                    </button>

                    <button
                        onClick={switchLanguage}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                            <div className="flex items-center gap-3">
                            <Icon name="language" />
                            <span>Language</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded uppercase">{language}</span>
                    </button>

                </div>
            </div>
        )}
        </div>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

        <button
            onClick={(e) => {
                if (isAdmin) {
                    e.preventDefault();
                    return;
                }
                onNavigate('profile');
            }}
            disabled={isAdmin}
            className={`flex items-center gap-3 p-1 pr-2 rounded-full transition-all group border border-transparent
                ${isAdmin
                    ? 'cursor-default opacity-100'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer'
                }
            `}
        >
            <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold border border-primary/20 overflow-hidden relative shrink-0">
                {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                    <span>{user?.name?.charAt(0) || 'U'}</span>
                )}
            </div>

            <div className="text-left hidden sm:block min-w-[80px]">
                <p className={`text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors line-clamp-1 ${!isAdmin && 'group-hover:text-primary'}`}>
                    {user?.name || 'Guest'}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                    {getRoleLabel()}
                </p>
            </div>
        </button>

      </div>
    </header>
  );
};

export default Header;
