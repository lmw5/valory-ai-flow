
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      } else {
        if (!name.trim()) {
          setError('Nome é obrigatório');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, name);
        if (error) {
          setError(error.message);
        } else {
          setError('Verifique seu email para confirmar a conta');
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Logo centralizada no topo */}
      <div className="w-full text-center mb-8">
        <img 
          src="/lovable-uploads/1f64d410-38da-465b-8d6e-6f4a48bf670d.png" 
          alt="Valory X" 
          className="h-16 w-auto mx-auto"
        />
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-light text-white">
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </h2>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <Input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 bg-gray-800/50 border-gray-700 rounded-xl text-white placeholder-gray-400 text-lg backdrop-blur-sm"
                required={!isLogin}
              />
            )}
            
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 bg-gray-800/50 border-gray-700 rounded-xl text-white placeholder-gray-400 text-lg backdrop-blur-sm"
              required
            />
            
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 bg-gray-800/50 border-gray-700 rounded-xl text-white placeholder-gray-400 text-lg backdrop-blur-sm"
              required
              minLength={6}
            />
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </Button>
        </form>

        {/* Toggle between login/signup */}
        <div className="text-center space-y-4">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            {isLogin ? 'Não tem conta? Criar uma agora' : 'Já tem conta? Fazer login'}
          </button>
          
          {/* Bonus Message - only show on signup */}
          {!isLogin && (
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-4 backdrop-blur-sm border border-green-500/30">
              <p className="text-green-400 text-sm font-medium">
                🎉 Ganhe R$50 de bônus ao criar sua conta
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
