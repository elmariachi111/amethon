import React from 'react';
import { TransactionReceipt } from 'web3-core';
import { PayablePaymentRequest } from '../types';
import { PayButton } from './PayButton';
import { PayWithStableButton } from './PayWithStableButton';


export const PaymentOptions = (props: {
  paymentRequest: PayablePaymentRequest, 
  onConfirmed: (tx: TransactionReceipt | undefined) => void 
}) => {
  const {paymentRequest, onConfirmed} = props;
  
  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-3">
        <PayButton paymentRequest={paymentRequest} onConfirmed={onConfirmed}/>
        <PayWithStableButton paymentRequest={paymentRequest} onConfirmed={onConfirmed} />
        </div>
      <div className="text-xs truncate">payment reference: <br /> {paymentRequest.idUint256}</div>
    </div>
  
  )
}
