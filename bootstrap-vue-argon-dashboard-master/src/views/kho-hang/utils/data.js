export const STOCK_LOW_THRESHOLD = 50;

export function checkExpiryStatusHSD(expiryDateStr) {
  if (!expiryDateStr) return 'An toàn';
  const parts = expiryDateStr.split('/');
  const expiryDate = new Date(parts[2], parts[1] - 1, parts[0]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (expiryDate < today) return 'Hết Hạn!';
  const thirtyDaysAhead = new Date(today);
  thirtyDaysAhead.setDate(today.getDate() + 30);
  if (expiryDate <= thirtyDaysAhead) return 'Sắp hết';
  return 'An toàn';
}

export function checkExpiryStatusStock(stock) {
  return stock < STOCK_LOW_THRESHOLD ? 'Thấp' : 'An toàn';
}

export const defaultProducts = [
  { code:'TB-001', name:'Thịt Bò Thăn', stock:150, unit:'KG', batch:'L01-0925', expiry:'27/09/2025', statusHSD:'Hết Hạn!', statusStock:'An toàn' },
  { code:'CA-005', name:'Cá Hồi Fillet', stock:250, unit:'KG', batch:'L03-1025', expiry:'15/10/2025', statusHSD:'Sắp hết', statusStock:'An toàn' },
  { code:'GA-002', name:'Gạo Nếp', stock:500, unit:'KG', batch:'L08-2026', expiry:'20/08/2026', statusHSD:'An toàn', statusStock:'An toàn' },
  { code:'TH-003', name:'Tôm Sú Lớn', stock:80, unit:'KG', batch:'TS-05B', expiry:'29/09/2025', statusHSD:'Hết Hạn!', statusStock:'An toàn' },
  { code:'HL-010', name:'Hải Sâm Khô', stock:5, unit:'Hộp', batch:'HS-02C', expiry:'15/01/2026', statusHSD:'An toàn', statusStock:'Thấp' },
];
