export const formatRupiah = (amount: number, prefix: boolean = true): string => {
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  if (!prefix) return formatted;
  return amount < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
};

export const parseRupiahInput = (value: string): number => {
  const clean = value.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
};

export const formatDateIndonesian = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const getRelativeDateLabel = (dateStr: string): string => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  if (dateStr === todayStr) return 'Hari ini';
  if (dateStr === yesterdayStr) return 'Kemarin';
  if (dateStr === tomorrowStr) return 'Besok';

  return formatDateIndonesian(dateStr);
};

export const getGreeting = (name: string): { greeting: string; timePeriod: string } => {
  const hour = new Date().getHours();
  let period = 'Pagi';
  if (hour >= 11 && hour < 15) period = 'Siang';
  else if (hour >= 15 && hour < 18) period = 'Sore';
  else if (hour >= 18 || hour < 4) period = 'Malam';

  return {
    greeting: `Selamat ${period}`,
    timePeriod: period,
  };
};
