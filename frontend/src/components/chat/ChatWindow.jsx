import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import SuggestedQuestions from './SuggestedQuestions';

export default function ChatWindow({ messages, isLoading, onSelectSuggestion }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gov-border bg-gov-surface/30">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gov-accent/10 border border-gov-accent/20">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-base font-semibold text-gov-text">
              AI Education Assistant
            </h3>
            <p className="mt-1 max-w-md text-xs text-gov-muted">
              Ask natural language questions about Maharashtra Higher & Technical Education data. Gemini parses intent, Pandas computes exact figures, and interactive charts are generated automatically.
            </p>
            <div className="mt-6 w-full max-w-lg">
              <SuggestedQuestions onSelect={onSelectSuggestion} disabled={isLoading} />
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={bottomRef} />
          </>
        )}
      </div>
    </div>
  );
}
