
import React, { useState } from 'react';
import LoginScreen from '../components/LoginScreen';
import Dashboard from '../components/Dashboard';
import TasksScreen from '../components/TasksScreen';
import WithdrawScreen from '../components/WithdrawScreen';
import HelpScreen from '../components/HelpScreen';
import BottomNavigation from '../components/BottomNavigation';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(125.50);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentScreen('dashboard');
  };

  const handleTaskComplete = (earnings) => {
    setBalance(prev => prev + earnings);
    setCurrentScreen('dashboard');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'dashboard':
        return <Dashboard user={user} balance={balance} onNavigate={setCurrentScreen} />;
      case 'tasks':
        return <TasksScreen onTaskComplete={handleTaskComplete} />;
      case 'withdraw':
        return <WithdrawScreen balance={balance} />;
      case 'help':
        return <HelpScreen />;
      default:
        return <Dashboard user={user} balance={balance} onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {renderScreen()}
      {user && (
        <BottomNavigation 
          currentScreen={currentScreen} 
          onNavigate={setCurrentScreen} 
        />
      )}
    </div>
  );
};

export default Index;
