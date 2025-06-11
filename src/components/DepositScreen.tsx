
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const DepositScreen = ({ onNavigate }) => {
  const [selectedValue, setSelectedValue] = useState(null);

  const quickValues = [
    200, 250, 300, 450,
    500, 700, 1000, 1500
  ];

  const handleValueSelect = (value) => {
    setSelectedValue(value);
  };

  const handleMakePix = () => {
    if (selectedValue) {
      console.log(`Fazendo Pix de R$ ${selectedValue}`);
      // Aqui seria redirecionado para a geração do QR Code ou link de pagamento
    }
  };

  return (
    <div className="min-h-screen pb-20 pt-8 px-6 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="max-w-md mx-auto space-y-8">
        {/* Logo centralizada no topo */}
        <div className="w-full text-center">
          <img 
            src="/lovable-uploads/1f64d410-38da-465b-8d6e-6f4a48bf670d.png" 
            alt="Valory X" 
            className="h-12 w-auto mx-auto mb-6"
          />
        </div>

        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 hover:bg-gray-700/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <h1 className="text-2xl font-light text-white text-center flex-1">
            Depósito via Pix
          </h1>
          {/* Invisible spacer to balance the layout */}
          <div className="w-10 h-10"></div>
        </div>

        {/* Description section without the V icon */}
        <div className="text-center space-y-4">
          <p className="text-gray-300 text-center leading-relaxed px-4">
            Escolha um valor e gere seu depósito Pix de forma rápida e segura
          </p>
        </div>

        {/* Value input field (read-only) */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={selectedValue ? `R$ ${selectedValue.toFixed(2).replace('.', ',')}` : ''}
              placeholder="Insira o valor desejado"
              readOnly
              className="w-full h-16 bg-gray-800/80 border-2 border-blue-500/30 rounded-2xl px-6 text-white text-center text-lg font-medium placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Quick values grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-200 text-center">Valores rápidos</h3>
          <div className="grid grid-cols-4 gap-3">
            {quickValues.map((value) => (
              <button
                key={value}
                onClick={() => handleValueSelect(value)}
                className={`
                  h-14 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105
                  ${selectedValue === value 
                    ? 'bg-blue-500 text-white border-2 border-blue-300 shadow-lg shadow-blue-500/25' 
                    : 'bg-blue-600 text-white hover:bg-blue-500 border border-blue-500/30'
                  }
                `}
              >
                R$ {value}
              </button>
            ))}
          </div>
        </div>

        {/* Make Pix button */}
        <div className="pt-6">
          <Button
            onClick={handleMakePix}
            disabled={!selectedValue}
            className={`
              w-full h-16 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 transform
              ${selectedValue 
                ? 'bg-blue-700 hover:bg-blue-600 text-white hover:scale-[1.02] shadow-blue-700/25' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Fazer Pix
          </Button>
        </div>

        {/* Security note */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Seus dados estão protegidos com criptografia de ponta a ponta
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepositScreen;
