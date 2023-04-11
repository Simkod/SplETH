import {
    useAccount,
    useConnect,
    useDisconnect,
    useEnsAvatar,
    useEnsName,
    useNetwork,
} from 'wagmi';
import { polygon, polygonMumbai } from 'wagmi/chains';
import truncateEthAddress from '../utils/address';
import { fetchGroupsAsync, setChainAction } from '../reducers/contractReducer';
import { useAppDispatch } from '../app/hooks';

export default function Connector() {
    const dispatch = useAppDispatch();

    const { address, connector, isConnected } = useAccount({
        onConnect() {
            if (chain) {
                dispatch(setChainAction(chain.id.toString()));
                dispatch(fetchGroupsAsync());
            }
        }
    });
    //const { data: ensAvatar, error: ensAvatarError } = useEnsAvatar({ address, chainId });
    //const { data: ensName, error: ensNameError } = useEnsName({ address, chainId });
    const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
    const { chain, chains } = useNetwork();
    const { disconnect } = useDisconnect();

    if (isConnected) {
        return (
            <>
                {/* <img src={ensAvatar ?? undefined} alt='ENS Avatar' />
                <div>{ensName ? `${ensName} (${address})` : address}</div> */}
                <button onClick={() => disconnect()}>Disconnect {truncateEthAddress(address?.toString())}</button>

                {chain?.id !== polygonMumbai.id && <div className='container__warning'>
                    The selected network is not supported.<br />
                    Please, choose <b>{polygonMumbai.name}</b>
                </div>}
            </>
        )
    }

    return (
        <>
            {connectors.map((connector) => (
                <button
                    disabled={!connector.ready}
                    key={connector.id}
                    onClick={() => connect({ connector })}
                >
                    Connect {/* {connector.name} */}
                    {!connector.ready && ' (unsupported)'}
                    {isLoading &&
                        connector.id === pendingConnector?.id &&
                        ' (connecting)'}
                </button>
            ))}

            {error && <div>{error.message}</div>}
        </>
    )
}
