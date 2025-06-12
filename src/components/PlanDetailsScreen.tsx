
import React, { useState } from 'react';
import { ArrowLeft, DollarSign, Calendar, TrendingUp, AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSecureInvestments } from '@/hooks/useSecureInvestments';
import { toast } from 'sonner';

interface PlanDetailsScreenProps {
  plan: any;
  balance: number;
  onNavigate: (screen: string) => void;
}

const PlanDetailsScreen = ({ plan, balance, onNavigate }: PlanDetailsScreenProps) => {
  const { createInvestment, checkSuspiciousActivity, loading } = useSecureInvestments();
  const [isActivating, setIsActivating] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleActivatePlan = async () => {
    if (balance < plan.investment) {
      toast.error('Saldo insuficiente para ativar este plano');
      return;
    }

    setIsActivating(true);

    try {
      // Check for suspicious activity first
      const isSuspicious = await checkSuspiciousActivity();
      if (isSuspicious) {
        toast.error('Atividade suspeita detectada. Entre em contato com o suporte.');
        return;
      }

      const success = await createInvestment({
        plan_id: plan.id,
        plan_name: plan.name,
        investment_amount: plan.investment,
        daily_return: plan.dailyReturn,
        validity_days: plan.validity
      });

      if (success) {
        onNavigate('dashboard');
      }
    } catch (error) {
      console.error('Error activating plan:', error);
      toast.error('Erro ao ativar plano. Tente novamente.');
    } finally {
      setIsActivating(false);
    }
  };

  const dailyReturnPercentage = ((plan.dailyReturn / plan.investment) * 100).toFixed(2);
  const totalReturnPercentage = ((plan.totalRevenue / plan.investment) * 100).toFixed(0);

  return (
    <div className="min-h-screen pb-20 pt-8 px-6 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 hover:bg-gray-700/50 transition-all duration-300 hover:scale-110"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-light text-white">{plan.name}</h1>
            <p className="text-gray-400 text-sm">Detalhes do Plano de Investimento</p>
          </div>
        </div>

        {/* Main Plan Card */}
        <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg font-medium flex items-center justify-between">
              <span>Resumo do Investimento</span>
              <Shield className="w-5 h-5 text-green-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Investment Amount */}
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Valor do Investimento</p>
              <p className="text-3xl font-light text-white">{formatCurrency(plan.investment)}</p>
            </div>

            {/* Returns Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-xs font-medium">Rendimento Diário</span>
                </div>
                <p className="text-green-400 text-xl font-semibold">{dailyReturnPercentage}%</p>
                <p className="text-gray-400 text-xs">{formatCurrency(plan.dailyReturn)}</p>
              </div>
              
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-xs font-medium">Período</span>
                </div>
                <p className="text-blue-400 text-xl font-semibold">{plan.validity}</p>
                <p className="text-gray-400 text-xs">dias</p>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 text-sm font-medium">Receita Total Estimada</p>
                  <p className="text-white text-2xl font-light">{formatCurrency(plan.totalRevenue)}</p>
                  <p className="text-gray-400 text-xs">Retorno total de {totalReturnPercentage}%</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Features */}
        <Card className="bg-gray-800/50 border border-gray-700/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base font-medium">Características do Plano</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-300 text-sm">Rendimento diário garantido</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-300 text-sm">Proteção contra fraudes</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-300 text-sm">Validação de segurança automática</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-300 text-sm">Suporte técnico 24/7</span>
            </div>
          </CardContent>
        </Card>

        {/* Balance Warning */}
        {balance < plan.investment && (
          <Card className="bg-red-900/20 border border-red-600/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-400 text-sm font-medium">Saldo Insuficiente</p>
                  <p className="text-gray-400 text-xs">
                    Você precisa de {formatCurrency(plan.investment - balance)} a mais para ativar este plano
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Balance Display */}
        <div className="bg-gray-800/30 rounded-xl p-4 backdrop-blur-sm border border-gray-700/20">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Seu Saldo Atual</span>
            <span className="text-white font-medium">{formatCurrency(balance)}</span>
          </div>
        </div>

        {/* Activation Button */}
        <Button
          onClick={handleActivatePlan}
          disabled={balance < plan.investment || isActivating || loading}
          className={`w-full h-14 bg-gradient-to-r ${plan.buttonColor} text-white font-medium rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
        >
          {isActivating || loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Ativando...</span>
            </div>
          ) : balance < plan.investment ? (
            'Saldo Insuficiente'
          ) : (
            'Ativar Plano Agora'
          )}
        </Button>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            🔒 Transação protegida por validação de segurança e monitoramento de atividade suspeita
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailsScreen;
