
import React from 'react';
import { Button } from '@/components/ui/button';

const Dashboard = ({ user, balance, completedTasks, totalEarned, onNavigate }) => {
  return (
    <div className="min-h-screen pb-20 pt-8 px-6">
      <div className="max-w-md mx-auto space-y-8">
        {/* Greeting */}
        <div className="text-center">
          <h2 className="text-2xl font-light text-gray-300">
            Olá, <span className="text-white font-medium">{user?.name}</span>
          </h2>
        </div>

        {/* Balance Card */}
        <div className="relative">
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-3xl p-8 backdrop-blur-sm border border-gray-600/30 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-3xl"></div>
            <div className="relative text-center space-y-4">
              <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">
                Saldo disponível
              </p>
              <p className="text-4xl font-light text-white">
                R$ {balance.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={() => onNavigate('tasks')}
            className="w-full h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            Ativar tarefas automatizadas
          </Button>
          
          <Button 
            onClick={() => onNavigate('withdraw')}
            className="w-full h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            Solicitar Saque
          </Button>
          
          <p className="text-center text-gray-400 text-sm leading-relaxed">
            Use seu saldo para contratar tarefas que a IA executará por você
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-gray-800/50 rounded-2xl p-4 text-center backdrop-blur-sm">
            <p className="text-green-400 text-2xl font-light">{completedTasks}</p>
            <p className="text-gray-400 text-xs">Tarefas concluídas</p>
          </div>
          <div className="bg-gray-800/50 rounded-2xl p-4 text-center backdrop-blur-sm">
            <p className="text-blue-400 text-2xl font-light">R$ {totalEarned.toFixed(0)}</p>
            <p className="text-gray-400 text-xs">Total ganho</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
