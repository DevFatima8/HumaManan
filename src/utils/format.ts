export function formatPrice(amount: number, currency: 'PKR' | 'USD'): string {
  if (currency === 'PKR') {
    return `Rs. ${amount.toLocaleString('en-PK')}`;
  } else {
    return `$${amount.toLocaleString('en-US')}`;
  }
}
