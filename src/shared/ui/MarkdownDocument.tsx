function parseInlineMarkdown(text: string, keyPrefix: string): React.ReactNode[] {
  const matches = Array.from(
    text.matchAll(/(\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\))/g)
  );

  if (matches.length === 0) {
    return [text];
  }

  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    const [fullMatch, , strongText, linkText, linkHref] = match;
    const matchIndex = match.index ?? 0;

    if (matchIndex > cursor) {
      nodes.push(text.slice(cursor, matchIndex));
    }

    if (strongText) {
      nodes.push(
        <strong key={`${keyPrefix}-strong-${index}`} className="font-black text-gray-900 dark:text-white">
          {strongText}
        </strong>
      );
    } else if (linkText && linkHref) {
      const isExternal = /^https?:\/\//i.test(linkHref);
      nodes.push(
        <a
          key={`${keyPrefix}-link-${index}`}
          href={linkHref}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noreferrer' : undefined}
          className="font-bold text-sky-700 underline decoration-sky-200 underline-offset-4 transition-colors hover:text-sky-600 dark:text-sky-300 dark:decoration-sky-700 dark:hover:text-sky-200"
        >
          {linkText}
        </a>
      );
    }

    cursor = matchIndex + fullMatch.length;
  });

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

type MarkdownDocumentProps = {
  content: string;
};

export function MarkdownDocument({ content }: MarkdownDocumentProps): React.ReactElement {
  const lines = content.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = (): void => {
    if (paragraphBuffer.length === 0) return;

    const paragraph = paragraphBuffer.join(' ');
    blocks.push(
      <p key={`paragraph-${blocks.length}`} className="text-sm leading-7 text-gray-700 dark:text-gray-200 sm:text-base">
        {parseInlineMarkdown(paragraph, `paragraph-${blocks.length}`)}
      </p>
    );
    paragraphBuffer = [];
  };

  const flushList = (): void => {
    if (listBuffer.length === 0) return;

    blocks.push(
      <ul key={`list-${blocks.length}`} className="space-y-2 pl-5 text-sm leading-7 text-gray-700 marker:text-sky-500 dark:text-gray-200 sm:text-base">
        {listBuffer.map((item, index) => (
          <li key={`list-${blocks.length}-${index}`}>
            {parseInlineMarkdown(item, `list-${blocks.length}-${index}`)}
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    if (/^-{3,}$/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push(
        <hr key={`divider-${blocks.length}`} className="border-gray-200/80 dark:border-gray-700" />
      );
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();

      const level = headingMatch[1].length;
      const headingText = headingMatch[2];

      if (level === 1) {
        blocks.push(
          <h2 key={`heading-${blocks.length}`} className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            {parseInlineMarkdown(headingText, `heading-${blocks.length}`)}
          </h2>
        );
      } else {
        blocks.push(
          <h3 key={`heading-${blocks.length}`} className="text-lg font-black text-gray-900 dark:text-white">
            {parseInlineMarkdown(headingText, `heading-${blocks.length}`)}
          </h3>
        );
      }
      return;
    }

    if (trimmed.startsWith('- ')) {
      flushParagraph();
      listBuffer.push(trimmed.slice(2));
      return;
    }

    paragraphBuffer.push(trimmed);
  });

  flushParagraph();
  flushList();

  return <div className="space-y-4">{blocks}</div>;
}
