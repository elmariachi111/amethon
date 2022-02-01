export interface Book {
  ISBN: string;
  title: string;
  retailUSDCent: number;
}

export interface PaymentRequest {
  id: number;
  idUint256?: string;
  book: Book;
  address: string;
  priceInUSDCent: number;
  fulfilledHash: string | null;
  paidUSDCent: number | null;
}
