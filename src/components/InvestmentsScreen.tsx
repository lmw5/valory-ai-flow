
import React from 'react';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Activity } from 'lucide-react';
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
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400">Online</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Planos Ativos</p>
                <p className="text-white text-2xl font-light">{summary.activePlans}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600/20 to-green-500/20 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Renda Diária</p>
                <p className="text-white text-2xl font-light">{formatCurrency(summary.dailyIncome)}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600/20 to-purple-500/20 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Total Acumulado</p>
                <p className="text-white text-2xl font-light">{formatCurrency(summary.totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Daily Profits Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">
            Rendimentos Diários
          </h3>
          <DailyProfitsDisplay />
        </div>

        {/* Investment Plans */}
        {investments.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Planos Ativos</h3>
            
            {investments.map((investment) => (
              <div 
                key={investment.id}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">{investment.plan_name}</h4>
                    <div className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">
                      Ativo
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Investimento</p>
                      <p className="text-white">{formatCurrency(investment.investment_amount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Renda Diária</p>
                      <p className="text-green-400">{formatCurrency(investment.daily_return)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Data de Início</p>
                      <p className="text-white">{formatDate(investment.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Validade</p>
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
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">Nenhum investimento ativo</p>
            <p className="text-gray-500 text-sm">
              Comece investindo em nossos planos para ver seus rendimentos aqui
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentsScreen;
