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
  <div className="flex flex-row items-center gap-3">
    <PayButton paymentRequest={paymentRequest} onConfirmed={onConfirmed}/>
    <PayWithStableButton paymentRequest={paymentRequest} onConfirmed={onConfirmed} />
  </div>
  )
}