import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useUserSession } from '@/hooks/useUserSession';

interface PlanDetailsScreenProps {
  plan: {
    id: string;
    name: string;
    investment: number;
    dailyReturn: number;
    validity: number;
    totalRevenue: number;
    iconColor: string;
    gradientFrom: string;
    gradientTo: string;
    buttonColor: string;
  };
  balance: number;
  onNavigate: (screen: string) => void;
}

const PlanDetailsScreen = ({ plan, balance, onNavigate }: PlanDetailsScreenProps) => {
  const [showInsufficientBalanceDialog, setShowInsufficientBalanceDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addInvestment } = useUserSession();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleGoBack = () => {
    console.log('Botão de voltar clicado - navegando para dashboard');
    onNavigate('dashboard');
  };

  const handleConfirm = async () => {
    console.log('Iniciando processo de contratação do plano:', plan.name);
    console.log('Saldo atual:', balance, 'Valor do plano:', plan.investment);
    
    if (balance >= plan.investment) {
      setIsProcessing(true);
      
      try {
        const success = await addInvestment({
          plan_id: plan.id,
          plan_name: plan.name,
          investment_amount: plan.investment,
          daily_return: plan.dailyReturn,
          validity_days: plan.validity
        });

        setIsProcessing(false);

        if (success) {
          console.log('Plano contratado com sucesso!');
          setShowSuccessDialog(true);
        } else {
          console.error('Erro ao contratar plano - falha na transação');
        }
      } catch (error) {
        console.error('Erro ao contratar plano:', error);
        setIsProcessing(false);
      }
    } else {
      console.log('Saldo insuficiente - mostrando dialog de erro');
      setShowInsufficientBalanceDialog(true);
    }
  };

  const handleSuccessClose = () => {
    console.log('Fechando dialog de sucesso e retornando ao dashboard');
    setShowSuccessDialog(false);
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen pb-20 pt-8 px-6 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header com botão de voltar */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleGoBack}
            className="p-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 hover:bg-gray-700/50 transition-all duration-300 hover:scale-110 active:scale-95"
            type="button"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-light text-white">
              Detalhes do Plano
            </h1>
          </div>
        </div>

        {/* Imagem ilustrativa do plano */}
        <div className="w-full flex justify-center">
          <div className="w-4/5 aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/30 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=240&fit=crop&crop=center"
              alt={`Ilustração ${plan.name}`}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
        </div>

        {/* Título do Plano */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-light text-white">
            {plan.name}
          </h2>
        </div>

        {/* Descrição persuasiva */}
        <div className="text-center space-y-2">
          <p className="text-gray-300 text-lg leading-relaxed">
            Invista no <span className="text-white font-medium">{plan.name}</span> e decole rumo a retornos financeiros diários!
          </p>
          <p className="text-gray-300 text-lg leading-relaxed">
            Com um investimento de <span className="text-green-400 font-medium">{formatCurrency(plan.investment)}</span>, você garante um retorno diário de <span className="text-green-400 font-medium">{formatCurrency(plan.dailyReturn)}</span>.
          </p>
        </div>

        {/* Bloco de Informações */}
        <div className="bg-gray-800/50 rounded-3xl p-6 backdrop-blur-sm border border-gray-600/30 space-y-4">
          <h3 className="text-lg font-medium text-white text-center mb-6">
            Detalhes do Investimento
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
              <span className="text-gray-400 text-sm font-medium">Preço</span>
              <span className="text-white font-medium text-lg">{formatCurrency(plan.investment)}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
              <span className="text-gray-400 text-sm font-medium">Renda Diária</span>
              <span className="text-green-400 font-medium text-lg">{formatCurrency(plan.dailyReturn)}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
              <span className="text-gray-400 text-sm font-medium">Validade</span>
              <span className="text-white font-medium text-lg">{plan.validity} dias</span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-400 text-sm font-medium">Receita Total</span>
              <span className="text-blue-400 font-medium text-xl">{formatCurrency(plan.totalRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Botão de Confirmação */}
        <div className="pt-4">
          <Button 
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
          >
            {isProcessing ? 'Processando...' : 'Confirmar'}
          </Button>
        </div>

        {/* Saldo Atual */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Seu saldo atual: <span className="text-gray-300 font-medium">{formatCurrency(balance)}</span>
          </p>
        </div>
      </div>

      {/* Dialog de Saldo Insuficiente */}
      <Dialog open={showInsufficientBalanceDialog} onOpenChange={setShowInsufficientBalanceDialog}>
        <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-sm mx-auto rounded-2xl">
          <DialogHeader className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">!</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-medium text-white text-center">
                Saldo Insuficiente
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-center">
                Você precisa de saldo para realizar a compra
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 pt-2">
            <div className="text-center space-y-4">
              <div className="space-y-1">
                <p className="text-gray-400 text-sm">Valor necessário:</p>
                <p className="text-white font-medium text-lg">{formatCurrency(plan.investment)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 text-sm">Seu saldo atual:</p>
                <p className="text-red-400 font-medium text-lg">{formatCurrency(balance)}</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowInsufficientBalanceDialog(false)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl h-12"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Sucesso */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-sm mx-auto rounded-2xl">
          <DialogHeader className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">✓</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-medium text-white text-center">
                Plano Contratado!
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-center">
                Seu investimento foi realizado com sucesso
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 pt-2">
            <div className="text-center space-y-4">
              <p className="text-gray-300 text-sm">
                Parabéns! Você contratou o <span className="text-white font-medium">{plan.name}</span> e já começou a gerar renda diária.
              </p>
            </div>
            
            <Button 
              onClick={handleSuccessClose}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl h-12"
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanDetailsScreen;
