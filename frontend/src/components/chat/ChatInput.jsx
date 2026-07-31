import { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';

export default function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Please enter a question or query before sending.');
      return;
    }
    setError('');
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative flex items-center">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question (e.g. 'Top 10 colleges by placement', 'Students by district')..."
          disabled={disabled}
          className="w-full resize-none rounded-xl border border-gov-border bg-gov-card py-3 pl-4 pr-12 text-sm text-gov-text placeholder-gov-muted transition-colors focus:border-gov-accent focus:outline-none focus:ring-1 focus:ring-gov-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gov-accent text-white transition-all hover:bg-gov-accent/90 disabled:opacity-40"
          title="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
