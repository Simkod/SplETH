import { useState } from 'react'
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectContractFactoryABI, selectContractFactoryAddress, setNeedFetchGroupsAction } from '../../reducers/contractReducer';
import './NewGroup.css';

export default function NewGroup() {
    const dispatch = useAppDispatch();
    const contractFactoryAddress = useAppSelector(selectContractFactoryAddress);
    const contractFactoryABI = useAppSelector(selectContractFactoryABI);

    const [title, setTitle] = useState<string>('');
    const [memberAddress, setMemberAddress] = useState<string>('');
    const [memberAddresses, setMemberAddresses] = useState<string[]>([]);

    const {
        config,
        error: prepareError,
        isError: isPrepareError
    } = usePrepareContractWrite({
        address: contractFactoryAddress as any,
        abi: contractFactoryABI,
        functionName: 'createContract',
        args: [memberAddresses, title],
        enabled: !!(memberAddresses.length && title),
        onError: (error) => console.error('createContract', error),
    });
    const { data, error, isError, write } = useContractWrite(config);
    const { isLoading, isSuccess, data: data2 } = useWaitForTransaction({
        hash: data?.hash,
        onSuccess(data) {
            setTitle('');
            setMemberAddress('');
            setMemberAddresses([]);
            dispatch(setNeedFetchGroupsAction(true));
        },
    });


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
                        <span style={{ flexGrow: 1 }}>{address}</span>
                        <span>
                            <button onClick={() => onRemoveClick(address)}>Remove</button>
                        </span>
                    </div>
                )}
            </div>
            <div>
                <button disabled={!write || isLoading} onClick={() => write?.()}>
                    {isLoading ? 'Publishing...' : 'Publish'}
                </button>
            </div>
            {(isPrepareError || isError) && (
                <div className='container__error'>
                    Error: {(prepareError || error)?.message} <br />
                    {/* {(prepareError || error as any)?.data?.message} */}
                </div>
            )}
        </div>
    )
}
