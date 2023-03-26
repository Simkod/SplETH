import { useState } from 'react'
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import useDebounce from '../../hooks/useDebounce';
import { selectContractABI, selectContractAddress, setNeedFetchUsersAction } from '../../reducers/contractReducer';
import Emoji from '../shared/Emoji';

export default function AddUser() {
    const dispatch = useAppDispatch();
    const contractAddress = useAppSelector(selectContractAddress);
    const contractABI = useAppSelector(selectContractABI);

    const [newUserAddress, setNewUserAddress] = useState('');
    const debouncedUserAddress = useDebounce(newUserAddress);

    const {
        config,
        error: prepareError,
        isError: isPrepareError
    } = usePrepareContractWrite({
        address: contractAddress as any,
        abi: contractABI,
        functionName: 'addUser',
        args: [debouncedUserAddress],
        enabled: Boolean(debouncedUserAddress),
        onError: (error) => console.error('addUser', error),
    });
    const { data, error, isError, write } = useContractWrite(config);
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
        onSuccess(data) {
            setNewUserAddress('');
            dispatch(setNeedFetchUsersAction(true));
        },
    });

    return (
        <>
            <div style={{ display: 'flex' }}>
                <input
                    type='text'
                    value={newUserAddress}
                    onChange={(e) => setNewUserAddress(state => e.target.value === '' || e.target.value.match(/^0x[a-fA-F0-9]{40}$/ig) ? e.target.value : state)}
                    placeholder='Address'
                    style={{ flexGrow: 1 }}
                />
                <button disabled={!write || isLoading} onClick={() => write?.()}>
                    {isLoading ? 'Adding User...' : 'Add User'}
                </button>
            </div>
            <div>
                {isSuccess && (
                    <div className='container__success'>
                        Successfully added new user!
                        <a className='button' href={`https://mumbai.polygonscan.com/tx/${data?.hash}`} target='_blank'><Emoji symbol='🔗' /></a>
                    </div>
                )}
                {(isPrepareError || isError) && (
                    <div className='container__error'>Error: {(prepareError || error)?.message}</div>
                )}
            </div>
        </>
    )
}
