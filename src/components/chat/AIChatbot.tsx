import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFinance } from '@/contexts/FinanceContext';
import { useUser } from '@/contexts/UserContext';
import { formatINR } from '@/lib/utils';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Groq from 'groq-sdk';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your PocketKash assistant. Ask me anything about your finances, spending patterns, or saving tips!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { transactions, getSummary } = useFinance();
  const { user } = useUser();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = async (question: string): Promise<string> => {
    const summary = getSummary();

    // Today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayExpenses = transactions.filter(t => {
      const transDate = new Date(t.date);
      transDate.setHours(0, 0, 0, 0);
      return transDate.getTime() === today.getTime() && t.type === 'expense';
    });
    const spentToday = todayExpenses.reduce((sum, t) => sum + t.amount, 0);
    const remainingToday = (user?.dailyLimit || 0) - spentToday;

    // Spending analysis
    const impulseSpending = transactions.filter(t => t.emotionTag === 'impulse').reduce((sum, t) => sum + t.amount, 0);
    const stressSpending = transactions.filter(t => t.emotionTag === 'stress').reduce((sum, t) => sum + t.amount, 0);

    // Top category
    const topCategory = Object.entries(summary.categoryBreakdown).sort(([, a], [, b]) => b - a)[0];

    try {
      // Build context for Groq API
      const context = `
User: ${user?.name || 'User'}
Question: ${question}

Financial Data:
- Total Expenses: ${formatINR(summary.totalExpenses)}
- Total Income: ${formatINR(summary.totalIncome)}
- Balance: ${formatINR(summary.balance)}
- Spending Today: ${formatINR(spentToday)}
- Daily Limit: ${formatINR(user?.dailyLimit || 0)}
- Remaining Today: ${formatINR(remainingToday)}
- Spending Behavior Type: ${summary.behaviourType}
- Impulse Spending: ${formatINR(impulseSpending)}
- Stress Spending: ${formatINR(stressSpending)}
- Top Category: ${topCategory ? `${topCategory[0]} (${formatINR(topCategory[1])})` : 'N/A'}
- Category Breakdown: ${Object.entries(summary.categoryBreakdown).map(([cat, amt]) => `${cat}: ${formatINR(amt)}`).join(', ')}
- Recent Transactions: ${transactions.slice(-5).map(t => `${t.category}: ${formatINR(t.amount)} (${t.emotionTag || 'normal'})`).join(', ')}`;

      const groq = new Groq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are PocketKash AI, a friendly and helpful financial assistant for an expense tracking app. Answer user questions about their finances using the provided data. Be conversational, supportive, and provide actionable advice. Keep responses concise (2-4 sentences unless more detail is needed). Use the INR amounts provided in the context. If greeting, be warm and personal."
          },
          {
            role: "user",
            content: context
          }
        ],
        temperature: 0.8,
        max_completion_tokens: 400,
        top_p: 1
      });

      return completion.choices[0]?.message?.content || "I'm having trouble generating a response. Please try again!";
    } catch (error) {
      console.error('Groq API error:', error);
      return "I'm having trouble connecting to the AI service. Please check your internet connection and try again.";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Get AI response
    try {
      const response = await generateResponse(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again!",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-20 md:bottom-6 right-4 z-50"
          >
            <Button
              size="lg"
              className="rounded-full h-14 w-14 shadow-lg"
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 md:bottom-6 right-4 z-50 w-[calc(100%-2rem)] max-w-sm"
          >
            <Card className="shadow-2xl border-primary/20">
              <CardHeader className="pb-2 bg-primary/5 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    PocketKash AI
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Messages */}
                <ScrollArea className="h-80 p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg p-3 text-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      placeholder="Ask about your spending..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
