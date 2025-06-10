// This component has been replaced by AuthScreen.tsx
// Keeping this file to avoid breaking existing imports
import AuthScreen from './AuthScreen';

const LoginScreen = ({ onLogin }) => {
  console.warn('LoginScreen is deprecated. Use AuthScreen instead.');
  return <AuthScreen />;
};

export default LoginScreen;
