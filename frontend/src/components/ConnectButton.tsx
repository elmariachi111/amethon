import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import React from 'react';
import Web3 from 'web3';

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [42, 1337, 31337]
});

export const ConnectButton = () => {
  const { activate, account, active } = useWeb3React<Web3>();

  const connect = () => {
     activate(injectedConnector, console.error);
  }

  return (active
     ? <div className="text-sm">connected as: {account}</div> 
     : <button className="btn-primary" onClick={connect}>Connect</button>)
};
