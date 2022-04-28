import { useWeb3React } from '@web3-react/core';
import React, { useCallback } from 'react';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-core';
import { usdInEth } from '../modules';
import { PayablePaymentRequest } from '../types';

export const PayButton = (props: {
  paymentRequest: PayablePaymentRequest, 
  onConfirmed: (tx: TransactionReceipt | undefined) => void 
}) => {
  const {paymentRequest, onConfirmed} = props;
  const {account, library: web3} = useWeb3React<Web3>();

  const weiPrice = usdInEth(paymentRequest.priceInUSDCent)

  const pay = useCallback(async () => {
    if (!web3 || !account) return;
    const tx = web3.eth.sendTransaction({
      from: account,
      to: paymentRequest.receiver.options.address,
      value: weiPrice, 
      data: paymentRequest.idUint256
    });
    const receipt = await tx;
    onConfirmed(receipt)
  }, [web3, account, onConfirmed, paymentRequest, weiPrice]);

  return (
   <button className="btn-primary" onClick={() => pay()}>
     Pay {parseFloat(Web3.utils.fromWei(weiPrice, "ether")).toFixed(5)}E 
    </button>
  )
}