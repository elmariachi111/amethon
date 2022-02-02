import { useWeb3React } from '@web3-react/core';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-core';
import { AbiItem } from 'web3-utils';
import receiverAbi from '../abi/PaymentReceiver.json';
import { isFulfilled } from '../modules';
import { Book, PayablePaymentRequest, PaymentRequest } from '../types';
import { DownloadButton } from './DownloadButton';
import { PaymentOptions } from './PaymentOptions';


export const BookView = (props: {book: Book}) => {
  const {book} = props;
  const {account, library: web3} = useWeb3React<Web3>();

  const [paymentRequest, setPaymentRequest] = useState<PayablePaymentRequest>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  
  const handlePaymentResponse = (web3: Web3, resp:{paymentRequest: PaymentRequest, receiver: string} ) => {
    setPaymentRequest({
      ...resp.paymentRequest,
      idUint256: web3.eth.abi.encodeParameter("uint256", resp.paymentRequest.id),
      receiver: new web3.eth.Contract(receiverAbi as AbiItem[], resp.receiver)
    });
  }

  const initPayment = async () => {
    if (!web3) return;
    const url = `${process.env.REACT_APP_BOOK_SERVER}/books/${book.ISBN}/order`;
    const resp = (await axios.post<{paymentRequest: PaymentRequest, receiver: string}>(url, {
      address: account
    })).data;
    handlePaymentResponse(web3, resp) 
  }

  useEffect(() => {
    if (!account || !web3) return;
    (async() => {
      const url = `${process.env.REACT_APP_BOOK_SERVER}/books/${book.ISBN}/payments/${account}`;
      try {
        const resp = await (await axios.get<{paymentRequest: PaymentRequest, receiver: string}>(url)).data;
        handlePaymentResponse(web3, resp);
      } catch(e: any) {
        console.log(e.message);
      }
    })();
  }, [account, web3, receipt]);

  return (
    <div className="grid grid-cols-3 gap-4 items-center my-6">
      <div>
        <h2 className="text-lg">
          {book.title}
        </h2>
        <span className="text-sm">{book.ISBN}</span>
      </div>
      
      <span className="text-lg">
        USD {(book.retailUSDCent / 100).toFixed(2)}
      </span>

      {(paymentRequest) 
       ? isFulfilled(paymentRequest) 
          ? <DownloadButton paymentRequest={paymentRequest}  />
          : <PaymentOptions paymentRequest={paymentRequest} onConfirmed={setReceipt} />
       : <button className="btn-primary" disabled={!account} onClick={() => initPayment()}>buy</button>
      }
    </div>
  )
}