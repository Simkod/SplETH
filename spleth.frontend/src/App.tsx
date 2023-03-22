import React from 'react';
import { arbitrum, mainnet, polygon, goerli, polygonMumbai } from 'wagmi/chains';
import { WagmiConfig, createClient, configureChains, useAccount } from 'wagmi';
import { alchemyProvider } from '@wagmi/core/providers/alchemy';
import { publicProvider } from '@wagmi/core/providers/public';
import { InjectedConnector } from '@wagmi/core/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import './App.css';
import Connector from './components/Connector';
import ContractInfo from './components/ContractInfo';
import Users from './components/commands/Users';
import Balance from './components/commands/Balance';
import Emoji from './components/shared/Emoji';
import Spend from './components/commands/Spend';

const { chains, provider, webSocketProvider } = configureChains(
  [polygonMumbai, polygon],
  [alchemyProvider({ apiKey: 'wf2SMtBe-9wnb_zUVo-UT8bpOOE4Hyh5' }), publicProvider()],
);
const client = createClient({
  connectors: [
    new MetaMaskConnector({ chains }),
    // new InjectedConnector({
    //   chains,
    //   options: {
    //     name: 'Injected',
    //     shimDisconnect: true,
    //   },
    // })
  ],
  autoConnect: true,
  persister: null,
  provider,
  webSocketProvider
});

function App() {
  const { isConnected } = useAccount();

  return (
    <>
      <WagmiConfig client={client}>
        <div className='App'>
          <header className='App-header'>
            <div>
              <div style={{ margin: '20px' }}>
                <Emoji symbol='💰' size='60px' />
                <h2 style={{ marginTop: '0px' }}>SplETH</h2>
              </div>
              <Connector />
              {isConnected &&
                <>
                  <ContractInfo />
                  <Users />
                  <Balance />
                  <Spend />
                </>
              }
            </div>
          </header>
        </div>
      </WagmiConfig>
    </>
  );
}

export default App;
