export interface LoveLetter {
  id: string;
  created_at: string;
  title: string;
  content: string;
  author: string;
  is_sealed: boolean;
  theme: 'classic' | 'valentine' | 'dark';
}
