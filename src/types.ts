export type RemarqType = 'note' | 'warn' | 'imp' | 'todo' | 'research' | 'custom';
export type RemarqAlign = 'left' | 'center' | 'right';

export interface RemarqComment {
  type: RemarqType;
  message: string;
  color?: string;
  fontSize?: number;
  font?: 'mono' | 'sans' | 'serif';
  align?: RemarqAlign;
  lineNumber: number;
  startChar: number;
  endChar: number;
}

export const TYPE_DEFAULTS: Record<RemarqType, { color: string; label: string; bg: string }> = {
  note:     { color: '#97c459', bg: '#0e2a1f', label: '📝 note' },
  warn:     { color: '#ef9f27', bg: '#2e1f0e', label: '⚠ warning' },
  imp:      { color: '#d4537e', bg: '#1f1020', label: '⚑ important' },
  todo:     { color: '#cba6f7', bg: '#2a1f3d', label: '✦ todo' },
  research: { color: '#89b4fa', bg: '#0e1a2e', label: '🔬 research' },
  custom:   { color: '#888780', bg: '#1a1a1a', label: '◆ note' },
};