
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
        <div className="max-w-md mx-auto px-6 py-8">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-gray-400 font-medium">Protegido</span>
            </div>
          </div>

          {/* Plan Illustrative Image */}
          <div className="flex justify-center mb-8">
            <div className="w-4/5 aspect-video bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20 rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden">
              <div className="w-full h-full flex items-center justify-center relative">
                {/* Tech Pattern Background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div key={i} className="border border-cyan-400/30 animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                    ))}
                  </div>
                </div>
                {/* Central Tech Icon */}
                <div className="z-10 text-center">
                  <TrendingUp className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
                  <div className="text-lg font-bold text-white">{plan.name}</div>
                  <div className="text-sm text-cyan-400">Tech Investment</div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Title */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              {plan.name}
            </h1>
          </div>

          {/* Persuasive Description */}
          <div className="text-center mb-8 px-4">
            <p className="text-lg text-gray-300 leading-relaxed">
              Invista no <span className="text-white font-semibold">{plan.name}</span> e decole rumo a retornos financeiros diários!
            </p>
            <p className="text-lg text-gray-300 leading-relaxed mt-2">
              Com um investimento de <span className="text-emerald-400 font-bold">{formatCurrency(plan.investment)}</span>, 
              você garante um retorno diário de <span className="text-emerald-400 font-bold">{formatCurrency(plan.dailyReturn)}</span>.
            </p>
          </div>

          {/* Information Block */}
          <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl mb-8 shadow-2xl">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Investment Amount */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-blue-400 mr-3" />
                    <span className="text-gray-300 font-medium text-lg">Preço</span>
                  </div>
                  <span className="text-white font-bold text-xl">{formatCurrency(plan.investment)}</span>
                </div>
                <Separator className="bg-white/10" />

                {/* Daily Return */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400 mr-3" />
                    <span className="text-gray-300 font-medium text-lg">Renda Diária</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-xl">{formatCurrency(plan.dailyReturn)}</span>
                </div>
                <Separator className="bg-white/10" />

                {/* Validity Period */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-purple-400 mr-3" />
                    <span className="text-gray-300 font-medium text-lg">Validade</span>
                  </div>
                  <span className="text-white font-bold text-xl">{plan.validity} dias</span>
                </div>
                <Separator className="bg-white/10" />

                {/* Total Revenue */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-200 font-medium text-lg">Receita Total</span>
                    <span className="text-yellow-400 font-bold text-2xl">{formatCurrency(totalRevenue)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Balance Display */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 text-center">
            <div className="text-gray-400 font-medium text-lg mb-2">Saldo Disponível</div>
            <div className="text-white font-bold text-2xl">{formatCurrency(balance)}</div>
          </div>

          {/* Confirmation Button */}
          <div className="space-y-4">
            <Button
              onClick={handleActivatePlan}
              disabled={isActivating || loading}
              className="w-full h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-2xl text-xl shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isActivating || loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processando...</span>
                </div>
              ) : (
                'Confirmar'
              )}
            </Button>

            {/* Security Notice */}
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              🔒 Transação protegida com criptografia de ponta a ponta
            </p>
          </div>
        </div>
      </div>

      {/* Insufficient Balance Dialog */}
      <AlertDialog open={showInsufficientBalanceDialog} onOpenChange={setShowInsufficientBalanceDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border border-red-500/30 rounded-3xl max-w-sm mx-auto">
          <AlertDialogHeader className="text-center space-y-4">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
            <AlertDialogTitle className="text-red-400 text-2xl font-bold text-center">
              Saldo Insuficiente
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 text-base leading-relaxed space-y-3 text-center">
              <p>
                Você precisa de saldo para realizar a compra.
              </p>
              <p>
                Investimento necessário: <span className="text-white font-semibold">{formatCurrency(plan.investment)}</span>
              </p>
              <p>
                Saldo atual: <span className="text-red-400 font-semibold">{formatCurrency(balance)}</span>
              </p>
              <p>
                Diferença: <span className="text-yellow-400 font-semibold">{formatCurrency(plan.investment - balance)}</span>
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col space-y-3 pt-6">
            <AlertDialogAction
              onClick={() => {
                setShowInsufficientBalanceDialog(false);
                onNavigate('deposit');
              }}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-2xl h-12 text-base"
            >
              Fazer Depósito
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => setShowInsufficientBalanceDialog(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-2xl h-12 text-base"
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
