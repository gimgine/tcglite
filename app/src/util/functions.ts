export const formatCurrency = (value?: number) => {
  return value?.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};
