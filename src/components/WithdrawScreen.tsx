import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

interface WithdrawScreenProps {
  balance: number;
  onNavigate?: (screen: string) => void;
}

const WithdrawScreen = ({ balance, onNavigate }: WithdrawScreenProps) => {
  const [pixKeyType, setPixKeyType] = useState('');
  const [holderName, setHolderName] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [amount, setAmount] = useState('');

  const minimumAmount = 250;
  const feePercentage = 10;
  
  const numericAmount = parseFloat(amount) || 0;
  const fee = numericAmount * (feePercentage / 100);
  const finalAmount = numericAmount - fee;

  const isFormValid = pixKeyType && holderName.trim() && pixKey.trim() && numericAmount >= minimumAmount && numericAmount <= balance;

  const handleWithdraw = () => {
    if (isFormValid) {
      console.log('Processando saque:', {
        pixKeyType,
        holderName,
        pixKey,
        amount: numericAmount,
        fee,
        finalAmount
      });
      // Aqui seria implementada a lógica de saque
    }
  };

  const formatCurrency = (value: number) => {
    return value.toFixed(2).replace('.', ',');
  };

  return (
    <div className="min-h-screen pb-20 pt-8 px-6 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 hover:bg-gray-700/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
          )}
          <h1 className="text-2xl font-light text-white text-center flex-1">
            Retirar Dinheiro
          </h1>
          {/* Invisible spacer to balance the layout */}
          <div className="w-10 h-10"></div>
        </div>

        {/* Balance Display */}
        <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-3xl p-6 backdrop-blur-sm border border-gray-600/30 shadow-2xl text-center">
          <p className="text-gray-400 text-sm font-medium tracking-wide uppercase mb-2">
            Saldo Disponível
          </p>
          <p className="text-3xl font-light text-white">
            R$ {formatCurrency(balance)}
          </p>
        </div>

        {/* Withdraw Form */}
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-3xl p-6 backdrop-blur-sm border border-gray-600/30">
            <h2 className="text-lg font-medium text-white mb-6 text-center">
              Dados para Saque
            </h2>
            
            <div className="space-y-4">
              {/* Tipo de Chave Pix */}
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-gray-300 block">
                  Tipo de Chave Pix
                </label>
                <Select value={pixKeyType} onValueChange={setPixKeyType}>
                  <SelectTrigger className="w-full h-12 bg-gray-700/50 border-gray-600/50 text-white rounded-xl focus:border-blue-500/50">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="cpf" className="text-white hover:bg-gray-700">CPF</SelectItem>
                    <SelectItem value="email" className="text-white hover:bg-gray-700">E-mail</SelectItem>
                    <SelectItem value="celular" className="text-white hover:bg-gray-700">Celular</SelectItem>
                    <SelectItem value="aleatoria" className="text-white hover:bg-gray-700">Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nome do Titular */}
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-gray-300 block">
                  Nome do Titular
                </label>
                <Input
                  type="text"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  placeholder="Digite o nome completo do titular da conta"
                  className="h-12 bg-gray-700/50 border-gray-600/50 text-white rounded-xl placeholder:text-gray-500 focus:border-blue-500/50"
                />
              </div>

              {/* Chave Pix */}
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-gray-300 block">
                  Chave Pix
                </label>
                <Input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="Insira sua chave Pix"
                  className="h-12 bg-gray-700/50 border-gray-600/50 text-white rounded-xl placeholder:text-gray-500 focus:border-blue-500/50"
                />
              </div>

              {/* Valor */}
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-gray-300 block">
                  Valor
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Insira o valor de retirada"
                  min={minimumAmount}
                  max={balance}
                  className="h-12 bg-gray-700/50 border-gray-600/50 text-white rounded-xl placeholder:text-gray-500 focus:border-blue-500/50"
                />
                {numericAmount > 0 && (
                  <div className="text-xs text-gray-400 space-y-1 text-left">
                    <p>Taxa (10%): R$ {formatCurrency(fee)}</p>
                    <p className="text-green-400 font-medium">Valor a receber: R$ {formatCurrency(finalAmount)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Validation Messages */}
            {amount && numericAmount < minimumAmount && (
              <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <p className="text-orange-400 text-sm text-left">
                  Valor mínimo para saque: R$ {formatCurrency(minimumAmount)}
                </p>
              </div>
            )}

            {amount && numericAmount > balance && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm text-left">
                  Valor não pode ser maior que o saldo disponível
                </p>
              </div>
            )}
          </div>

          {/* Withdraw Button */}
          <Button
            onClick={handleWithdraw}
            disabled={!isFormValid}
            className={`w-full h-16 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 transform ${
              isFormValid 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:scale-[1.02] shadow-blue-500/25' 
                : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
            }`}
          >
            Sacar
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-gray-800/50 rounded-3xl p-6 backdrop-blur-sm border border-gray-600/30">
          <h3 className="text-lg font-bold text-white mb-4 text-center">
            Instruções de Retirada
          </h3>
          <div className="space-y-3 text-gray-300 text-sm leading-relaxed text-left">
            <div className="flex items-start space-x-3">
              <span className="text-blue-400 mt-1">•</span>
              <p>O valor mínimo de saque é R$ 250,00</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-blue-400 mt-1">•</span>
              <p>Saques podem ser realizados a qualquer momento, sem limite de horário ou frequência</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-blue-400 mt-1">•</span>
              <p>É cobrada uma taxa de 10% sobre o valor sacado</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-blue-400 mt-1">•</span>
              <p>Os valores geralmente caem entre 5 a 10 minutos, podendo levar até 24h em casos excepcionais</p>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            🔒 Seus dados estão protegidos com criptografia de ponta a ponta
          </p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawScreen;
