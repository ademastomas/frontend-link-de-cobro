export interface PaymentI {
  paymentType: string; // TODO enum

  customerName: string;

  customerEmail: string;

  customerPhone: string;

  customerIdentification: string;

  customerBank: string; // TODO enum
}
