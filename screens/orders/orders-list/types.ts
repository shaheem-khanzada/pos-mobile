export type OrderStatus = 'completed' | 'pending' | 'cancelled';

export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer';

export type OrderListItem = {
  id: string;
  orderNumber: string;
  timeLabel: string;
  status: OrderStatus;
  customerName: string;
  payment: PaymentMethod;
  total: number;
};
