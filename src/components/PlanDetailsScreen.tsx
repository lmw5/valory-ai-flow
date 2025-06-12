
import React, { useState } from 'react';
import { ArrowLeft, DollarSign, Calendar, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
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

          {/* Plan Title - Centralized */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {plan.name}
            </h1>
            <p className="text-gray-400 text-lg">
              Detalhes do Plano
            </p>
          </div>

          {/* Investment Details Card */}
          <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl mb-6 shadow-2xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Investment Amount */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-blue-400 mr-3" />
                    <span className="text-gray-300 font-medium">Investimento</span>
                  </div>
                  <span className="text-white font-bold text-xl">{formatCurrency(plan.investment)}</span>
                </div>
                <Separator className="bg-white/10" />

                {/* Daily Return */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400 mr-3" />
                    <span className="text-gray-300 font-medium">Renda Diária</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-xl">{formatCurrency(plan.dailyReturn)}</span>
                </div>
                <Separator className="bg-white/10" />

                {/* Validity Period */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-purple-400 mr-3" />
                    <span className="text-gray-300 font-medium">Período</span>
                  </div>
                  <span className="text-white font-bold text-xl">{plan.validity} dias</span>
                </div>
                <Separator className="bg-white/10" />

                {/* Total Revenue - Centralized */}
                <div className="text-center py-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl px-4 mt-6">
                  <div className="text-gray-300 font-medium text-lg mb-2">Receita Total</div>
                  <div className="text-yellow-400 font-bold text-2xl">{formatCurrency(totalRevenue)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Balance - Centralized */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-6 text-center">
            <div className="text-gray-400 font-medium mb-2">Saldo Disponível</div>
            <div className="text-white font-bold text-lg">{formatCurrency(balance)}</div>
          </div>

          {/* Confirm Button - Centralized */}
          <div className="flex flex-col items-center space-y-4">
            <Button
              onClick={handleActivatePlan}
              disabled={isActivating || loading}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl text-lg shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isActivating || loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processando...</span>
                </div>
              ) : (
                'Confirmar Investimento'
              )}
            </Button>

            {/* Security Notice - Centralized */}
            <p className="text-xs text-gray-500 text-center">
              🔒 Transação protegida com criptografia de ponta a ponta
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Insufficient Balance Dialog */}
      <AlertDialog open={showInsufficientBalanceDialog} onOpenChange={setShowInsufficientBalanceDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border border-red-500/30 rounded-3xl max-w-sm mx-auto">
          <AlertDialogHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <AlertDialogTitle className="text-red-400 text-2xl font-bold text-center">
              Saldo Insuficiente
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 text-base leading-relaxed space-y-3 text-center">
              <p>
                Você precisa de <span className="text-white font-semibold">{formatCurrency(plan.investment)}</span> para este investimento.
              </p>
              <p>
                Saldo atual: <span className="text-red-400 font-semibold">{formatCurrency(balance)}</span>
              </p>
              <p>
                Você precisa de mais <span className="text-yellow-400 font-semibold">{formatCurrency(plan.investment - balance)}</span> para realizar este investimento.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col space-y-3 pt-4">
            <AlertDialogAction
              onClick={() => {
                setShowInsufficientBalanceDialog(false);
                onNavigate('deposit');
              }}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl h-12 text-base"
            >
              Fazer Depósito
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => setShowInsufficientBalanceDialog(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl h-12 text-base"
            >
              Voltar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PlanDetailsScreen;
