
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const WithdrawScreen = ({ balance }) => {
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  
  const canWithdraw = balance >= 250;
  const minimumAmount = 250;

  const handleWithdrawRequest = () => {
    if (canWithdraw) {
      setShowActivationModal(true);
    }
  };

  const handleActivationConfirm = () => {
    setShowActivationModal(false);
    // Redireciona para o link especificado
    window.open('https://seguro.valoryapp.com.br/r/16759r11914u836K', '_blank');
  };

  return (
    <div className="min-h-screen pb-20 pt-8 px-6">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light text-white mb-2">
            Solicitar Saque
          </h2>
          <p className="text-gray-400 text-sm">
            Retire seus ganhos de forma rápida e segura
          </p>
        </div>

        {/* Balance Display */}
        <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-3xl p-8 backdrop-blur-sm border border-gray-600/30 shadow-2xl text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-3xl"></div>
          <div className="relative space-y-4">
            <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">
              Saldo Total Disponível
            </p>
            <p className="text-4xl font-light text-white">
              R$ {balance.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        {/* Withdraw Button */}
        <div className="space-y-4">
          <Button 
            onClick={handleWithdrawRequest}
            disabled={!canWithdraw}
            className={`w-full h-16 font-medium rounded-2xl text-lg shadow-lg transition-all duration-300 ${
              canWithdraw 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-xl hover:scale-[1.02]'
                : 'bg-gray-600/50 text-gray-400 cursor-not-allowed hover:scale-100'
            }`}
          >
            Solicitar Saque
          </Button>
          
          {!canWithdraw && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 text-center">
              <p className="text-orange-400 text-sm font-medium">
                💰 Saldo mínimo necessário para saque
              </p>
              <p className="text-orange-300 text-lg font-semibold mt-1">
                R$ {minimumAmount.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Continue realizando tarefas para atingir o valor mínimo
              </p>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm">
            <h3 className="text-white font-medium mb-2">💳 Métodos de Saque</h3>
            <p className="text-gray-400 text-sm">PIX, Transferência bancária</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm">
            <h3 className="text-white font-medium mb-2">⏱️ Tempo de Processamento</h3>
            <p className="text-gray-400 text-sm">Até 2 horas úteis</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm">
            <h3 className="text-white font-medium mb-2">💰 Valor Mínimo</h3>
            <p className="text-gray-400 text-sm">R$ 250,00</p>
          </div>
        </div>

        {/* Activation Modal */}
        <Dialog open={showActivationModal} onOpenChange={setShowActivationModal}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-lg font-medium">
                Ativação de Conta
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-4">
              <div className="text-center space-y-4">
                <div className="text-4xl">🔐</div>
                <p className="text-gray-300 leading-relaxed">
                  Para liberar o saque e desbloquear todos os recursos da plataforma, é necessário ativar sua conta, sem mensalidades, sem taxas escondidas. Essa ativação garante sua conexão oficial à rede Valory X e libera o acesso completo aos ganhos.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleActivationConfirm}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  Continuar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowActivationModal(false)}
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Fee Modal */}
        <Dialog open={showFeeModal} onOpenChange={setShowFeeModal}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-lg font-medium">
                Taxa de Processamento
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-4">
              <div className="text-center space-y-4">
                <div className="text-4xl">📊</div>
                <p className="text-gray-300 leading-relaxed">
                  Para liberar o valor total, será cobrada uma taxa de 
                  <span className="text-blue-400 font-medium"> 10%</span> sobre o saque solicitado.
                </p>
                
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Valor a receber:</p>
                  <p className="text-xl text-green-400 font-medium">
                    R$ {(balance * 0.9).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  Confirmar Saque
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFeeModal(false)}
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WithdrawScreen;
