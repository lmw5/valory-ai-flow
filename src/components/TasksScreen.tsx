
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
      description: 'Ajude a IA a identificar padrões de consumo em grandes volumes de dados.',
      cost: 10,
      returnMin: 30,
      returnMax: 50,
      timeMin: 2,
      timeMax: 4,
      icon: '🔍'
    },
    {
      id: 2,
      title: 'Validação de Anúncios',
      description: 'Simule visualizações para que marcas testem campanhas publicitárias.',
      cost: 20,
      returnMin: 60,
      returnMax: 90,
      timeMin: 3,
      timeMax: 6,
      icon: '📢'
    },
    {
      id: 3,
      title: 'Previsão de Consumo com IA',
      description: 'Contribua com o treinamento de modelos que analisam comportamento digital.',
      cost: 20,
      returnMin: 55,
      returnMax: 80,
      timeMin: 5,
      timeMax: 8,
      icon: '🤖'
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
                        {task.timeMin}-{task.timeMax}min
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
