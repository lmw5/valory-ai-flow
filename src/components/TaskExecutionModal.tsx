
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

const TaskExecutionModal = ({ task, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Tarefa iniciada...');
  const [isComplete, setIsComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [earnings, setEarnings] = useState(0);

  const messages = [
    'Tarefa iniciada...',
    'IA analisando dados...',
    'Processando resultados...',
    'Finalizando...'
  ];

  useEffect(() => {
    // Calculate task duration in seconds (use average of min/max time)
    const taskDurationSeconds = Math.floor((task.timeMin + task.timeMax) / 2 * 60);
    setTimeRemaining(taskDurationSeconds);
    
    // Calculate final earnings
    const finalEarnings = Math.floor(Math.random() * (task.returnMax - task.returnMin + 1)) + task.returnMin;
    setEarnings(finalEarnings);

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // Update progress (0-100%)
        const newProgress = Math.min(100, ((taskDurationSeconds - newTime) / taskDurationSeconds) * 100);
        setProgress(newProgress);

        // Update message based on progress
        const messageIndex = Math.min(
          messages.length - 1,
          Math.floor((newProgress / 100) * messages.length)
        );
        setCurrentMessage(messages[messageIndex]);

        // Check if task is complete
        if (newTime <= 0) {
          clearInterval(interval);
          setProgress(100);
          setCurrentMessage('Tarefa concluída com sucesso!');
          setIsComplete(true);
          
          setTimeout(() => {
            onComplete(finalEarnings);
          }, 3000); // Show success message for 3 seconds
          
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [task, onComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center z-50">
      {/* Background animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-green-400 rounded-full animate-pulse opacity-40 delay-1000"></div>
        <div className="absolute bottom-32 left-32 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse opacity-50 delay-500"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-green-500 rounded-full animate-pulse opacity-70 delay-1500"></div>
        <div className="absolute top-1/2 left-10 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-30 delay-2000"></div>
        <div className="absolute top-1/3 right-10 w-2 h-2 bg-green-300 rounded-full animate-pulse opacity-60 delay-750"></div>
      </div>

      <div className="w-full max-w-lg mx-6 text-center space-y-12 relative z-10">
        {/* Task Icon with rotating ring */}
        <div className="relative flex items-center justify-center">
          {/* Rotating progress ring */}
          <div className="absolute w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                className="text-green-400 drop-shadow-lg transition-all duration-1000 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.5))'
                }}
              />
            </svg>
          </div>
          
          {/* Task Icon */}
          <div className="text-6xl z-10 animate-pulse">
            {task.icon}
          </div>
        </div>

        {/* Task Title */}
        <div className="space-y-2">
          <h2 className="text-3xl font-light text-white">
            {task.title}
          </h2>
          <p className="text-gray-400 text-sm">
            IA executando tarefa automatizada
          </p>
        </div>

        {/* Progress Section */}
        <div className="space-y-6">
          {/* Main Progress Bar */}
          <div className="space-y-3">
            <Progress 
              value={progress} 
              className="h-3 bg-gray-800 border border-gray-700"
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">{progress.toFixed(1)}%</span>
              <span className="text-gray-400">
                {!isComplete && `${formatTime(timeRemaining)} restante`}
              </span>
            </div>
          </div>

          {/* Status Message */}
          <div className="space-y-4">
            <div className="min-h-[3rem] flex items-center justify-center">
              <p className="text-xl text-blue-400 font-medium transition-all duration-500">
                {currentMessage}
              </p>
            </div>
            
            {isComplete && (
              <div className="animate-fade-in space-y-2">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                  <div className="text-3xl">✅</div>
                </div>
                <p className="text-2xl text-green-400 font-medium">
                  +R$ {earnings.toFixed(2).replace('.', ',')} creditado
                </p>
                <p className="text-gray-400 text-sm">
                  Retornando ao painel...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Processing Animation - only show when not complete */}
        {!isComplete && (
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-400"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskExecutionModal;
