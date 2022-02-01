import { default as Web3 } from "web3";
import { PaymentRequest } from "../types";

const ETH_USD_CENT = 2_200 * 100;
export const usdInEth = (usdCent: number) => {
  const eth = (usdCent / ETH_USD_CENT).toString();
  const wei = Web3.utils.toWei(eth, "ether");
  return wei;
};

export const isFulfilled = (paymentRequest: PaymentRequest): boolean => {
  if (!paymentRequest.paidUSDCent) return false;
  return paymentRequest.paidUSDCent >= paymentRequest.priceInUSDCent;
};
