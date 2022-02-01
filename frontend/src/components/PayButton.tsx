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
    tx.on("confirmation", (confirmationNumber, receipt) => {
      if (confirmationNumber < 2) onConfirmed(receipt);
    });
  }, [web3, account]);

  return (<div>
   <button className="btn-primary" onClick={() => pay()}>
     Pay {Web3.utils.fromWei(weiPrice, "ether")} Eth 
    </button>
  </div>)
}