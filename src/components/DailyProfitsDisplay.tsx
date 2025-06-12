
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Calendar, Clock, Coins } from 'lucide-react';
import { useDailyProfits } from '@/hooks/useDailyProfits';

const DailyProfitsDisplay = () => {
  const { dailyProfits, todaysProfits, loading, triggerManualCalculation } = useDailyProfits();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-800/50 rounded-2xl h-20"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Today's Profits Summary */}
      <Card className="bg-gradient-to-r from-green-800/50 to-green-700/50 border border-green-600/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-green-300 text-sm font-medium">
                Rendimento de Hoje
              </p>
              <p className="text-white text-xl font-light">
                {formatCurrency(todaysProfits)}
              </p>
              <p className="text-green-200 text-xs">
                {dailyProfits.filter(p => p.earned_at.startsWith(new Date().toISOString().split('T')[0])).length} pagamentos recebidos
              </p>
            </div>
            <div className="bg-green-700/50 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Daily Profits */}
      {dailyProfits.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-gray-300 text-sm font-medium">Últimos Rendimentos</h4>
            <div className="flex items-center text-xs text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              <span>Atualizações automáticas</span>
            </div>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {dailyProfits.slice(0, 8).map((profit) => (
              <div 
                key={profit.id}
                className="bg-gray-800/30 rounded-lg p-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <p className="text-white text-sm font-medium truncate">
                      {profit.achievement_name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-gray-400 text-xs">
                      {formatDate(profit.earned_at)} às {formatTime(profit.earned_at)}
                    </p>
                  </div>
                </div>
                <div className="text-green-400 text-sm font-medium ml-2">
                  +{formatCurrency(profit.value)}
                </div>
              </div>
            ))}
          </div>
          
          {dailyProfits.length === 0 && (
            <div className="text-center py-6">
              <Calendar className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">
                Nenhum rendimento registrado ainda
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Os rendimentos aparecem automaticamente após investir
              </p>
            </div>
          )}
        </div>
      )}

      {/* Manual Trigger Button for Testing */}
      <div className="pt-2 border-t border-gray-700/30">
        <button
          onClick={triggerManualCalculation}
          className="w-full text-xs text-gray-400 hover:text-gray-300 transition-colors py-2 hover:bg-gray-800/30 rounded-lg"
        >
          🔄 Processar rendimentos pendentes
        </button>
        <p className="text-xs text-gray-500 text-center mt-1">
          Os rendimentos são processados automaticamente às 00:00
        </p>
      </div>
    </div>
  );
};

export default DailyProfitsDisplay;
