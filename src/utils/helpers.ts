export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatDatePtBR(dateKey: string): string {
  if (!dateKey) return '';
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  const todayKey = getTodayDateKey();
  const isToday = dateKey === todayKey;

  const formatted = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  return isToday ? `Hoje • ${capitalized}` : capitalized;
}

export function formatDateShortPtBR(dateKey: string): string {
  if (!dateKey) return '';
  const [year, month, day] = dateKey.split('-').map(Number);
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

export function formatMonthNamePtBR(monthKey: string): string {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const name = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function formatTimePtBR(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeElapsedPtBR(startTimestamp: number, nowTimestamp = Date.now()): string {
  const diffMs = Math.max(0, nowTimestamp - startTimestamp);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return 'há menos de 1 min';
  if (diffMinutes < 60) return `há ${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  const remainingMins = diffMinutes % 60;
  if (remainingMins === 0) return `há ${hours}h`;
  return `há ${hours}h ${remainingMins}min`;
}

export function formatDurationPtBR(startTimestamp: number, endTimestamp?: number): string {
  const end = endTimestamp || Date.now();
  const diffMs = Math.max(0, end - startTimestamp);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return '< 1 min';
  if (diffMinutes < 60) return `${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  const remainingMins = diffMinutes % 60;
  if (remainingMins === 0) return `${hours}h`;
  return `${hours}h ${remainingMins}m`;
}

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Downloads data as a CSV file in UTF-8 with BOM (compatible with Excel in Portuguese)
 */
export function downloadCSV(filename: string, rows: string[][]) {
  const csvContent = '\uFEFF' + rows.map((e) => e.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
