import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserSession } from '@/hooks/useUserSession';
import AuthScreen from '../components/AuthScreen';
import LandingPage from '../components/LandingPage';
import Dashboard from '../components/Dashboard';
import TasksScreen from '../components/TasksScreen';
import WithdrawScreen from '../components/WithdrawScreen';
import DepositScreen from '../components/DepositScreen';
import HelpScreen from '../components/HelpScreen';
import BottomNavigation from '../components/BottomNavigation';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { session, profile, completedTasks, loading: sessionLoading, updateBalance, addAchievement } = useUserSession();
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [showLanding, setShowLanding] = useState(!user);

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  // Show landing page if not authenticated and user hasn't clicked to sign in
  if (!user && showLanding) {
    return <LandingPage 
      onSignIn={() => setShowLanding(false)}
      onSignUp={() => setShowLanding(false)}
    />;
  }

  // Show auth screen if not authenticated
  if (!user) {
    return <AuthScreen />;
  }

  // Show loading while fetching user session data
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando dados...</div>
      </div>
    );
  }

  const handleTaskComplete = async (earnings: number, taskTitle: string) => {
    if (!session) return;
    
    // Update balance in database
    const newBalance = session.balance + earnings;
    await updateBalance(newBalance);
    
    // Add achievement record
    await addAchievement(taskTitle, earnings);
    
    // Return to dashboard
    setCurrentScreen('dashboard');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard 
          user={profile} 
          balance={session?.balance || 0} 
          completedTasks={completedTasks}
          totalEarned={session?.total_earned || 0}
          onNavigate={setCurrentScreen} 
        />;
      case 'tasks':
        return <TasksScreen onTaskComplete={(earnings) => {
          // We need to get the task title from the TasksScreen component
          // For now, we'll use a generic title
          handleTaskComplete(earnings, 'Tarefa Automatizada');
        }} />;
      case 'withdraw':
        return <WithdrawScreen balance={session?.balance || 0} onNavigate={setCurrentScreen} />;
      case 'deposit':
        return <DepositScreen onNavigate={setCurrentScreen} />;
      case 'help':
        return <HelpScreen />;
      default:
        return <Dashboard 
          user={profile} 
          balance={session?.balance || 0} 
          completedTasks={completedTasks}
          totalEarned={session?.total_earned || 0}
          onNavigate={setCurrentScreen} 
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {renderScreen()}
      <BottomNavigation 
        currentScreen={currentScreen} 
        onNavigate={setCurrentScreen} 
      />
    </div>
  );
};

export default Index;
