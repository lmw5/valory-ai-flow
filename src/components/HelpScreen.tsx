
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const HelpScreen = () => {
  const faqs = [
    {
      question: "Como as tarefas geram dinheiro?",
      answer: "As tarefas são executadas por nossa IA avançada que processa dados para empresas parceiras. O valor é gerado através da análise de padrões, validação de campanhas e otimização de algoritmos que têm valor comercial real."
    },
    {
      question: "De onde vem o valor do saldo?",
      answer: "O saldo é creditado automaticamente após a conclusão bem-sucedida de cada tarefa. Os valores são pagos pelas empresas que utilizam os resultados das análises realizadas pela nossa inteligência artificial."
    },
    {
      question: "O que é necessário para sacar?",
      answer: "Você precisa atingir o saque mínimo de R$250 e realizar a ativação da sua conta. Após isso, o botão de saque será liberado e você poderá solicitar o valor disponível de forma simples e segura."
    },
    {
      question: "Quanto tempo demora para executar uma tarefa?",
      answer: "As tarefas têm duração variável entre 2 a 8 minutos, dependendo da complexidade. O tempo é determinado automaticamente pela IA baseado no volume de dados a ser processado."
    },
    {
      question: "É seguro investir nas tarefas?",
      answer: "Sim, todas as tarefas são executadas em ambiente seguro e criptografado. Nossa plataforma utiliza tecnologia blockchain para garantir transparência e segurança em todas as transações."
    },
    {
      question: "Posso executar várias tarefas por dia?",
      answer: "Sim, você pode executar quantas tarefas desejar, desde que tenha saldo suficiente para cobrir os custos. Recomendamos começar com tarefas menores para conhecer o sistema."
    },
    {
      question: "Como funciona o sistema de IA?",
      answer: "Nossa IA utiliza algoritmos de machine learning para processar grandes volumes de dados de forma automatizada. Ela identifica padrões, valida informações e gera insights valiosos para nossos parceiros comerciais."
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
