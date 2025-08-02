import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  if (currency === 'INR') {
    const crores = amount / 10000000;
    const lakhs = (amount % 10000000) / 100000;

    if (crores >= 1) {
      return `₹${crores.toFixed(2)} Cr`;
    }
    if (lakhs >=1) {
      return `₹${lakhs.toFixed(2)} Lac`;
    }
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
