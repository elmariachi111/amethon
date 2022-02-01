import { useWeb3React } from '@web3-react/core';
import React, { useCallback, useState } from 'react';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { usdInEth } from '../modules/currency';
import { PaymentRequest } from '../types';
import { DownloadButton } from './DownloadButton';

export const PayButton = (props: {paymentRequest: PaymentRequest, receiver: Contract}) => {
  const {paymentRequest, receiver} = props;
  const {account, library: web3} = useWeb3React<Web3>();

  const weiPrice = usdInEth(paymentRequest.priceInUSDCent)
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const pay = useCallback(async () => {
    if (!web3 || !account) return;
    const tx = web3.eth.sendTransaction({
      from: account,
      to: receiver.options.address,
      value: weiPrice, 
      data: paymentRequest.idUint256
    });
    tx.on("receipt", setReceipt);
    tx.on("confirmation", () => setConfirmed(true))
  }, [web3, account]);

  return (<div>
    {confirmed 
      ? <DownloadButton book={paymentRequest.book} />
      : <button className="btn-primary" onClick={() => pay()}>
          Pay {Web3.utils.fromWei(weiPrice, "ether")} Eth 
        </button>
    }
    {receipt && <div className="text-ellipsis overflow-hidden">{receipt.transactionHash}</div>}
  </div>)
}