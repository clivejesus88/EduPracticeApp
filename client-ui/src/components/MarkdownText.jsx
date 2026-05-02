import React from 'react';

// ─── Inline HTML: bold, italic, inline-code ──────────────────────────────────
function inlineHtml(text) {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,     '<strong class="font-semibold text-white/95">$1</strong>')
    .replace(/\*([^*\n]+?)\*/g,    '<em class="italic opacity-90">$1</em>')
    .replace(/_([^_\n]+?)_/g,      '<em class="italic opacity-90">$1</em>')
    .replace(/`([^`]+)`/g,         '<code class="px-1.5 py-0.5 rounded-md bg-white/[0.09] border border-white/[0.08] text-amber-300 text-[0.82em] font-mono tracking-tight">$1</code>');
}

// ─── Block-level parser ───────────────────────────────────────────────────────
function parseBlocks(text) {
  const lines = (text || '').split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // ── Fenced code block ──────────────────────────────────────
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', lang, content: codeLines.join('\n') });
      i++;
      continue;
    }

    // ── Heading ────────────────────────────────────────────────
    const hMatch = trimmed.match(/^(#{1,4})\s+(.+)/);
    if (hMatch) {
      blocks.push({ type: 'heading', level: hMatch[1].length, content: hMatch[2] });
      i++;
      continue;
    }

    // ── Horizontal rule ────────────────────────────────────────
    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // ── Bullet list ────────────────────────────────────────────
    if (/^[-*•]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // ── Numbered list ──────────────────────────────────────────
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // ── Blockquote ─────────────────────────────────────────────
    if (trimmed.startsWith('> ')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push({ type: 'blockquote', content: quoteLines.join(' ') });
      continue;
    }

    // ── Empty line — skip ──────────────────────────────────────
    if (!trimmed) {
      i++;
      continue;
    }

    // ── Paragraph — collect until blank / list / heading ──────
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^[-*•]\s+/.test(lines[i].trim()) &&
      !/^\d+[.)]\s+/.test(lines[i].trim()) &&
      !/^#{1,4}\s+/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('> ') &&
      !/^---+$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length) {
      blocks.push({ type: 'p', content: paraLines.join(' ') });
    }
  }

  return blocks;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MarkdownText({ content, className = '', compact = false }) {
  const blocks = parseBlocks(content);
  const gap = compact ? 'space-y-1.5' : 'space-y-2.5';

  return (
    <div className={`${gap} ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {

          case 'code':
            return (
              <div key={idx} className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0a0d14]">
                {block.lang && (
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.04] border-b border-white/[0.08]">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">{block.lang}</span>
                  </div>
                )}
                <pre className="px-4 py-3 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed">
                  <code>{block.content}</code>
                </pre>
              </div>
            );

          case 'heading': {
            const sizes = [
              'text-base font-bold text-white mt-1',
              'text-sm font-bold text-white mt-0.5',
              'text-sm font-semibold text-slate-200',
              'text-xs font-semibold text-slate-300 uppercase tracking-wide',
            ];
            const Tag = ['h3', 'h4', 'h5', 'h6'][block.level - 1] || 'p';
            return (
              <Tag
                key={idx}
                className={sizes[block.level - 1] || sizes[0]}
                dangerouslySetInnerHTML={{ __html: inlineHtml(block.content) }}
              />
            );
          }

          case 'ul':
            return (
              <ul key={idx} className={compact ? 'space-y-1' : 'space-y-2'}>
                {block.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50 shrink-0 mt-[0.45em]" />
                    <span
                      className="flex-1 min-w-0 leading-snug"
                      dangerouslySetInnerHTML={{ __html: inlineHtml(item) }}
                    />
                  </li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol key={idx} className={compact ? 'space-y-1' : 'space-y-2'}>
                {block.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <span className="text-amber-400/70 font-semibold tabular-nums shrink-0 w-5 text-sm leading-snug">{j + 1}.</span>
                    <span
                      className="flex-1 min-w-0 leading-snug"
                      dangerouslySetInnerHTML={{ __html: inlineHtml(item) }}
                    />
                  </li>
                ))}
              </ol>
            );

          case 'blockquote':
            return (
              <div key={idx} className="flex gap-3 pl-1">
                <div className="w-0.5 rounded-full bg-amber-400/40 shrink-0" />
                <p
                  className="flex-1 text-slate-400 italic leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: inlineHtml(block.content) }}
                />
              </div>
            );

          case 'hr':
            return <div key={idx} className="border-t border-white/[0.08] my-1" />;

          case 'p':
          default:
            return (
              <p
                key={idx}
                className="leading-relaxed"
                dangerouslySetInnerHTML={{ __html: inlineHtml(block.content) }}
              />
            );
        }
      })}
    </div>
  );
}
