import { Web3ReactProvider } from '@web3-react/core';
import React from 'react';
import Web3 from 'web3';
import { BookInventory } from './BookInventory';
import { ConnectButton } from './components/ConnectButton';


function getWeb3Library(provider: any) {
  return new Web3(provider);
}

function App() {
  
  return (
    <Web3ReactProvider getLibrary={getWeb3Library}>
      <ConnectButton />
      <BookInventory />
    </Web3ReactProvider>
    
  );
}

export default App;
