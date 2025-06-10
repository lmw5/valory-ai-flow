
import React from 'react';
import { Home, CheckSquare, Wallet, HelpCircle } from 'lucide-react';

const BottomNavigation = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Início' },
    { id: 'tasks', icon: CheckSquare, label: 'Tarefas' },
    { id: 'withdraw', icon: Wallet, label: 'Saque' },
    { id: 'help', icon: HelpCircle, label: 'Ajuda' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-green-400 bg-green-500/10' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon 
                size={20} 
                className={`transition-all duration-300 ${
                  isActive ? 'scale-110' : ''
                }`} 
              />
              <span className="text-xs mt-1 font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
