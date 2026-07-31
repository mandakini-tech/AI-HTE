import { useState } from 'react';
import { Bot, User, Copy, Check, Download, Lightbulb } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ResultTable from './ResultTable';
import ChartRenderer from './ChartRenderer';

function buildExportText(message) {
  const parts = [message.content];
  if (message.insights?.length) {
    parts.push('\nInsights:');
    message.insights.forEach((item) => parts.push(`• ${item}`));
  }
  return parts.join('\n');
}

function exportToPdf(message) {
  const doc = new jsPDF();
  const margin = 14;
  let y = 20;

  doc.setFontSize(14);
  doc.text('AI-HTE Assistant Response', margin, y);
  y += 10;

  doc.setFontSize(10);
  const answerLines = doc.splitTextToSize(message.content, 180);
  doc.text(answerLines, margin, y);
  y += answerLines.length * 5 + 8;

  if (message.insights?.length) {
    doc.setFontSize(11);
    doc.text('Insights', margin, y);
    y += 6;
    doc.setFontSize(9);
    message.insights.forEach((insight) => {
      const lines = doc.splitTextToSize(`• ${insight}`, 180);
      doc.text(lines, margin, y);
      y += lines.length * 4 + 2;
    });
    y += 4;
  }

  if (message.table?.rows?.length) {
    autoTable(doc, {
      startY: y,
      head: [message.table.columns],
      body: message.table.rows.map((row) =>
        message.table.columns.map((col) => String(row[col] ?? '')),
      ),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
  }

  doc.save(`ai-hte-response-${Date.now()}.pdf`);
}

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildExportText(message));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gov-accent px-4 py-3 text-sm text-white">
          {message.content}
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gov-accent/20">
          <User className="h-4 w-4 text-gov-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gov-accent/20">
        <Bot className="h-4 w-4 text-gov-accent" />
      </div>
      <div className="min-w-0 max-w-[90%] flex-1">
        <div className="rounded-2xl rounded-tl-sm border border-gov-border bg-gov-card px-4 py-3">
          <p className="text-sm leading-relaxed text-gov-text">{message.content}</p>

          {message.insights?.length > 0 && (
            <div className="mt-3 border-t border-gov-border pt-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gov-muted">
                <Lightbulb className="h-3.5 w-3.5 text-gov-warning" />
                Key insights
              </div>
              <ul className="space-y-1">
                {message.insights.map((insight, i) => (
                  <li key={i} className="text-xs text-gov-muted">
                    • {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ResultTable table={message.table} />
          <ChartRenderer chart={message.chart} />

          <div className="mt-3 flex gap-2 border-t border-gov-border pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gov-muted transition-colors hover:bg-gov-surface hover:text-gov-text"
              title="Copy response"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-gov-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={() => exportToPdf(message)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gov-muted transition-colors hover:bg-gov-surface hover:text-gov-text"
              title="Export PDF"
            >
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
