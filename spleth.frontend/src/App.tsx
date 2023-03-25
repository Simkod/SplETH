import { arbitrum, mainnet, polygon, goerli, polygonMumbai } from 'wagmi/chains';
import { WagmiConfig, createClient, configureChains, useAccount } from 'wagmi';
import { alchemyProvider } from '@wagmi/core/providers/alchemy';
import { publicProvider } from '@wagmi/core/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { Alchemy, Network } from "alchemy-sdk";
import './App.css';
import Connector from './components/Connector';
import Emoji from './components/shared/Emoji';
import HomePage from './components/pages/HomePage';

const alchemyApiKey = 'wf2SMtBe-9wnb_zUVo-UT8bpOOE4Hyh5';
const { chains, provider, webSocketProvider } = configureChains(
  [polygonMumbai, polygon],
  [alchemyProvider({ apiKey: alchemyApiKey }), publicProvider()],
);
const client = createClient({
  connectors: [
    new MetaMaskConnector({ chains }),
  ],
  autoConnect: true,
  persister: null,
  provider,
  webSocketProvider
});

const config = {
  apiKey: alchemyApiKey,
  network: Network.MATIC_MUMBAI,
};
const alchemy = new Alchemy(config);
window.alchemy = alchemy;

function App() {
  const { isConnected } = useAccount();

  return (
    <>
      <WagmiConfig client={client}>
        <div className='app'>
          <header className={`app__header ${isConnected ? '' : 'app__header--disconnected'}`}>
            <div className='app_logo'>
              <Emoji symbol='💰' size='60px' />
              <h2 style={{ marginTop: 0 }}>SplETH</h2>
            </div>
            <div>
              <Connector />
            </div>
          </header>
          <div>
            {isConnected &&
              <HomePage />
            }
          </div>
        </div>
      </WagmiConfig>
    </>
  );
}

export default App;
