
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    onLogin({ name: 'João', email });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light tracking-wide text-white mb-2">
            Valory <span className="text-green-400 font-medium">X</span>
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
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
            />
          </div>

          <Button 
            type="submit"
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Entrar
          </Button>
        </form>

        {/* Create Account Link */}
        <div className="text-center space-y-4">
          <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
            Criar conta
          </a>
          
          {/* Bonus Message */}
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-4 backdrop-blur-sm border border-green-500/30">
            <p className="text-green-400 text-sm font-medium">
              🎉 Ganhe R$50 de bônus ao criar sua conta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
