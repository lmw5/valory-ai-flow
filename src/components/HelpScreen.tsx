
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const HelpScreen = () => {
  const faqs = [
    {
      question: "O que é o Valory X?",
      answer: "O Valory X é uma plataforma que conecta seu dispositivo a uma rede inteligente de inteligência artificial. Ao ativar um plano, seu celular passa a colaborar com essa rede e você recebe ganhos diários de forma automática."
    },
    {
      question: "Preciso fazer alguma tarefa manual?",
      answer: "Não. Tudo é feito de forma automática após a ativação do plano. A IA utiliza seu dispositivo conectado para executar tarefas digitais em segundo plano — você só precisa acompanhar seus ganhos pelo app."
    },
    {
      question: "Quanto posso ganhar por dia?",
      answer: "Seu rendimento diário depende do plano contratado. Cada plano informa claramente quanto você receberá por dia e qual será o total ao final da validade."
    },
    {
      question: "Posso contratar mais de um plano?",
      answer: "Sim! Você pode contratar múltiplos planos e seus rendimentos serão somados automaticamente."
    },
    {
      question: "Quando começo a ganhar?",
      answer: "Assim que você ativa um plano, o sistema inicia o rastreio e a geração dos rendimentos automaticamente. Você pode ver os ganhos acumulando em tempo real na aba \"Investimentos\"."
    },
    {
      question: "Onde vejo meus investimentos?",
      answer: "Acesse a aba \"Investimentos\" no menu inferior. Lá você verá quantos planos ativos possui, seu ganho diário e o total acumulado até agora."
    },
    {
      question: "Existe valor mínimo para começar?",
      answer: "Sim. O plano de entrada mais acessível atualmente custa R$250,00. Esse valor é usado para ativar sua conexão com a rede de IA."
    },
    {
      question: "Preciso pagar mensalidade?",
      answer: "Não. O pagamento do plano é único, válido pelo período de dias definido (ex: 30, 40 ou 60 dias). Após esse prazo, o plano é finalizado e você pode contratar outro se quiser."
    },
    {
      question: "Os valores realmente são pagos?",
      answer: "Sim! Os ganhos gerados pelo seu plano são reais e ficam disponíveis no seu saldo interno. Quando o sistema liberar saques (ou novas funcionalidades de uso do saldo), você poderá utilizá-lo conforme as regras da plataforma."
    },
    {
      question: "E se eu não ativar nenhum plano?",
      answer: "Você poderá acessar o app, mas não ganhará rendimentos. A ativação de um plano é essencial para se conectar à rede e começar a lucrar."
    }
  ];

  const handleSupportClick = () => {
    window.open('https://wa.me/5517981693677', '_blank');
  };

  return (
    <div className="min-h-screen pb-20 pt-8 px-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light text-white mb-2">
            Central de Ajuda
          </h2>
          <p className="text-gray-400 text-sm">
            Encontre respostas para suas dúvidas
          </p>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-blue-600/20 to-green-500/20 rounded-2xl p-6 backdrop-blur-sm border border-blue-500/30 mb-6">
          <div className="text-center space-y-3">
            <div className="text-3xl">💬</div>
            <h3 className="text-white font-medium">Suporte 24/7</h3>
            <p className="text-gray-300 text-sm">
              Nossa equipe está sempre disponível para ajudar
            </p>
            <button 
              onClick={handleSupportClick}
              className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
            >
              Falar com suporte →
            </button>
          </div>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700/50 overflow-hidden"
            >
              <AccordionTrigger className="px-6 py-4 text-left text-white hover:no-underline hover:bg-gray-700/30 transition-colors">
                <span className="text-sm font-medium">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* App Info */}
        <div className="text-center space-y-2 mt-8 pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-xs">Valory X v1.0</p>
          <p className="text-gray-500 text-xs">Renda automatizada com IA</p>
        </div>
      </div>
    </div>
  );
};

export default HelpScreen;
