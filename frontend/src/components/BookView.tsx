import { useWeb3React } from '@web3-react/core';
import axios from 'axios';
import React, { useState } from 'react';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import receiverAbi from '../abi/PaymentReceiver.json';
import { Book, PaymentRequest } from '../types';
import { PayButton } from './PayButton';


export const BookView = (props: {book: Book}) => {
  const {book} = props;
  const {account, library: web3} = useWeb3React<Web3>();

  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest>();
  const [receiver, setReceiver] = useState<Contract>()

  const initPayment = async () => {
    if (!web3) return;
    const url = `${process.env.REACT_APP_BOOK_SERVER}/books/${book.ISBN}/order`;
    const resp = (await axios.post<{paymentRequest: PaymentRequest, receiver: string}>(url, {
      address: account
    })).data;

    setPaymentRequest({
      ...resp.paymentRequest,
      idUint256: web3.eth.abi.encodeParameter("uint256", resp.paymentRequest.id)
    });

    const receiverContract = new web3.eth.Contract(receiverAbi as AbiItem[], resp.receiver);
    setReceiver(receiverContract);
  }

  return (
    <div className="grid grid-cols-3 gap-4 items-center p-4">
      <h2 className="text-lg">
        {book.title}
      </h2>
      <span className="">
        USD {(book.retailUSDCent / 100).toFixed(2)}
      </span>
      {(paymentRequest && receiver) 
       ? <PayButton paymentRequest={paymentRequest} receiver={receiver} />
       : <button className="btn-primary" disabled={!account} onClick={() => initPayment()}>buy</button>
      }
    </div>
  )
}