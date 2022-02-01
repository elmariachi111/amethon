import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import React from 'react';
import Web3 from 'web3';

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [1, 4, 42, 1337, 31337]
});


export const ConnectButton = () => {
  const { activate, account, active, library: web3 } = useWeb3React<Web3>();

  const connect = () => {
     activate(injectedConnector, console.error);
  }

  return (active ? <div>Connected: {account}</div> : <button className="btn-primary" onClick={connect}>Connect</button>)
};
