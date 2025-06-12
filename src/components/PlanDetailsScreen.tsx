
import React, { useState } from 'react';
import { ArrowLeft, DollarSign, Calendar, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
  const [showInsufficientBalanceDialog, setShowInsufficientBalanceDialog] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleActivatePlan = async () => {
    if (balance < plan.investment) {
      setShowInsufficientBalanceDialog(true);
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
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black text-white">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-gray-400 font-medium">Protegido</span>
            </div>
          </div>

          {/* Plan Image */}
          <div className="w-full mb-8">
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/5 overflow-hidden backdrop-blur-sm">
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
                alt="Plano de investimento"
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>

          {/* Plan Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight">
              {plan.name}
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
          </div>

          {/* Plan Description */}
          <div className="text-center mb-8 space-y-3">
            <p className="text-gray-300 text-lg font-light leading-relaxed">
              Maximize seus ganhos com retornos diários garantidos
            </p>
            <p className="text-gray-400 text-base">
              Investimento de <span className="text-emerald-400 font-semibold">{formatCurrency(plan.investment)}</span> 
              {' '}com retorno diário de <span className="text-emerald-400 font-semibold">{formatCurrency(plan.dailyReturn)}</span>
            </p>
          </div>

          {/* Investment Details Card */}
          <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl mb-6 shadow-2xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <DollarSign className="w-5 h-5 text-blue-400 mr-2" />
                Detalhes do Investimento
              </h3>

              <div className="space-y-4">
                {/* Investment Amount */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400 font-medium">Investimento</span>
                  <span className="text-white font-semibold text-lg">{formatCurrency(plan.investment)}</span>
                </div>
                <Separator className="bg-white/5" />

                {/* Daily Return */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-emerald-400 mr-2" />
                    <span className="text-gray-400 font-medium">Renda Diária</span>
                  </div>
                  <span className="text-emerald-400 font-semibold text-lg">{formatCurrency(plan.dailyReturn)}</span>
                </div>
                <Separator className="bg-white/5" />

                {/* Validity Period */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-gray-400 font-medium">Período</span>
                  </div>
                  <span className="text-white font-semibold text-lg">{plan.validity} dias</span>
                </div>
                <Separator className="bg-white/5" />

                {/* Total Revenue */}
                <div className="flex items-center justify-between py-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl px-4 mt-4">
                  <span className="text-gray-300 font-medium">Receita Total</span>
                  <span className="text-yellow-400 font-bold text-xl">{formatCurrency(totalRevenue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Balance */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm font-medium">Saldo Disponível</span>
              <span className="text-white font-semibold text-lg">{formatCurrency(balance)}</span>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="space-y-4">
            <Button
              onClick={handleActivatePlan}
              disabled={isActivating || loading}
              className="w-full h-16 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-2xl text-lg shadow-2xl transform transition-all duration-200 active:scale-95 hover:shadow-blue-500/25 border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isActivating || loading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processando...</span>
                </div>
              ) : (
                'Confirmar'
              )}
            </Button>

            {/* Security Notice */}
            <p className="text-xs text-gray-500 text-center leading-relaxed px-4">
              🔒 Transação protegida com criptografia de ponta a ponta e validação de segurança
            </p>
          </div>
        </div>
      </div>

      {/* Insufficient Balance Dialog */}
      <AlertDialog open={showInsufficientBalanceDialog} onOpenChange={setShowInsufficientBalanceDialog}>
        <AlertDialogContent className="bg-slate-900 border border-red-500/20 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400 text-xl font-semibold text-center">
              Saldo Insuficiente
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 text-center text-base mt-4">
              Você precisa de saldo para realizar a compra
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowInsufficientBalanceDialog(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl h-12"
            >
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PlanDetailsScreen;
