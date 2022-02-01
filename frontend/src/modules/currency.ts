import { default as Web3 } from "web3";

const ETH_USD_CENT = 2_200 * 100;
export const usdInEth = (usdCent: number) => {
  const eth = (usdCent / ETH_USD_CENT).toString();
  const wei = Web3.utils.toWei(eth, "ether");
  return wei;
};
