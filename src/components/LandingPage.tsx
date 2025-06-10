
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Star } from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

const LandingPage = ({ onSignIn, onSignUp }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg"></div>
            <h1 className="text-2xl font-light tracking-wide">
              Valory <span className="text-green-400 font-medium">X</span>
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Recursos
            </a>
            <a href="#security" className="text-gray-300 hover:text-white transition-colors">
              Segurança
            </a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">
              Sobre
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <h2 className="text-5xl md:text-7xl font-extralight leading-tight mb-8">
              O futuro dos
              <br />
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent font-light">
                ganhos digitais
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed mb-12 max-w-3xl mx-auto">
              Descubra uma nova forma de ganhar dinheiro online com tecnologia de ponta e segurança incomparável
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in">
            <Button 
              onClick={onSignUp}
              className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={onSignIn}
              variant="outline"
              className="w-full sm:w-auto h-14 px-8 border-gray-600 text-white hover:bg-gray-800/50 rounded-xl text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              Fazer Login
            </Button>
          </div>

          {/* Bonus Badge */}
          <div className="inline-flex items-center bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full px-6 py-3 backdrop-blur-sm border border-green-500/30 animate-fade-in">
            <Star className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-400 font-medium">
              Ganhe R$50 de bônus ao se cadastrar
            </span>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-2xl -z-10"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-light text-center mb-16">
            Tecnologia que <span className="text-green-400">transforma</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all duration-300">
                <Zap className="h-8 w-8 text-blue-400" />
              </div>
              <h4 className="text-xl font-medium mb-4">Execução Rápida</h4>
              <p className="text-gray-400 leading-relaxed">
                Tarefas processadas instantaneamente com nossa infraestrutura otimizada
              </p>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-green-500/30 group-hover:to-green-600/30 transition-all duration-300">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <h4 className="text-xl font-medium mb-4">Segurança Total</h4>
              <p className="text-gray-400 leading-relaxed">
                Seus dados e ganhos protegidos com criptografia de nível bancário
              </p>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-all duration-300">
                <Star className="h-8 w-8 text-purple-400" />
              </div>
              <h4 className="text-xl font-medium mb-4">Resultados Garantidos</h4>
              <p className="text-gray-400 leading-relaxed">
                Sistema comprovado com milhares de usuários satisfeitos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl md:text-5xl font-light text-green-400 mb-2">R$2.5M+</div>
              <div className="text-gray-400">Pagos aos usuários</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-light text-blue-400 mb-2">50K+</div>
              <div className="text-gray-400">Usuários ativos</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-light text-purple-400 mb-2">99.9%</div>
              <div className="text-gray-400">Uptime garantido</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-md"></div>
            <span className="text-lg font-light">
              Valory <span className="text-green-400 font-medium">X</span>
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 Valory X. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
