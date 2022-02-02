import { useWeb3React } from '@web3-react/core';
import axios from 'axios';
import React from 'react';
import { default as Web3 } from "web3";
import { PaymentRequest } from "../types";

export const DownloadButton = (props: {paymentRequest: PaymentRequest}) => {
  const {account, library: web3} = useWeb3React<Web3>();
  const {paymentRequest} = props;
  const {book} = paymentRequest;

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

  return <div className="flex flex-col">
      <button className="btn-primary" disabled={!web3} onClick={() => download()}>Download</button>
      <div className="text-ellipsis overflow-hidden text-xs pt-1">{paymentRequest.fulfilledHash}</div>
    </div>
}