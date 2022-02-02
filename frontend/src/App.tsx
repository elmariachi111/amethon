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
      <div className="container mx-auto px-4 my-6">
        <h1 className="text-2xl font-bold mb-6">amethon :)</h1>
        <ConnectButton />  
        <BookInventory />
        <div className="text-xs">receiver address: {process.env.REACT_APP_RECEIVER}</div>
      </div>
    </Web3ReactProvider>
    
  );
}

export default App;
