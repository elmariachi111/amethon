import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { hooks, metaMask } from './connectors/metamask';

const { useChainId, useAccounts, useError, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

function App() {

  const provider = useProvider(4);

  const connect = () => {
    metaMask.activate(4);

  }

  useEffect(() => {
    if (!provider) return;
    provider.getBlockNumber().then(console.log)
  }, [provider]);
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        
        <button onClick={() => connect()}>activate</button>
        <p></p>
      </header>
    </div>
  );
}

export default App;
