import React from 'react';
import { Home, History, DollarSign, User } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  activeView: ViewState;
  onChange: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, onChange }) => {
  const navItems = [
    { id: ViewState.HOME, icon: Home, label: 'Home' },
    { id: ViewState.HISTORY, icon: History, label: 'History' },
    { id: ViewState.PAYSTUB, icon: DollarSign, label: 'Pay' },
    { id: ViewState.PROFILE, icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 h-16 bg-white/90 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-around px-2 z-50 border border-white/50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
              isActive 
                ? 'bg-wii-blue text-white shadow-lg -translate-y-4 scale-110' 
                : 'text-gray-400 hover:text-wii-blue'
            }`}
          >
            <Icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
            {/* <span className="text-[10px] font-bold mt-1">{item.label}</span> */}
          </button>
        );
      })}
    </div>
  );
};