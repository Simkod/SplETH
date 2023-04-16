import { ChangeEvent, useState } from 'react';
import { useAccount, useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchGroupsAsync, selectContractState } from '../../reducers/contractReducer';
import './NewGroup.css';

import { GelatoRelay, SponsoredCallRequest } from "@gelatonetwork/relay-sdk";
import { ethers } from 'ethers';

export default function NewGroup() {
    const { address: walletAddress } = useAccount();
    const { chain } = useNetwork();

    const dispatch = useAppDispatch();
    const state = useAppSelector(selectContractState);

    const [title, setTitle] = useState<string>('');
    const [selectedToken, setSelectedToken] = useState('');
    const [memberAddress, setMemberAddress] = useState<string>('');
    const [memberAddresses, setMemberAddresses] = useState<string[]>([walletAddress as string]);
    const [sponsorLoading, setSponsorLoading] = useState(false);

    const selectedTokenRequest = selectedToken === 'matic' ? '' : selectedToken;

    // create by user wallet
    const {
        config,
        error: prepareError,
        isError: isPrepareError
    } = usePrepareContractWrite({
        address: state.contractFactoryAddress,
        abi: state.contractFactoryABI,
        functionName: 'createContract',
        args: [memberAddresses, title, selectedTokenRequest, walletAddress],
        enabled: !state.sponsored && !!(memberAddresses.length && title),
        onError: (error) => console.error('createContract', error),
    });
    const { data, error, isError, write } = useContractWrite(config);
    const { isLoading, isSuccess, data: data2 } = useWaitForTransaction({
        hash: data?.hash,
        onSuccess(data) {
            setTitle('');
            setMemberAddress('');
            setMemberAddresses([]);
            dispatch(fetchGroupsAsync());
            console.log('created group', data);
        },
    });

    // create by sponsor
    const onPublishClick = async () => {
        setSponsorLoading(true);
        const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
        const privateKey = "f8c8ea1fad03de01cca8f439ffdb021f459d8b7579d09730c533168fea6a50fe"; // Our account
        const signer = new ethers.Wallet(privateKey, provider);

        // Set up SplitFundsContractFactory contract
        const factoryAbi = [
            "function createContract(address[] memory addresses, string calldata title, string calldata ercAddress, address owner) external returns (address)",
            "function getAllAddresses() public view returns (address[] memory)"
        ];
        const factoryContract = new ethers.Contract(state.contractFactoryAddress, factoryAbi, signer);

        // Get transaction data for createContract function
        const createContractData = factoryContract.interface.encodeFunctionData("createContract", [memberAddresses, title, selectedTokenRequest, walletAddress]);

        // Set up request object
        const request = {
            chainId: chain?.id,
            target: state.contractFactoryAddress,
            data: createContractData,
        } as SponsoredCallRequest;

        // Set up sponsor API key
        const sponsorApiKey = "Ojyefg2_hBHRdor1_9q8r1KJRStsw172iFGM999RzXY_"; //Gelato API

        try {
            const groupsLength = state.groups.length;
            // Execute sponsored transaction
            const relay = new GelatoRelay();
            const relayResponse = await relay.sponsoredCall(request, sponsorApiKey);
            console.log(`https://relay.gelato.digital/tasks/status/${relayResponse.taskId}`);

            setTitle('');
            setMemberAddress('');
            setMemberAddresses([]);

            const timer = setInterval(async () => {
                const transactionStatusResponse = await relay.getTaskStatus(relayResponse.taskId);
                console.info('transactionStatusResponse', transactionStatusResponse);
                if (transactionStatusResponse?.taskState === "ExecSuccess") {
                    setSponsorLoading(false);
                    dispatch(fetchGroupsAsync());
                    clearInterval(timer);
                }
            }, 1000);

        } catch (error) {
            setSponsorLoading(false);
            console.error('sponsor onPublishClick', error);
        }
    }

    const onAddClick = () => {
        if (!memberAddresses.includes(memberAddress)) {
            setMemberAddresses([...memberAddresses, memberAddress]);
        }
    }

    const onRemoveClick = (address: string) => {
        setMemberAddresses(memberAddresses.filter(p => p != address));
    }

    return (
        <div className='new-group container'>
            <div className='container__title'>New Group</div>
            <div style={{ display: 'flex' }}>
                <input
                    type='text'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='Group Title'
                    style={{ flexGrow: 1 }}
                />
            </div>
            <div style={{ display: 'flex' }}>
                <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    style={{ flexGrow: 1 }}
                >
                    <option disabled hidden value="">Select token</option>
                    <option value="matic">Native network token (MATIC)</option>
                    {state.erc20Tokens.map(token =>
                        <option key={token.address} value={token.address}>{token.title} ({token.symbol})</option>)}
                </select>
            </div>
            <div style={{ display: 'flex' }}>
                <input
                    type='text'
                    value={memberAddress}
                    onChange={(e) => setMemberAddress(state => e.target.value === '' || e.target.value.match(/^0x[a-fA-F0-9]{40}$/ig) ? e.target.value : state)}
                    placeholder='Member address'
                    style={{ flexGrow: 1 }}
                />
                <button disabled={!memberAddress} onClick={onAddClick}>Add</button>
            </div>
            <div className='new-group__members'>
                {memberAddresses.map(address =>
                    <div key={address} className='new-group__members-item'>
                        <img className='new-group__avatar' src={`https://effigy.im/a/${address}.png`}></img>
                        <span style={{ flexGrow: 1 }}>
                            {walletAddress === address && <span style={{ marginRight: '10px' }}>You</span>}
                            {address}
                        </span>
                        {walletAddress !== address &&
                            <span>
                                <button onClick={() => onRemoveClick(address)}>Remove</button>
                            </span>
                        }
                    </div>
                )}
            </div>
            {state.sponsored &&
                <div>
                    <button disabled={sponsorLoading} onClick={() => onPublishClick()}>
                        {sponsorLoading ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            }
            {!state.sponsored &&
                <div>
                    <button disabled={!write || isLoading} onClick={() => write?.()}>
                        {isLoading ? 'Publishing...' : 'Publish'}
                    </button>
                    {(isPrepareError || isError) && (
                        <div className='container__error'>
                            Error: {(prepareError || error)?.message} <br />
                        </div>
                    )}
                </div>
            }
        </div>
    )
}
