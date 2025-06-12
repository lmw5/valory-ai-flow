
import React from 'react';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Activity, Building2, Package } from 'lucide-react';
import { useUserInvestments } from '@/hooks/useUserInvestments';

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

  if (loading) {
    return (
      <div className="min-h-screen pb-20 pt-8 px-6 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando investimentos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-8 px-6 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 hover:bg-gray-700/50 transition-all duration-300"
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
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">Online</span>
          </div>
        </div>

        {/* Main Data Boxes */}
        <div className="grid grid-cols-1 gap-4 animate-fade-in">
          {/* Produtos Box */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Package className="w-5 h-5 text-white/70" />
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-sm font-medium">Planos Adquiridos</p>
                <p className="text-white text-2xl font-light mt-1">{summary.activePlans}</p>
              </div>
            </div>
          </div>

          {/* Renda Diária Box */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Calendar className="w-5 h-5 text-white/70" />
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-sm font-medium">Ganho por Dia</p>
                <p className="text-white text-2xl font-light mt-1">{formatCurrency(summary.dailyIncome)}</p>
              </div>
            </div>
          </div>

          {/* Renda Total Box */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <DollarSign className="w-5 h-5 text-white/70" />
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-sm font-medium">Total Acumulado</p>
                <p className="text-white text-2xl font-light mt-1">{formatCurrency(summary.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Plans */}
        {investments.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-700/50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-white">Planos Ativos</h3>
            </div>
            
            {investments.map((investment) => (
              <div 
                key={investment.id}
                className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-5 border border-gray-700/30"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium text-lg">{investment.plan_name}</h4>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm border border-emerald-500/30">
                      Ativo
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-gray-400 text-sm">Investimento</p>
                      <p className="text-white font-medium">{formatCurrency(investment.investment_amount)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-sm">Renda Diária</p>
                      <p className="text-emerald-400 font-medium">{formatCurrency(investment.daily_return)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-sm">Data de Início</p>
                      <p className="text-white">{formatDate(investment.start_date)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-sm">Validade</p>
                      <p className="text-white">{investment.validity_days} dias</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {investments.length === 0 && (
          <div className="text-center py-12 bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/30">
            <div className="p-4 bg-gray-700/50 rounded-2xl w-fit mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400 mx-auto" />
            </div>
            <p className="text-gray-300 text-lg mb-2 font-medium">Nenhum investimento ativo</p>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Comece investindo em nossos planos para ver seus rendimentos aqui
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentsScreen;
