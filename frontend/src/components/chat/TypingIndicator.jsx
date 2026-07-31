export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gov-accent/20">
        <div className="h-4 w-4 rounded-full bg-gov-accent/60" />
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-gov-border bg-gov-card px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-gov-muted [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-gov-muted [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-gov-muted [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
