
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, X, User, Loader2, Minimize2 } from 'lucide-react';
import { useHelpAssistant } from '@/hooks/useHelpAssistant';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export function HelpAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant IA pour le système médical DMC. Comment puis-je vous aider aujourd\'hui ?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage: sendAIMessage, isLoading } = useHelpAssistant();

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    try {
      // Appel à la vraie IA OpenAI
      const aiResponseText = await sendAIMessage(currentInput, messages);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Message d'erreur déjà géré par le hook useHelpAssistant
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-scroll vers le bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Réinitialiser la conversation lors de l'ouverture
  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Bouton d'aide flottant */}
      {!isOpen && (
        <Button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl z-50 transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}

      {/* Interface de chat IA - Positionnée en coin */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className={`w-96 ${isMinimized ? 'h-16' : 'h-[500px]'} flex flex-col shadow-2xl border-2 transition-all duration-300`}>
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-blue-50 to-purple-50 p-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold">Assistant IA DMC</span>
                <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">
                  ●
                </span>
              </CardTitle>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMinimize}
                  className="h-8 w-8"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClose}
                  className="h-8 w-8"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            
            {/* Contenu du chat - caché si minimisé */}
            {!isMinimized && (
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Zone de messages avec scroll amélioré */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[350px]">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl p-2.5 shadow-sm ${
                          message.isBot
                            ? 'bg-blue-50 text-blue-900 border border-blue-100'
                            : 'bg-gray-100 text-gray-900 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.isBot && <Bot className="h-3 w-3 mt-1 text-blue-500" />}
                          {!message.isBot && <User className="h-3 w-3 mt-1 text-gray-500" />}
                          <div className="flex-1">
                            <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.text}</p>
                            <span className="text-xs opacity-50 mt-1 block">
                              {message.timestamp.toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Indicateur de frappe */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Bot className="h-3 w-3 text-blue-500" />
                          <div className="flex items-center space-x-1">
                            <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                            <span className="text-xs text-blue-600">L'IA réfléchit...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Élément pour forcer le scroll vers le bas */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Zone de saisie */}
                <div className="border-t bg-gray-50 p-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Posez votre question..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="flex-1 text-sm h-9"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!inputValue.trim() || isLoading}
                      className="bg-blue-600 hover:bg-blue-700 h-9 w-9 p-0"
                      size="icon"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Entrée pour envoyer
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
