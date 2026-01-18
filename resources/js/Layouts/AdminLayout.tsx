import React, { useState, useMemo, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { User, NavItem } from '../types';
import Sidebar from '@/Components/Sidebar';
import Header from '@/Components/Header';
import useTranslation from '@/Hooks/useTranslation';

interface AdminLayoutProps {
    children: React.ReactNode;
    user?: User;
}

interface PageProps {
    auth: {
        user: User;
    };
    component: string;
    [key: string]: any;
}

export default function AdminLayout({ children, user }: AdminLayoutProps) {
    const { props, component } = usePage<PageProps>();
    const currentUser = user || props.auth.user;

    const { current_locale } = usePage<any>().props;

    const { t } = useTranslation();

    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                return true;
            }
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark(prev => !prev);
    };

    const navItems: NavItem[] = useMemo(() => [
        {
            id: route('admin.dashboard'),
            label: t('Dashboard'),
            icon: 'dashboard',
            active: component === 'Admin/Dashboard'
        },
        {
            id: route('admin.users.index'),
            label: t('User Management'),
            icon: 'group',
            active: component.startsWith('Admin/Users')
        },
        {
            label: t('Academics'),
            icon: 'school',
            children: [
                {
                    id: route('admin.faculties.index'),
                    label: t('Faculties'),
                    icon: 'domain',
                    active: component.startsWith('Admin/Faculties')
                },
                {
                    id: route('admin.majors.index'),
                    label: t('Majors'),
                    icon: 'school',
                    active: component.startsWith('Admin/Majors')
                },
                {
                    id: route('admin.courses.index'),
                    label: t('Courses'),
                    icon: 'menu_book',
                    active: component.startsWith('Admin/Courses')
                },
                {
                    id: route('admin.rooms.index'),
                    label: t('Rooms'),
                    icon: 'meeting_room',
                    active: component.startsWith('Admin/Rooms')
                },
                {
                    id: route('admin.classes.index'),
                    label: t('Classes'),
                    icon: 'class',
                    active: component.startsWith('Admin/Classes')
                },
                {
                    id: route('admin.semesters.index'),
                    label: t('Semesters'),
                    icon: 'calendar_month',
                    active: component.startsWith('Admin/Semesters')
                },
                {
                    id: route('admin.curriculums.index'),
                    label: t('Curriculums'),
                    icon: 'account_tree',
                    active: component.startsWith('Admin/Curriculums')
                }
            ]
        },
        {
            label: t('Finance'),
            icon: 'payments',
            children: [
                {
                    id: route('admin.cost_components.index'),
                    label: t('Cost Components'),
                    icon: 'monetization_on',
                    active: component.startsWith('Admin/Finance/CostComponents')
                }
            ]
        }
    ], [component, current_locale]);

    const handleNavigate = (destination: string) => {
        if (destination === 'logout') {
            router.post(route('logout'));
        } else if (destination === 'profile') {
            router.get(route('profile.edit'));
        } else {
            router.visit(destination);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-background-dark transition-colors duration-200 font-sans">
            <Sidebar
                navItems={navItems}
                onNavigate={handleNavigate}
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <Header
                    onNavigate={handleNavigate}
                    isDark={isDark}
                    toggleTheme={toggleTheme}
                    language={current_locale || 'en'}
                    toggleLanguage={() => {}}
                    user={{
                        name: currentUser.full_name,
                        avatar: currentUser.profile_picture || '',
                        role: (currentUser as any).role,
                        role_id: (currentUser as any).role_id
                    }}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
