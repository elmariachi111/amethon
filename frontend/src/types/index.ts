import { Contract } from "web3-eth-contract";

export interface Book {
  ISBN: string;
  title: string;
  retailUSDCent: number;
}

export interface PaymentRequest {
  id: number;
  book: Book;
  address: string;
  priceInUSDCent: number;
  fulfilledHash: string | null;
  paidUSDCent: number | null;
}

export interface PayablePaymentRequest extends PaymentRequest {
  idUint256: string;
  receiver: Contract;
}
