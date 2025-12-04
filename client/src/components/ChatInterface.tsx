import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, Sparkles, Brain, Target, Zap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    agent?: string;
    confidence?: number;
    sources?: string[];
  };
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage?: (message: string) => void | Promise<void>;
  isLoading?: boolean;
  agentMode?: 'standard' | 'agentic';
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  agentMode = 'agentic',
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    onSendMessage?.(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-200px)] sm:h-[600px]" data-testid="card-chat-interface">
      <div className="p-3 sm:p-4 border-b bg-gradient-to-r from-primary/5 to-chart-2/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-chart-2">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              {agentMode === 'agentic' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                  <Zap className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">AI Health Coach</h3>
                {agentMode === 'agentic' && (
                  <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700 border-green-500/30 hidden sm:inline-flex">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Agentic
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Powered by plan composer & safety rules
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              Plan-Aware
            </Badge>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="relative mb-4">
                <Brain className="w-12 h-12 text-muted-foreground" />
                <Sparkles className="w-5 h-5 text-primary absolute -top-1 -right-1" />
              </div>
              <h4 className="font-medium text-foreground mb-2">AI-Powered Health Coaching</h4>
              <p className="text-sm text-muted-foreground max-w-sm mb-2">
                I use your plan, safety rules, and health data to provide personalized guidance.
              </p>
              <div className="flex flex-wrap justify-center gap-1 mb-6">
                <Badge variant="secondary" className="text-xs">Plan-Based</Badge>
                <Badge variant="secondary" className="text-xs">Safety-Aware</Badge>
                <Badge variant="secondary" className="text-xs">Evidence-Backed</Badge>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                {[
                  '📊 Analyze my current plan targets',
                  '💪 Suggest exercises based on my preferences',
                  '🍎 What should I eat to hit my protein goal?',
                  '⚠️ Are there any safety concerns for me?',
                ].map((example, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(example.slice(3))}
                    className="text-left justify-start"
                    data-testid={`button-example-${i}`}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              data-testid={`message-${index}`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex-shrink-0">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.metadata?.sources && message.metadata.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/50">
                    {message.metadata.sources.map((source, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {message.metadata?.confidence && (
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(message.metadata.confidence * 100)}% confidence
                    </Badge>
                  )}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">Analyzing with plan context...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="resize-none"
            rows={2}
            disabled={isLoading}
            data-testid="input-chat-message"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-auto"
            data-testid="button-send-message"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
