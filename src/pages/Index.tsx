
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserSession } from '@/hooks/useUserSession';
import AuthScreen from '../components/AuthScreen';
import LandingPage from '../components/LandingPage';
import Dashboard from '../components/Dashboard';
import InvestmentsScreen from '../components/InvestmentsScreen';
import DepositScreen from '../components/DepositScreen';
import WithdrawScreen from '../components/WithdrawScreen';
import HelpScreen from '../components/HelpScreen';
import PlanDetailsScreen from '../components/PlanDetailsScreen';
import BottomNavigation from '../components/BottomNavigation';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { session, profile, completedTasks, loading: sessionLoading, updateBalance, addAchievement } = useUserSession();
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedPlan, setSelectedPlan] = useState(null);
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

  const handleNavigate = (screen: string, data?: any) => {
    if (screen === 'plan-details' && data) {
      setSelectedPlan(data);
      setCurrentScreen('plan-details');
    } else {
      setCurrentScreen(screen);
      setSelectedPlan(null);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard 
          user={profile} 
          balance={session?.balance || 0} 
          completedTasks={completedTasks}
          totalEarned={session?.total_earned || 0}
          onNavigate={handleNavigate} 
        />;
      case 'investments':
        return <InvestmentsScreen onNavigate={handleNavigate} />;
      case 'deposit':
        return <DepositScreen onNavigate={handleNavigate} />;
      case 'withdraw':
        return <WithdrawScreen 
          balance={session?.balance || 0} 
          onNavigate={handleNavigate} 
        />;
      case 'help':
        return <HelpScreen />;
      case 'plan-details':
        return selectedPlan ? (
          <PlanDetailsScreen 
            plan={selectedPlan}
            balance={session?.balance || 0}
            onNavigate={handleNavigate}
          />
        ) : (
          <Dashboard 
            user={profile} 
            balance={session?.balance || 0} 
            completedTasks={completedTasks}
            totalEarned={session?.total_earned || 0}
            onNavigate={handleNavigate} 
          />
        );
      default:
        return <Dashboard 
          user={profile} 
          balance={session?.balance || 0} 
          completedTasks={completedTasks}
          totalEarned={session?.total_earned || 0}
          onNavigate={handleNavigate} 
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {renderScreen()}
      <BottomNavigation 
        currentScreen={currentScreen} 
        onNavigate={handleNavigate} 
      />
    </div>
  );
};

export default Index;
