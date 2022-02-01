import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import receiverAbi from './abi/PaymentReceiver.json';

import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { TransactionReceipt } from 'web3-core';

interface Book {
  ISBN: string,
  title: string,
  retailUSDCent: number
}

interface PaymentRequest {
  id: number,
  idUint256?: string,
  book: Book,
  address: string,
  priceInUSDCent: number,
  fulfilledHash: string | null,
  paidUSDCent: number | null
}

const ETH_USD_CENT = 2_200 * 100;
const usdInEth = (usdCent: number) => {
  const eth = (usdCent / ETH_USD_CENT).toString();
  const wei = Web3.utils.toWei(eth, "ether");
  return wei;
} 

export const DownloadButton = (props: {book: Book}) => {
  const {account, library: web3} = useWeb3React<Web3>();
  const {book} = props;

  const download = async () => {
    if (!web3 || !account) return;
    const url = `${process.env.REACT_APP_BOOK_SERVER}/books/${book.ISBN}/download`;
    const nonce = Web3.utils.randomHex(32);
    const dataToSign = Web3.utils.keccak256(`${account}${book.ISBN}${nonce}`);
    
    const signature = await web3.eth.personal.sign(dataToSign, account, "")

    const resp = await (await axios.post(url, {
      address: account,
      nonce,
      signature
    }, {responseType: "arraybuffer"})).data;
    console.log(resp);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(new Blob([resp], {type: "text/plain"}));
    link.download = `${book.title}.txt`;
    link.click();
  }

  return <button className="btn-primary" disabled={!web3} onClick={() => download()}>Download</button>
}
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
  },[web3, account]);

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

export const BookInventory = () => {
  
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const url = `${process.env.REACT_APP_BOOK_SERVER}/books`;

    (async () => {
      setBooks(await (await axios.get<Book[]>(url)).data);
    } )();
  }, []);

  return <div>
    
      {books.map(book => (
        <BookView book={book} key={`${book.ISBN}`} />    
      ))}
    
  </div>
  
};

