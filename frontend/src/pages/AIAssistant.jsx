import { useState } from 'react';
import { Bot, MessageSquare, Plus, History, Trash2, Sparkles, RefreshCw } from 'lucide-react';
import { chatApi } from '../services/api';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import SuggestedQuestions from '../components/chat/SuggestedQuestions';

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    'Top 10 colleges by placement',
    'Total students by district',
    'Scholarships distribution by district',
    'Enrollment trend over years',
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    setError(null);
    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Update recent searches
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== text.toLowerCase());
      return [text, ...filtered].slice(0, 8);
    });

    try {
      // Build history array for backend (last 10 messages)
      const historyPayload = updatedMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await chatApi.sendMessage(text, historyPayload);
      const data = response.data;

      const assistantMsg = {
        role: 'assistant',
        content: data.answer || 'Response generated successfully.',
        table: data.table || null,
        chart: data.chart || null,
        insights: data.insights || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat API Error:', err);
      // Gemini failure / network fallback
      const fallbackMsg = {
        role: 'assistant',
        content:
          err.message ||
          'Sorry, an error occurred while connecting to the AI Assistant service. Please try again.',
        table: null,
        chart: null,
        insights: [
          'Gemini service fallback engaged.',
          'Verify backend connection or Gemini API key configuration.',
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setError('Failed to reach AI service. Displaying fallback message.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gov-text">
              AI Education Assistant
            </h1>
            <span className="rounded-full bg-gov-accent/10 px-2.5 py-0.5 text-xs font-semibold text-gov-accent border border-gov-accent/20">
              Gemini + Pandas Architecture
            </span>
          </div>
          <p className="mt-1 text-xs text-gov-muted">
            Ask questions in natural language — Gemini parses intent, Pandas executes aggregations, Recharts builds visual graphs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNewChat}
            className="flex items-center gap-1.5 rounded-lg border border-gov-border bg-gov-card px-3 py-2 text-xs font-medium text-gov-text transition-colors hover:bg-gov-surface"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-4">
        {/* Sidebar: Recent Searches & Quick Prompts */}
        <div className="hidden flex-col gap-4 overflow-y-auto rounded-xl border border-gov-border bg-gov-card p-4 lg:flex lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-gov-text">
              <History className="h-4 w-4 text-gov-accent" />
              Recent Searches
            </div>
            {recentSearches.length > 0 && (
              <button
                type="button"
                onClick={() => setRecentSearches([])}
                className="text-gov-muted hover:text-gov-text"
                title="Clear recent searches"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1">
            {recentSearches.length === 0 ? (
              <p className="text-xs text-gov-muted italic">No recent queries</p>
            ) : (
              recentSearches.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item)}
                  disabled={isLoading}
                  className="w-full truncate text-left rounded-lg px-2.5 py-1.5 text-xs text-gov-muted transition-colors hover:bg-gov-surface hover:text-gov-text"
                >
                  • {item}
                </button>
              ))
            )}
          </div>

          <div className="mt-auto border-t border-gov-border pt-4">
            <SuggestedQuestions onSelect={handleSendMessage} disabled={isLoading} />
          </div>
        </div>

        {/* Chat Interface Container */}
        <div className="flex flex-col gap-3 overflow-hidden lg:col-span-3">
          {error && (
            <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="font-semibold underline">
                Dismiss
              </button>
            </div>
          )}

          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSelectSuggestion={handleSendMessage}
          />

          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
