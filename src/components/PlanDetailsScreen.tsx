
import React, { useState } from 'react';
import { ArrowLeft, DollarSign, Calendar, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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

  const totalRevenue = plan.dailyReturn * plan.validity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      <div className="max-w-md mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Protegido</span>
          </div>
        </div>

        {/* Imagem ilustrativa do plano */}
        <div className="w-4/5 mx-auto">
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
              alt="Plano de investimento"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        </div>

        {/* Título do Plano */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-light text-white tracking-tight">
            {plan.name}
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full" />
        </div>

        {/* Descrição persuasiva */}
        <div className="text-center space-y-4">
          <p className="text-gray-300 text-lg leading-relaxed font-light">
            Invista no <span className="text-white font-medium">{plan.name}</span> e decole rumo a retornos financeiros diários!
          </p>
          <p className="text-gray-400 text-base">
            Com um investimento de <span className="text-green-400 font-medium">{formatCurrency(plan.investment)}</span>, 
            você garante um retorno diário de <span className="text-green-400 font-medium">{formatCurrency(plan.dailyReturn)}</span>.
          </p>
        </div>

        {/* Bloco de Informações */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span>Detalhes do Investimento</span>
            </h3>

            {/* Preço */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-light">Preço</span>
              <span className="text-white font-medium text-lg">{formatCurrency(plan.investment)}</span>
            </div>
            <Separator className="bg-white/10" />

            {/* Renda Diária */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 font-light">Renda Diária</span>
              </div>
              <span className="text-green-400 font-medium text-lg">{formatCurrency(plan.dailyReturn)}</span>
            </div>
            <Separator className="bg-white/10" />

            {/* Validade */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 font-light">Validade</span>
              </div>
              <span className="text-white font-medium text-lg">{plan.validity} dias</span>
            </div>
            <Separator className="bg-white/10" />

            {/* Receita Total */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-gray-300 font-light">Receita Total</span>
              <span className="text-yellow-400 font-semibold text-xl">{formatCurrency(totalRevenue)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Saldo Atual */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Seu Saldo Atual</span>
            <span className="text-white font-medium">{formatCurrency(balance)}</span>
          </div>
        </div>

        {/* Aviso de saldo insuficiente */}
        {balance < plan.investment && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-sm text-center">
              Saldo insuficiente. Você precisa de {formatCurrency(plan.investment - balance)} a mais.
            </p>
          </div>
        )}

        {/* Botão de Confirmação */}
        <div className="space-y-4">
          <Button
            onClick={handleActivatePlan}
            disabled={balance < plan.investment || isActivating || loading}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0"
          >
            {isActivating || loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Ativando...</span>
              </div>
            ) : balance < plan.investment ? (
              'Saldo Insuficiente'
            ) : (
              'Confirmar Investimento'
            )}
          </Button>

          {/* Security Notice */}
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            🔒 Transação protegida com validação de segurança e monitoramento automático
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailsScreen;
