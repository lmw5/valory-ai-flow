import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Star, Users, TrendingUp, Smartphone, ChevronDown, Instagram, Youtube, Twitter, Check } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}
const LandingPage = ({
  onSignIn,
  onSignUp
}: LandingPageProps) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };
  const testimonials = [{
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    name: "Carlos Silva",
    comment: "Em 2 semanas já consegui mais de R$800 só deixando o app funcionando. Incrível!",
    rating: 5
  }, {
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    name: "Ana Costa",
    comment: "Finalmente encontrei uma forma segura de ganhar dinheiro online. Super recomendo!",
    rating: 5
  }, {
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    name: "João Santos",
    comment: "O bônus de R$50 já me ajudou muito. Agora estou ganhando mais a cada dia.",
    rating: 5
  }];
  const team = [{
    name: "Dr. Ricardo Oliveira",
    role: "CEO & Fundador",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face"
  }, {
    name: "Marina Tech",
    role: "CTO",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face"
  }, {
    name: "Paulo Ferreira",
    role: "Head de IA",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
  }];
  const faqs = [{
    question: "O Valory X é gratuito?",
    answer: "Sim! O cadastro é completamente gratuito e você ainda ganha R$50 de bônus só por se inscrever."
  }, {
    question: "De onde vem o dinheiro que eu recebo?",
    answer: "Os ganhos vêm de tarefas automatizadas de processamento de dados executadas pela nossa IA, gerando valor real no mercado."
  }, {
    question: "Posso usar em qualquer celular?",
    answer: "Sim! O Valory X funciona em qualquer smartphone com internet, Android ou iOS."
  }, {
    question: "Quanto posso ganhar por dia?",
    answer: "Os ganhos variam de R$20 a R$200 por dia, dependendo da sua atividade e tarefas disponíveis."
  }, {
    question: "Como faço para sacar meu dinheiro?",
    answer: "Você pode sacar via PIX instantaneamente ou transferência bancária a partir de R$25."
  }];
  return <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="relative z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/74d282a0-4426-4471-95c8-a1f0150289e9.png" 
              alt="Valory X" 
              className="h-12 w-auto"
            />
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#services" className="text-gray-300 hover:text-white transition-colors text-sm">
              Serviços
            </a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors text-sm">
              Sobre
            </a>
            <a href="#faq" className="text-gray-300 hover:text-white transition-colors text-sm">
              FAQ
            </a>
          </nav>
        </div>
      </header>

      {/* HEADLINE Section */}
      <section className="relative px-6 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-fade-in">
            <h2 className="text-5xl md:text-7xl font-extralight leading-tight mb-8">
              Ganhe dinheiro
              <br />
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent font-light">
                automaticamente
              </span>
              <br />
              com inteligência artificial
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed mb-12 max-w-4xl mx-auto">
              R$50 de bônus só por se cadastrar. Comece agora mesmo ativando tarefas que a IA executa para você.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-fade-in">
            <Button onClick={onSignUp} className="w-full sm:w-auto h-16 px-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-full text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105">
              Criar Conta
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
            <Button onClick={onSignIn} variant="outline" className="w-full sm:w-auto h-16 px-12 border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 rounded-full text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105">
              Entrar
            </Button>
          </div>

          <div className="inline-flex items-center bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full px-8 py-4 backdrop-blur-sm border border-green-500/20 animate-fade-in">
            <Star className="h-6 w-6 text-green-400 mr-3" />
            <span className="text-green-400 font-medium text-lg">
              Ganhe R$50 de bônus ao se cadastrar
            </span>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-green-500/5 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* PROBLEM Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-gray-900/50 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-light mb-8 text-gray-300">
            O Problema que Você Enfrenta
          </h3>
          <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed">
            Muitas pessoas querem ganhar dinheiro online, mas não sabem por onde começar ou em quem confiar. 
            A maioria das oportunidades são complexas, arriscadas ou simplesmente não funcionam.
          </p>
        </div>
      </section>

      {/* SOLUTION / SERVICES Section */}
      <section id="services" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-light text-center mb-16">
            Nossa <span className="text-green-400">Solução</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group hover:scale-105 transition-all duration-300 bg-gray-900/30 p-8 rounded-3xl backdrop-blur-sm border border-gray-800/50">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all duration-300">
                <Zap className="h-10 w-10 text-blue-400" />
              </div>
              <h4 className="text-2xl font-medium mb-4">Conecte-se à rede Valory X</h4>
              <p className="text-gray-400 leading-relaxed text-lg">Cadastre-se agora e desbloqueie acesso imediato à nossa plataforma inteligente. Milhares já estão lucrando com a força da IA — você será o próximo.</p>
            </div>
            <div className="text-center group hover:scale-105 transition-all duration-300 bg-gray-900/30 p-8 rounded-3xl backdrop-blur-sm border border-gray-800/50">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:from-green-500/30 group-hover:to-green-600/30 transition-all duration-300">
                <Smartphone className="h-10 w-10 text-green-400" />
              </div>
              <h4 className="text-2xl font-medium mb-4">Ative tarefas automatizadas com 1 clique</h4>
              <p className="text-gray-400 leading-relaxed text-lg">Nossa inteligência artificial trabalha por você, 24 horas por dia, realizando tarefas digitais que geram lucro real. Você não precisa ter experiência, só precisa estar conectado.</p>
            </div>
            <div className="text-center group hover:scale-105 transition-all duration-300 bg-gray-900/30 p-8 rounded-3xl backdrop-blur-sm border border-gray-800/50">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-all duration-300">
                <TrendingUp className="h-10 w-10 text-purple-400" />
              </div>
              <h4 className="text-2xl font-medium mb-4">Ganhe em tempo real direto no app</h4>
              <p className="text-gray-400 leading-relaxed text-lg">Assista seus ganhos aumentarem a cada segundo. Todo o processo é transparente, automático e o melhor: você pode sacar quando quiser. Sem enrolação. Sem burocracia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF / PORTFOLIO Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-gray-900/30 to-black">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-light text-center mb-16">
            Resultados <span className="text-blue-400">Comprovados</span>
          </h3>
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              <CarouselItem>
                <div className="bg-gray-900/50 rounded-3xl p-8 backdrop-blur-sm border border-gray-800/50">
                  <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop" alt="Dashboard do app mostrando ganhos" className="w-full h-64 object-cover rounded-2xl mb-6" />
                  <h4 className="text-2xl font-medium mb-4 text-center">Dashboard em Tempo Real</h4>
                  <p className="text-gray-400 text-center">Acompanhe seus ganhos crescendo a cada segundo</p>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="bg-gray-900/50 rounded-3xl p-8 backdrop-blur-sm border border-gray-800/50">
                  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop" alt="Gráfico de crescimento" className="w-full h-64 object-cover rounded-2xl mb-6" />
                  <h4 className="text-2xl font-medium mb-4 text-center">Crescimento Exponencial</h4>
                  <p className="text-gray-400 text-center">Usuários multiplicaram seus ganhos em 30 dias</p>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="bg-gray-900/50 rounded-3xl p-8 backdrop-blur-sm border border-gray-800/50">
                  <img src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=500&fit=crop" alt="Interface do app" className="w-full h-64 object-cover rounded-2xl mb-6" />
                  <h4 className="text-2xl font-medium mb-4 text-center">Interface Intuitiva</h4>
                  <p className="text-gray-400 text-center">Tecnologia simples e poderosa ao seu alcance</p>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* TESTEMUNHOS Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-light text-center mb-16">
            O que nossos <span className="text-green-400">usuários</span> dizem
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => <div key={index} className="bg-gray-900/30 p-8 rounded-3xl backdrop-blur-sm border border-gray-800/50 hover:scale-105 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-16 h-16 rounded-full object-cover mr-4" />
                  <div>
                    <h5 className="text-xl font-medium">{testimonial.name}</h5>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed text-lg">"{testimonial.comment}"</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* ABOUT US Section */}
      <section id="about" className="px-6 py-20 bg-gradient-to-b from-gray-900/30 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-light mb-8">
              Sobre a <span className="text-blue-400">TechCorp</span>
            </h3>
            <p className="text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
              Somos uma empresa de tecnologia focada em democratizar o acesso a oportunidades de renda através da inteligência artificial. 
              Nossa missão é transformar smartphones em ferramentas de geração de valor.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => <div key={index} className="text-center group">
                <img src={member.image} alt={member.name} className="w-48 h-48 rounded-3xl object-cover mx-auto mb-6 group-hover:scale-105 transition-transform duration-300" />
                <h4 className="text-2xl font-medium mb-2">{member.name}</h4>
                <p className="text-gray-400 text-lg">{member.role}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-light text-center mb-16">
            Perguntas <span className="text-green-400">Frequentes</span>
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => <div key={index} className="bg-gray-900/30 rounded-2xl backdrop-blur-sm border border-gray-800/50 overflow-hidden">
                <button onClick={() => toggleFAQ(index)} className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-800/30 transition-colors">
                  <h4 className="text-xl font-medium">{faq.question}</h4>
                  <ChevronDown className={`h-6 w-6 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`} />
                </button>
                {openFAQ === index && <div className="px-6 pb-6 animate-fade-in">
                    <p className="text-gray-300 leading-relaxed text-lg">{faq.answer}</p>
                  </div>}
              </div>)}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION FINAL */}
      <section className="px-6 py-20 bg-gradient-to-b from-gray-900/50 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-light mb-8">
            Transforme seu celular em uma
            <br />
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              fonte de renda passiva
            </span>
          </h3>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Comece com R$50 de bônus e descubra como a inteligência artificial pode trabalhar para você.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button onClick={onSignUp} className="w-full sm:w-auto h-16 px-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-full text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105">
              Criar Conta Agora
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
            <Button onClick={onSignIn} variant="outline" className="w-full sm:w-auto h-16 px-12 border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 rounded-full text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105">
              Entrar
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-16 border-t border-gray-800/50 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src="/lovable-uploads/74d282a0-4426-4471-95c8-a1f0150289e9.png" 
                  alt="Valory X" 
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-400 leading-relaxed">
                Democratizando o acesso a oportunidades de renda através da inteligência artificial.
              </p>
            </div>
            <div>
              <h5 className="text-lg font-medium mb-4">Links</h5>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Termos de Uso</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Política de Privacidade</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Suporte</a>
              </div>
            </div>
            <div>
              <h5 className="text-lg font-medium mb-4">Redes Sociais</h5>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800/50 text-center">
            <p className="text-gray-400">
              © 2024 TechCorp - Valory X. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default LandingPage;
