
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import TaskExecutionModal from './TaskExecutionModal';

const TasksScreen = ({ onTaskComplete }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const tasks = [
    {
      id: 1,
      title: 'Microanálise de Dados',
      description: 'Ao ativar essa tarefa, seu dispositivo ajuda a processar pequenos lotes de dados em tempo real. A IA usa sua conexão para validar padrões e testar variações.',
      cost: 10,
      returnMin: 50,
      returnMax: 85,
      timeMin: 0.5,
      timeMax: 0.5,
      icon: '🔍'
    },
    {
      id: 2,
      title: 'Validação de Anúncios Publicitários',
      description: 'Seu dispositivo simula visualizações reais de anúncios, permitindo que empresas testem campanhas com dados reais antes de colocá-las no ar.',
      cost: 15,
      returnMin: 60,
      returnMax: 105,
      timeMin: 0.75,
      timeMax: 0.75,
      icon: '📢'
    },
    {
      id: 3,
      title: 'Previsão de Comportamento com IA',
      description: 'Conectando-se à rede Valory X, seu celular contribui com dados anônimos que ajudam a IA a prever como pessoas interagem com conteúdos digitais.',
      cost: 20,
      returnMin: 80,
      returnMax: 140,
      timeMin: 0.83,
      timeMax: 0.83,
      icon: '🤖'
    },
    {
      id: 4,
      title: 'Análise de Palavras-chave Comerciais',
      description: 'A rede usa seu dispositivo para identificar termos e palavras mais buscados online. Isso ajuda a IA a mapear interesses do público.',
      cost: 35,
      returnMin: 110,
      returnMax: 150,
      timeMin: 1,
      timeMax: 1,
      icon: '🔎'
    },
    {
      id: 5,
      title: 'Limpeza e Correção de Dados',
      description: 'Enquanto estiver conectado, seu aparelho ajuda a IA a corrigir erros, duplicações e falhas em conjuntos de dados.',
      cost: 16,
      returnMin: 84,
      returnMax: 122,
      timeMin: 1,
      timeMax: 1,
      icon: '🧹'
    },
    {
      id: 6,
      title: 'Mapeamento de Tendências de Mercado',
      description: 'Seu celular analisa em tempo real como o público reage a novos produtos e ideias. Isso permite à IA detectar tendências emergentes.',
      cost: 50,
      returnMin: 205,
      returnMax: 340,
      timeMin: 1.17,
      timeMax: 1.17,
      icon: '📈'
    }
  ];

  const handleTaskActivation = (task) => {
    setSelectedTask(task);
    setIsExecuting(true);
  };

  const handleTaskComplete = (earnings) => {
    setIsExecuting(false);
    setSelectedTask(null);
    onTaskComplete(earnings);
  };

  if (isExecuting && selectedTask) {
    return (
      <TaskExecutionModal 
        task={selectedTask} 
        onComplete={handleTaskComplete}
      />
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-8 px-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light text-white mb-2">
            Escolha sua tarefa
          </h2>
          <p className="text-gray-400 text-sm">
            Selecione uma tarefa para a IA executar
          </p>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div 
              key={task.id}
              className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-2xl p-6 backdrop-blur-sm border border-gray-600/30 hover:border-green-500/30 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{task.icon}</div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-white font-medium text-lg">
                    {task.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {task.description}
                  </p>
                  
                  {/* Task Stats */}
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center">
                      <p className="text-red-400 font-medium">R$ {task.cost}</p>
                      <p className="text-gray-500">Custo</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-400 font-medium">
                        R$ {task.returnMin}-{task.returnMax}
                      </p>
                      <p className="text-gray-500">Retorno</p>
                    </div>
                    <div className="text-center">
                      <p className="text-blue-400 font-medium">
                        {task.timeMin === task.timeMax ? 
                          (task.timeMin < 1 ? 
                            `${Math.round(task.timeMin * 60)}seg` : 
                            task.timeMin === 1 ? 
                              '1min' : 
                              `${Math.floor(task.timeMin)}min ${Math.round((task.timeMin % 1) * 60)}seg`
                          ) :
                          `${task.timeMin}-${task.timeMax}min`
                        }
                      </p>
                      <p className="text-gray-500">Tempo</p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleTaskActivation(task)}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl h-10 transition-all duration-300"
                  >
                    Ativar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasksScreen;
