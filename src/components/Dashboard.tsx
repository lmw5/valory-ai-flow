
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CoinsIcon } from 'lucide-react';

const Dashboard = ({ user, balance, completedTasks, totalEarned, onNavigate }) => {
  // Custom SVG icons for each plan
  const PlanIcons = {
    impulse: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        <circle cx="12" cy="12" r="1" fill="currentColor"/>
        <circle cx="8" cy="8" r="0.5" fill="currentColor" opacity="0.6"/>
        <circle cx="16" cy="16" r="0.5" fill="currentColor" opacity="0.6"/>
      </svg>
    ),
    quantum: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <circle cx="12" cy="12" r="8" strokeDasharray="4 4" opacity="0.5"/>
        <circle cx="12" cy="12" r="1" fill="currentColor"/>
        <path d="M12 2v2"/>
        <path d="M12 20v2"/>
        <path d="M2 12h2"/>
        <path d="M20 12h2"/>
        <path d="M4.93 4.93l1.41 1.41"/>
        <path d="M17.66 17.66l1.41 1.41"/>
        <path d="M4.93 19.07l1.41-1.41"/>
        <path d="M17.66 6.34l1.41-1.41"/>
      </svg>
    ),
    valoryPrime: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/>
        <polygon points="12,7 17,10 17,14 12,17 7,14 7,10" fill="currentColor" opacity="0.2"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <path d="M12 2v5"/>
        <path d="M12 17v5"/>
        <path d="M2 8.5l5 2.5"/>
        <path d="M17 11l5-2.5"/>
        <path d="M2 15.5l5-2.5"/>
        <path d="M17 13l5 2.5"/>
      </svg>
    )
  };

  const investmentPlans = [
    {
      id: 'impulse',
      name: 'Plano Impulse',
      investment: 200,
      dailyReturn: 310,
      validity: 90,
      totalRevenue: 27900,
      iconColor: 'text-blue-400',
      gradientFrom: 'from-blue-500/20',
      gradientTo: 'to-blue-600/20',
      buttonColor: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      Icon: PlanIcons.impulse
    },
    {
      id: 'quantum',
      name: 'Plano Quantum',
      investment: 350,
      dailyReturn: 650,
      validity: 60,
      totalRevenue: 39000,
      iconColor: 'text-green-400',
      gradientFrom: 'from-green-500/20',
      gradientTo: 'to-green-600/20',
      buttonColor: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      Icon: PlanIcons.quantum
    },
    {
      id: 'valory-prime',
      name: 'Plano Valory Prime',
      investment: 500,
      dailyReturn: 1500,
      validity: 30,
      totalRevenue: 45000,
      iconColor: 'text-purple-400',
      gradientFrom: 'from-purple-500/20',
      gradientTo: 'to-purple-600/20',
      buttonColor: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      Icon: PlanIcons.valoryPrime
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
    }
  ];

  const handlePlanActivation = (plan) => {
    onNavigate('plan-details', plan);
  };

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
          <div className="grid grid-cols-2 gap-4">
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
                      <div className={`${plan.iconColor} bg-gray-800/80 p-3 rounded-xl mr-3 backdrop-blur-sm border border-gray-700/30`}>
                        <plan.Icon />
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
                    onClick={() => handlePlanActivation(plan)}
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
