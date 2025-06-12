
import React from 'react';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Clock, Activity } from 'lucide-react';
import { useUserInvestments } from '@/hooks/useUserInvestments';
import DailyProfitsDisplay from './DailyProfitsDisplay';

interface InvestmentsScreenProps {
  onNavigate?: (screen: string) => void;
}

const InvestmentsScreen = ({ onNavigate }: InvestmentsScreenProps) => {
  const { investments, summary, loading } = useUserInvestments();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysRemaining = (startDate: string, validityDays: number) => {
    const start = new Date(startDate);
    const today = new Date();
    const daysPassed = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, validityDays - daysPassed);
    return daysRemaining;
  };

  const indicatorBoxes = [
    {
      id: 'products',
      title: 'Planos Ativos',
      value: `${summary.activePlans}`,
      subtitle: summary.activePlans === 1 ? 'plano' : 'planos',
      icon: TrendingUp,
      color: 'from-blue-700 to-blue-800'
    },
    {
      id: 'daily',
      title: 'Renda Diária',
      value: formatCurrency(summary.dailyIncome),
      subtitle: 'por dia',
      icon: Calendar,
      color: 'from-green-700 to-green-800'
    },
    {
      id: 'total',
      title: 'Total Acumulado',
      value: formatCurrency(summary.totalRevenue),
      subtitle: 'até hoje',
      icon: DollarSign,
      color: 'from-purple-700 to-purple-800'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen pb-20 pt-8 px-6 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando investimentos...</div>
      </div>
    );
  }

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
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400">Online</span>
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
                    <p className="text-white/60 text-xs">
                      {box.subtitle}
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

        {/* Daily Profits Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Rendimentos Diários
          </h3>
          <DailyProfitsDisplay />
        </div>

        {/* Individual Investment Plans */}
        {investments.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Planos Ativos</h3>
            
            {investments.map((investment, index) => {
              const daysRemaining = getDaysRemaining(investment.start_date, investment.validity_days);
              const isActive = daysRemaining > 0;
              const progressPercentage = Math.round(((investment.validity_days - daysRemaining) / investment.validity_days) * 100);
              
              return (
                <div 
                  key={investment.id}
                  className={`bg-gradient-to-r ${
                    isActive 
                      ? 'from-green-800/30 to-blue-800/30 border-green-500/20' 
                      : 'from-gray-800/30 to-gray-700/30 border-gray-600/20'
                  } rounded-2xl p-6 backdrop-blur-sm border shadow-xl`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'fade-in 0.6s ease-out forwards'
                  }}
                >
                  <div className="space-y-4">
                    {/* Plan Header */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium text-lg">{investment.plan_name}</h4>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isActive 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {isActive ? 'Ativo' : 'Expirado'}
                      </div>
                    </div>

                    {/* Plan Details Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-gray-400">Investimento</p>
                        <p className="text-white font-medium">{formatCurrency(investment.investment_amount)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400">Renda Diária</p>
                        <p className="text-green-400 font-medium">{formatCurrency(investment.daily_return)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400">Data de Início</p>
                        <p className="text-white font-medium">{formatDate(investment.start_date)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400">Dias Restantes</p>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <p className={`font-medium ${isActive ? 'text-purple-400' : 'text-gray-500'}`}>
                            {daysRemaining} dias
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Progresso</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isActive ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Investment Summary */}
        <div className="bg-gray-800/50 rounded-3xl p-6 backdrop-blur-sm border border-gray-600/30 space-y-4">
          <h3 className="text-lg font-medium text-white text-center">
            Resumo dos Investimentos
          </h3>
          
          <div className="space-y-3 text-gray-300 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
              <span>Planos Ativos:</span>
              <span className="text-blue-400 font-medium">{summary.activePlans}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
              <span>Rendimento Diário:</span>
              <span className="text-green-400 font-medium">
                {formatCurrency(summary.dailyIncome)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span>Total Acumulado:</span>
              <span className="text-purple-400 font-medium text-lg">
                {formatCurrency(summary.totalRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Investment Note */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            {summary.activePlans === 0 ? 
              "🚀 Comece investindo em nossos planos para ver seus rendimentos aqui" :
              "📈 Valores atualizados automaticamente. Os rendimentos são processados diariamente às 00:00."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestmentsScreen;
