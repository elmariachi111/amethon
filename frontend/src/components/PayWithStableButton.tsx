import { useWeb3React } from '@web3-react/core';
import React, { useCallback, useEffect, useState } from 'react';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-core';
import { PayablePaymentRequest } from '../types';
import IERC20ABI from '../abi/IERC20.json';
import ReceiverAbi from '../abi/PaymentReceiver.json';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import BN from 'bn.js';

export const PayWithStableButton = (props: {
  paymentRequest: PayablePaymentRequest, 
  onConfirmed: (tx: TransactionReceipt | undefined) => void 
}) => {
  const {paymentRequest, onConfirmed} = props;
  const {account, library: web3} = useWeb3React<Web3>();

  const weiPrice =  new BN(Web3.utils.toWei(`${paymentRequest.priceInUSDCent / 100}`));

  const [balance, setBalance] = useState<BN>()
  const [allowance, setAllowance] = useState<BN>()
  const [coin, setCoin] = useState<Contract>();


  useEffect(() => {
    if (!account || !web3) return;
    (async() => {
      const contract = new web3.eth.Contract(IERC20ABI as AbiItem[], process.env.REACT_APP_STABLECOINS)
      try {
        setBalance(new BN(await contract.methods.balanceOf(account).call()));
        setAllowance(new BN(await contract.methods.allowance(account, paymentRequest.receiver.options.address).call()));
      } catch(e: any) {
        console.error(e.message);
      } finally {
        setCoin(contract);
      }
    })();
  }, [account, web3]);

  const approve = async (price: BN) => {
    if (!coin || !account) return;
    
    const appr = await coin.methods.approve(paymentRequest.receiver.options.address, price).send({
      from: account
    });
    setAllowance(price);
    console.log(appr);
  }

  const pay = useCallback(async () => {
    if (!web3 || !account) return;
    const contract = new web3.eth.Contract(ReceiverAbi as AbiItem[], paymentRequest.receiver.options.address)
    const tx = await contract.methods.payWithErc20(process.env.REACT_APP_STABLECOINS, weiPrice, paymentRequest.idUint256).send({
      from: account
    })
    onConfirmed(tx);
  }, [web3, account]);

  return (<div className="flex">
  {allowance?.lt(weiPrice) 
    ? <button className="btn-primary" onClick={() => approve(weiPrice)}>
        Approve DAI
      </button>
    : <button className="btn-primary" onClick={() => pay()}>
        Pay {Web3.utils.fromWei(weiPrice, "ether")} DAI 
      </button>
}
   
  </div>)
}