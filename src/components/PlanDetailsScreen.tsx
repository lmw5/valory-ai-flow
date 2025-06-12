
import React, { useState } from 'react';
import { ArrowLeft, DollarSign, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

  const planDetails = [
    {
      id: 'investment',
      label: 'Valor do Investimento',
      value: formatCurrency(plan.investment),
      icon: DollarSign,
      color: 'text-blue-400'
    },
    {
      id: 'daily',
      label: 'Rendimento Diário',
      value: formatCurrency(plan.dailyReturn),
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      id: 'validity',
      label: 'Período de Validade',
      value: `${plan.validity} dias`,
      icon: Calendar,
      color: 'text-purple-400'
    },
    {
      id: 'total',
      label: 'Receita Total Estimada',
      value: formatCurrency(plan.totalRevenue),
      icon: DollarSign,
      color: 'text-yellow-400'
    }
  ];

  const dailyReturnPercentage = ((plan.dailyReturn / plan.investment) * 100).toFixed(2);
  const totalReturnPercentage = ((plan.totalRevenue / plan.investment) * 100).toFixed(0);

  return (
    <div className="min-h-screen pb-20 pt-8 px-6 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="max-w-md mx-auto space-y-8">
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

        {/* Plan Overview Card */}
        <Card className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-600/30">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">Retorno Diário</h3>
                <p className="text-3xl font-light text-green-400">{dailyReturnPercentage}%</p>
                <p className="text-gray-400 text-sm">do valor investido por dia</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-gray-400 text-xs">Retorno Total</p>
                  <p className="text-white font-medium">{totalReturnPercentage}%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Período</p>
                  <p className="text-white font-medium">{plan.validity} dias</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Details */}
        <div className="space-y-4">
          {planDetails.map((detail) => {
            const Icon = detail.icon;
            return (
              <div 
                key={detail.id}
                className="bg-gray-800/30 rounded-2xl p-4 backdrop-blur-sm border border-gray-700/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`${detail.color} bg-gray-700/50 p-2 rounded-lg`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-gray-300 text-sm">{detail.label}</span>
                  </div>
                  <span className="text-white font-medium">{detail.value}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Balance Warning */}
        {balance < plan.investment && (
          <div className="bg-red-900/20 border border-red-600/30 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-400 text-sm font-medium">Saldo Insuficiente</p>
                <p className="text-gray-400 text-xs">
                  Você precisa de {formatCurrency(plan.investment - balance)} a mais para ativar este plano
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Activation Button */}
        <Button
          onClick={handleActivatePlan}
          disabled={balance < plan.investment || isActivating || loading}
          className={`w-full h-14 bg-gradient-to-r ${plan.buttonColor} text-white font-medium rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
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
