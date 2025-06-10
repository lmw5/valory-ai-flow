
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

const TaskExecutionModal = ({ task, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Iniciando tarefa...');
  const [isComplete, setIsComplete] = useState(false);

  const messages = [
    'Iniciando tarefa...',
    'Conectando com a IA...',
    'Executando tarefa...',
    'IA processando...',
    'Finalizando processo...'
  ];

  useEffect(() => {
    const totalDuration = (task.timeMin + task.timeMax) / 2 * 1000; // Convert to milliseconds
    const interval = totalDuration / 100;
    let currentProgress = 0;
    let messageIndex = 0;

    const timer = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);

      // Update message based on progress
      const newMessageIndex = Math.floor((currentProgress / 100) * messages.length);
      if (newMessageIndex !== messageIndex && newMessageIndex < messages.length) {
        messageIndex = newMessageIndex;
        setCurrentMessage(messages[messageIndex]);
      }

      if (currentProgress >= 100) {
        clearInterval(timer);
        setCurrentMessage('Tarefa concluída!');
        setIsComplete(true);
        
        // Calculate earnings
        const earnings = Math.floor(Math.random() * (task.returnMax - task.returnMin + 1)) + task.returnMin;
        
        setTimeout(() => {
          onComplete(earnings);
        }, 2000);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [task, onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="w-full max-w-md mx-6 text-center space-y-8">
        {/* Task Icon */}
        <div className="text-6xl mb-6">
          {task.icon}
        </div>

        {/* Task Title */}
        <h2 className="text-2xl font-light text-white">
          {task.title}
        </h2>

        {/* Progress Bar */}
        <div className="space-y-4">
          <Progress 
            value={progress} 
            className="h-2 bg-gray-800"
          />
          <p className="text-lg text-gray-300">
            {progress}%
          </p>
        </div>

        {/* Current Message */}
        <div className="space-y-2">
          <p className="text-blue-400 text-lg font-medium">
            {currentMessage}
          </p>
          
          {isComplete && (
            <div className="animate-fade-in">
              <p className="text-green-400 text-xl font-medium">
                +R$ {Math.floor(Math.random() * (task.returnMax - task.returnMin + 1)) + task.returnMin} creditado
              </p>
            </div>
          )}
        </div>

        {/* Loading Animation */}
        {!isComplete && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskExecutionModal;
