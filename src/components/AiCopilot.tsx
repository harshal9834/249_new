import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  RotateCcw, 
  FileText, 
  ShieldAlert, 
  Cpu, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: string;
  timestamp: string;
}

export const AiCopilot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content: `### Welcome to AeroPulse AI Maintenance Copilot

I am your aerospace propulsion and air fleet maintenance reasoning assistant, grounded in real-time MIL-STD telemetry, failure hazard distributions, and depot capacity.

You can ask me questions such as:
* **"Why is Aircraft F-023 at risk?"**
* **"Which aircraft need maintenance?"**
* **"Show critical components."**
* **"Provide maintenance recommendations."**

How can I assist your maintenance operations or flightline diagnostics today?`,
      source: 'AeroPulse Defense Engine',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Why is Aircraft F-023 at risk?',
    'Which aircraft need maintenance?',
    'Show critical components.',
    'Provide maintenance recommendations.'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'No response generated.',
        source: data.source || 'AeroPulse Copilot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `**Diagnostic Error:** Unable to reach AI copilot service: ${err.message}. Reverting to standard military technical orders.`,
        source: 'System Offline Fallback',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'init-msg',
        role: 'assistant',
        content: 'Conversation history reset. All fleet telemetry connections active. What would you like to investigate?',
        source: 'AeroPulse Defense Engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper to format basic markdown-style text safely
  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-sm font-bold text-slate-900 mt-2 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="text-xs font-bold text-slate-800 uppercase mt-2 mb-1">{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-700 leading-relaxed my-0.5">
            {formatBold(line.substring(2))}
          </li>
        );
      }
      if (line.trim().startsWith('|')) {
        return <pre key={idx} className="text-[11px] font-mono bg-slate-100 p-1 rounded overflow-x-auto text-slate-800">{line}</pre>;
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return <p key={idx} className="text-xs text-slate-700 leading-relaxed my-0.5">{formatBold(line)}</p>;
    });
  };

  const formatBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1 py-0.5 bg-slate-200 text-slate-800 rounded font-mono text-[11px]">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">AI Maintenance Copilot</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-medium">
              DUAL-AI REASONING ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Intelligent assistant answering technical queries, technical order lookups, failure predictions, and depot scheduling advice.
          </p>
        </div>

        <button
          onClick={handleClearHistory}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Suggested Questions Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Inquiries:</span>
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-full border border-slate-200 shadow-2xs whitespace-nowrap transition-colors flex items-center space-x-1 hover:border-slate-300"
          >
            <span>{q}</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col h-[580px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map(msg => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                    isUser ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-2xl rounded-lg p-4 border text-xs ${
                    isUser
                      ? 'bg-slate-900 text-white border-slate-800'
                      : 'bg-slate-50/80 text-slate-900 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 border-b pb-1 border-slate-200/50">
                    <span className="font-semibold">{isUser ? 'Maintenance Officer' : 'AeroPulse MIL-AI'}</span>
                    <span className="font-mono">{msg.timestamp}</span>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    {formatMarkdown(msg.content)}
                  </div>

                  {msg.source && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                      <span>Engine: {msg.source}</span>
                      <span>Security: UNCLASSIFIED</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500 flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                <span>Synthesizing multi-spectral telemetry & technical orders...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask Copilot (e.g., Why is Aircraft F-023 at risk? Which aircraft need maintenance?)..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center space-x-1.5 shrink-0"
            >
              <span>Transmit</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
