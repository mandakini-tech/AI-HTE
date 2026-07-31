import { Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  'Top 10 colleges by placement',
  'Top districts by total students',
  'Compare districts by average placement',
  'Colleges with highest budget',
  'Districts with highest attendance',
  'Colleges with highest scholarships',
  'Top colleges by infrastructure score',
  'Gender distribution of students',
  'University statistics and enrollment',
  'Show platform dashboard summary',
];

export default function SuggestedQuestions({ onSelect, disabled }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-gov-muted">
        <Sparkles className="h-3.5 w-3.5 text-gov-accent" />
        Suggested Analytics Questions
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((question) => (
          <button
            key={question}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(question)}
            className="rounded-full border border-gov-border bg-gov-surface/60 px-3 py-1.5 text-xs text-gov-text transition-colors hover:border-gov-accent/50 hover:bg-gov-accent/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
