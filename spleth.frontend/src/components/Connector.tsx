import {
    useAccount,
    useConnect,
    useDisconnect,
    useEnsAvatar,
    useEnsName,
    useNetwork,
} from 'wagmi';
import { polygon, polygonMumbai } from 'wagmi/chains';

export default function Connector() {
    const { address, connector, isConnected } = useAccount();
    //const { data: ensAvatar, error: ensAvatarError } = useEnsAvatar({ address, chainId });
    //const { data: ensName, error: ensNameError } = useEnsName({ address, chainId });
    const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
    const { chain, chains } = useNetwork();
    const { disconnect } = useDisconnect();

    if (isConnected) {
        return (
            <div className='container'>
                <div className='container__title'>Wallet</div>
                {/* <img src={ensAvatar ?? undefined} alt='ENS Avatar' />
                <div>{ensName ? `${ensName} (${address})` : address}</div> */}
                <div>My address - {address}</div>
                <div>Connected to {connector?.name}</div>
                <div>{chain?.id} - {chain?.name}</div>
                <button onClick={() => disconnect()}>Disconnect</button>

                {(chain?.id !== polygonMumbai.id) && <div className='container__warning'>
                    The selected network is not supported.<br />
                    Please, choose <b>{polygonMumbai.name}</b>
                </div>}
            </div>
        )
    }

    return (
        <div className='container'>
            <div className='container__title'>Wallet</div>
            {connectors.map((connector) => (
                <button
                    disabled={!connector.ready}
                    key={connector.id}
                    onClick={() => connect({ connector })}
                >
                    {connector.name}
                    {!connector.ready && ' (unsupported)'}
                    {isLoading &&
                        connector.id === pendingConnector?.id &&
                        ' (connecting)'}
                </button>
            ))}

            {error && <div>{error.message}</div>}
        </div>
    )
}
