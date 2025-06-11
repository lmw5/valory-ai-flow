
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';
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
          <h4 className="text-gray-300 text-sm font-medium">Últimos Rendimentos</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {dailyProfits.slice(0, 5).map((profit) => (
              <div 
                key={profit.id}
                className="bg-gray-800/30 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">
                    {profit.achievement_name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {formatDate(profit.earned_at)}
                  </p>
                </div>
                <div className="text-green-400 text-sm font-medium">
                  +{formatCurrency(profit.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Trigger Button (for testing) */}
      <button
        onClick={triggerManualCalculation}
        className="w-full text-xs text-gray-400 hover:text-gray-300 transition-colors py-2"
      >
        🔄 Calcular rendimentos manualmente
      </button>
    </div>
  );
};

export default DailyProfitsDisplay;
