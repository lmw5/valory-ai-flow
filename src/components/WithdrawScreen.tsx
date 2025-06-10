
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const WithdrawScreen = ({ balance }) => {
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);

  const handleWithdrawRequest = () => {
    setShowActivationModal(true);
  };

  const handleActivationConfirm = () => {
    setShowActivationModal(false);
    setShowFeeModal(true);
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
        <Button 
          onClick={handleWithdrawRequest}
          className="w-full h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          Solicitar Saque
        </Button>

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
            <p className="text-gray-400 text-sm">R$ 50,00</p>
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
                  Para ativar sua conta e liberar o saque, é necessário um depósito único de 
                  <span className="text-green-400 font-medium"> R$50</span>.
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
