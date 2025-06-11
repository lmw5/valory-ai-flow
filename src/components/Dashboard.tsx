
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CoinsIcon, Check } from 'lucide-react';

const Dashboard = ({ user, balance, completedTasks, totalEarned, onNavigate }) => {
  const investmentPlans = [
    {
      id: 'impulse',
      name: 'Plano Impulse',
      investment: 200,
      dailyReturn: 310,
      validity: 90,
      totalRevenue: 27.900,
      iconColor: 'text-blue-400',
      gradientFrom: 'from-blue-500/20',
      gradientTo: 'to-blue-600/20',
      buttonColor: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 'quantum',
      name: 'Plano Quantum',
      investment: 350,
      dailyReturn: 650,
      validity: 60,
      totalRevenue: 39.000,
      iconColor: 'text-green-400',
      gradientFrom: 'from-green-500/20',
      gradientTo: 'to-green-600/20',
      buttonColor: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
    },
    {
      id: 'valory-prime',
      name: 'Plano Valory Prime',
      investment: 500,
      dailyReturn: 1500,
      validity: 30,
      totalRevenue: 45.000,
      iconColor: 'text-purple-400',
      gradientFrom: 'from-purple-500/20',
      gradientTo: 'to-purple-600/20',
      buttonColor: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
    }
  ];

  const quickActions = [
    {
      id: 'deposit',
      title: 'Depositar',
      icon: ArrowRight,
      action: () => onNavigate('deposit')
    },
    {
      id: 'withdraw',
      title: 'Retirar Dinheiro',
      icon: CoinsIcon,
      action: () => onNavigate('withdraw')
    },
    {
      id: 'checklist',
      title: 'Checklist',
      icon: Check,
      action: () => onNavigate('tasks')
    }
  ];

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

        {/* Quick Actions Menu */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="flex flex-col items-center space-y-2 p-4 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700/30 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105"
              >
                <div className="bg-gray-700/80 p-3 rounded-xl">
                  <action.icon className="w-6 h-6 text-gray-300" />
                </div>
                <span className="text-xs text-gray-400 text-center font-medium">
                  {action.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Investment Plans Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-medium text-gray-200">Planos de Investimento</h3>
          
          {/* Investment Plan Cards */}
          <div className="space-y-6">
            {investmentPlans.map((plan) => (
              <Card key={plan.id} className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/30 overflow-hidden rounded-2xl shadow-xl">
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradientFrom} ${plan.gradientTo} opacity-20`}></div>
                <CardContent className="p-5 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`${plan.iconColor} bg-gray-800/80 p-2 rounded-lg mr-3`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19.5 8.5a2.5 2.5 0 0 0-2.5-2.5h-3a2.5 2.5 0 0 0-2.5 2.5v1"></path>
                          <path d="M16.5 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
                          <path d="M19.5 15.5a2.5 2.5 0 0 0-2.5-2.5h-9a2.5 2.5 0 0 0-2.5 2.5v1"></path>
                          <path d="M10 15.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-white">{plan.name}</h4>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">Valor do investimento</p>
                      <p className="text-white font-medium">R$ {plan.investment.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">Renda Diária</p>
                      <p className="text-white font-medium">R$ {plan.dailyReturn.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">Validade</p>
                      <p className="text-white font-medium">{plan.validity} dias</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">Receita Total</p>
                      <p className="text-white font-medium">R$ {plan.totalRevenue.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                  
                  <Button 
                    className={`w-full h-12 bg-gradient-to-r ${plan.buttonColor} text-white font-medium rounded-xl text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mt-2`}
                  >
                    Ativar agora
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <p className="text-center text-gray-400 text-sm leading-relaxed mt-4">
            Invista nos planos para receber rendas diárias automáticas
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
