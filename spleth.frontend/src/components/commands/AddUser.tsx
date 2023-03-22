import { useState } from 'react'
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { useAppSelector } from '../../app/hooks';
import useDebounce from '../../hooks/useDebounce';
import { selectContractABI, selectContractAddress } from '../../reducers/contractReducer';

export default function AddUser() {
    const contractAddress = useAppSelector(selectContractAddress);
    const contractABI = useAppSelector(selectContractABI);
    const [newUserAddress, setNewUserAddress] = useState('');
    const debouncedUserAddress = useDebounce(newUserAddress);
    const {
        config,
        error: prepareError,
        isError: isPrepareError
    } = usePrepareContractWrite({
        address: contractAddress,
        abi: contractABI,
        functionName: 'addUser',
        args: [debouncedUserAddress],
        enabled: Boolean(debouncedUserAddress),
        onError: (error) => console.error('addUser', error),
    });
    const { data, error, isError, write } = useContractWrite(config);
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

    return (
        <div>
            <input type='text' value={newUserAddress} onChange={(e) => setNewUserAddress(e.target.value)} placeholder='Address' />
            <button disabled={!write || isLoading} onClick={() => write?.()}>
                {isLoading ? 'Adding User...' : 'addUser'}
            </button>
            {isSuccess && (
                <div className='container__success'>
                    Successfully added new user!
                    <div>
                        <a href={`https://mumbai.polygonscan.com/tx/${data?.hash}`} target='_blank'>mumbai.polygonscan.com</a>
                    </div>
                </div>
            )}
            {(isPrepareError || isError) && (
                <div className='container__error'>Error: {(prepareError || error)?.message}</div>
            )}
        </div>
    )
}
