export interface HelpArticle {
  slug: string;
  title: string;
  /** Plain paragraphs and lists, rendered by HelpArticleContent — kept as
   * structured data (not raw HTML/JSX) so content stays easy to edit
   * without touching component code. */
  body: HelpBlock[];
}

export type HelpBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'steps'; items: string[] }
  | { type: 'callout'; tone: 'info' | 'warning'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] };

export interface HelpCategory {
  slug: string;
  label: string;
  articles: HelpArticle[];
}
