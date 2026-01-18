import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { NavItem } from '../types';

interface SidebarProps {
  navItems: NavItem[];
  onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, onNavigate }) => {

  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);


  useEffect(() => {
    navItems.forEach(group => {
      if (group.children) {
        const hasActiveChild = group.children.some(child => child.active);
        if (hasActiveChild) {
           setExpandedGroups(prev => {
               if (!prev.includes(group.label)) {
                   return [...prev, group.label];
               }
               return prev;
           });
        }
      }
    });
  }, [navItems]);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  return (
    <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-[#19222c] border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 transition-colors duration-200 overflow-y-auto no-scrollbar">
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex flex-col gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-10 shadow-sm flex-shrink-0 bg-primary flex items-center justify-center text-white"
            >
                <Icon name="school" className="text-2xl" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-gray-900 dark:text-white text-base font-bold leading-normal truncate">StudyFlow</h1>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 mt-4">
            {navItems.map((item, index) => {
              if (item.children) {

                const isExpanded = expandedGroups.includes(item.label);
                const hasActiveChild = item.children.some(child => child.active);

                return (
                  <div key={index} className="flex flex-col gap-1 mb-1">
                    <button
                      onClick={() => toggleGroup(item.label)}
                      className={`flex w-full items-center justify-between px-3 py-2 rounded-lg transition-colors duration-150 group ${
                        hasActiveChild || isExpanded
                            ? 'text-gray-900 dark:text-white bg-gray-50 dark:bg-white/5'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                         <Icon
                            name={item.icon}
                            className={`${hasActiveChild || isExpanded ? "text-primary" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}`}
                         />
                         <p className="text-sm font-medium leading-normal">{item.label}</p>
                      </div>
                      <Icon
                        name="expand_more"
                        className={`text-gray-400 transition-transform duration-200 text-lg ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Children */}
                    <div
                        className={`flex flex-col gap-1 ml-4 border-l border-gray-200 dark:border-gray-700 pl-2 overflow-hidden transition-all duration-300 ease-in-out ${
                            isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
                        }`}
                    >
                       {item.children.map(child => (
                           <button
                             key={child.id}
                             onClick={() => child.id && onNavigate(child.id)}
                             className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 ${
                               child.active
                                 ? 'bg-primary/10 text-primary font-semibold'
                                 : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                             }`}
                           >
                             <Icon
                               name={child.icon}
                               className={`text-[20px] ${child.active ? "filled" : ""}`}
                             />
                             <p className="text-sm leading-normal">{child.label}</p>
                           </button>
                       ))}
                    </div>
                  </div>
                );
              } else {

                return (
                  <button
                    key={item.id}
                    onClick={() => item.id && onNavigate(item.id)}
                    className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 group mb-1 ${
                      item.active
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon
                      name={item.icon}
                      filled={item.active}
                      className={item.active ? "" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}
                    />
                    <p className={`text-sm font-medium leading-normal ${item.active ? 'font-semibold' : ''}`}>
                      {item.label}
                    </p>
                  </button>
                );
              }
            })}
          </nav>
        </div>

        {/* Footer Links */}
        <div className="flex flex-col gap-1 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => onNavigate('logout')}
            className="flex w-full items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
          >
             <Icon name="logout" className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
             <p className="text-sm font-medium leading-normal group-hover:text-gray-900 dark:group-hover:text-white">Logout</p>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
