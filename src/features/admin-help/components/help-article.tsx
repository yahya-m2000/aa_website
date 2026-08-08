import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/core/utils';
import type { HelpArticle, HelpBlock } from '../types';

function Block({ block }: { block: HelpBlock }) {
  switch (block.type) {
    case 'p':
      return <p className="text-sm leading-relaxed text-[rgb(var(--foreground))]">{block.text}</p>;

    case 'list':
      return (
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[rgb(var(--foreground))]">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case 'steps':
      return (
        <ol className="space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-[rgb(var(--foreground))]">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--accent))]/10 text-xs font-semibold text-[rgb(var(--accent))]">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );

    case 'callout': {
      const isWarning = block.tone === 'warning';
      const Icon = isWarning ? AlertTriangle : Info;
      return (
        <div
          className={cn(
            'flex gap-3 rounded-(--radius) border px-4 py-3 text-sm leading-relaxed',
            isWarning
              ? 'border-[rgb(var(--warning))]/20 bg-[rgb(var(--warning-bg))] text-[rgb(var(--warning))]'
              : 'border-[rgb(var(--border))] bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]'
          )}
        >
          <Icon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{block.text}</span>
        </div>
      );
    }

    case 'table':
      return (
        <div className="overflow-hidden rounded-(--radius) border border-[rgb(var(--border))]">
          <table className="w-full text-sm">
            <thead className="bg-[rgb(var(--muted))]">
              <tr>
                {block.headers.map((h) => (
                  <th key={h} className="px-4 py-2 text-left font-medium text-[rgb(var(--foreground))]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-t border-[rgb(var(--border))]">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={cn(
                        'px-4 py-2 align-top',
                        j === 0
                          ? 'font-medium text-[rgb(var(--foreground))] whitespace-nowrap'
                          : 'text-[rgb(var(--muted-foreground))]'
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function HelpArticleView({ article }: { article: HelpArticle }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-semibold text-[rgb(var(--foreground))]">{article.title}</h2>
      <div className="space-y-4">
        {article.body.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>
    </div>
  );
}
