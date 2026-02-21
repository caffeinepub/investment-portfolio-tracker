/**
 * Formats a number as Indian Rupees with proper formatting
 * Uses Indian numbering system (lakhs and crores) for large amounts
 */
export function formatINR(value: number): string {
  // For amounts less than 1 lakh, use standard formatting
  if (Math.abs(value) < 100000) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  // For larger amounts, use Indian numbering system
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 10000000) {
    // Crores (1 crore = 10 million)
    const crores = absValue / 10000000;
    return `${sign}₹${crores.toFixed(2)} Cr`;
  } else if (absValue >= 100000) {
    // Lakhs (1 lakh = 100 thousand)
    const lakhs = absValue / 100000;
    return `${sign}₹${lakhs.toFixed(2)} L`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
