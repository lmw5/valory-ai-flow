
import React, { useState } from 'react';
import LandingPage from '../components/LandingPage';
import LoginScreen from '../components/LoginScreen';
import Dashboard from '../components/Dashboard';
import TasksScreen from '../components/TasksScreen';
import WithdrawScreen from '../components/WithdrawScreen';
import HelpScreen from '../components/HelpScreen';
import BottomNavigation from '../components/BottomNavigation';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(50.00); // Initial R$50 bonus
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalEarned, setTotalEarned] = useState(50.00); // Initial R$50 bonus

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentScreen('dashboard');
  };

  const handleTaskComplete = (earnings) => {
    // Update balance with earnings
    setBalance(prev => prev + earnings);
    // Increment completed tasks counter
    setCompletedTasks(prev => prev + 1);
    // Add earnings to total earned (cumulative)
    setTotalEarned(prev => prev + earnings);
    // Return to dashboard
    setCurrentScreen('dashboard');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingPage 
          onSignIn={() => setCurrentScreen('login')}
          onSignUp={() => setCurrentScreen('login')} // For now, both redirect to login
        />;
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'dashboard':
        return <Dashboard 
          user={user} 
          balance={balance} 
          completedTasks={completedTasks}
          totalEarned={totalEarned}
          onNavigate={setCurrentScreen} 
        />;
      case 'tasks':
        return <TasksScreen onTaskComplete={handleTaskComplete} />;
      case 'withdraw':
        return <WithdrawScreen balance={balance} />;
      case 'help':
        return <HelpScreen />;
      default:
        return <LandingPage 
          onSignIn={() => setCurrentScreen('login')}
          onSignUp={() => setCurrentScreen('login')}
        />;
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
