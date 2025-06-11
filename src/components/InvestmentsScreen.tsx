
import React from 'react';
import { ArrowLeft, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface InvestmentsScreenProps {
  onNavigate?: (screen: string) => void;
}

const InvestmentsScreen = ({ onNavigate }: InvestmentsScreenProps) => {
  // Dados de exemplo - em uma implementação real, viriam do hook useUserSession
  const investmentData = {
    activePlans: 3,
    dailyIncome: 570.00,
    totalRevenue: 14200.00
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const indicatorBoxes = [
    {
      id: 'products',
      title: 'Produtos',
      value: `${investmentData.activePlans} Planos`,
      icon: TrendingUp,
      color: 'from-blue-600 to-blue-700'
    },
    {
      id: 'daily',
      title: 'Renda Diária',
      value: `${formatCurrency(investmentData.dailyIncome)}/dia`,
      icon: Calendar,
      color: 'from-green-600 to-green-700'
    },
    {
      id: 'total',
      title: 'Renda Total',
      value: formatCurrency(investmentData.totalRevenue),
      icon: DollarSign,
      color: 'from-purple-600 to-purple-700'
    }
  ];

  return (
    <div className="min-h-screen pb-20 pt-8 px-6 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="max-w-md mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="p-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 hover:bg-gray-700/50 transition-all duration-300 hover:scale-110"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-light text-white">
                Meus Investimentos
              </h1>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm leading-relaxed ml-14">
            Acompanhe o rendimento dos seus planos em tempo real
          </p>
        </div>

        {/* Indicator Boxes */}
        <div className="space-y-4">
          {indicatorBoxes.map((box, index) => {
            const Icon = box.icon;
            
            return (
              <div 
                key={box.id}
                className={`bg-gradient-to-r ${box.color} rounded-2xl p-6 backdrop-blur-sm border border-gray-600/20 shadow-xl hover:scale-[1.02] transition-all duration-300`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fade-in 0.6s ease-out forwards'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-white/80 text-sm font-medium tracking-wide uppercase">
                      {box.title}
                    </p>
                    <p className="text-white text-xl font-light">
                      {box.value}
                    </p>
                  </div>
                  
                  <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Investment Summary */}
        <div className="bg-gray-800/50 rounded-3xl p-6 backdrop-blur-sm border border-gray-600/30 space-y-4">
          <h3 className="text-lg font-medium text-white text-center">
            Resumo dos Investimentos
          </h3>
          
          <div className="space-y-3 text-gray-300 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
              <span>Planos Ativos:</span>
              <span className="text-blue-400 font-medium">{investmentData.activePlans}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
              <span>Rendimento Diário:</span>
              <span className="text-green-400 font-medium">
                {formatCurrency(investmentData.dailyIncome)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span>Total Acumulado:</span>
              <span className="text-purple-400 font-medium text-lg">
                {formatCurrency(investmentData.totalRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Investment Note */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            📈 Valores atualizados em tempo real
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestmentsScreen;
