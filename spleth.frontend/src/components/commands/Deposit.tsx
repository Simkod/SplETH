import { ethers } from 'ethers';
import { useState } from 'react';
import {
    useAccount,
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction,
} from 'wagmi';
import { useAppSelector } from '../../app/hooks';
import useDebounce from '../../hooks/useDebounce';
import { selectContractABI, selectContractAddress } from '../../reducers/contractReducer';

export default function Deposit() {
    const contractAddress = useAppSelector(selectContractAddress);
    const contractABI = useAppSelector(selectContractABI);

    const [amount, setAmount] = useState('0.05');
    const [debouncedAmount] = useDebounce(amount);

    const { address } = useAccount();
    const {
        config,
        error: prepareError,
        isError: isPrepareError
    } = usePrepareContractWrite({
        address: contractAddress,
        abi: contractABI,
        functionName: 'deposit',
        enabled: Boolean(debouncedAmount),
        overrides: {
            from: address,
            value: amount ? ethers.utils.parseEther(amount) : undefined
        },
        onError: (error) => console.error('deposit', error),
        onSuccess: (data) => console.log('deposit', data)
    });
    const { data, error, isError, write } = useContractWrite(config);
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

    return (
        <div>
            <input
                type='text'
                onChange={(e) => setAmount(e.target.value)}
                placeholder='0.05'
                value={amount}
            />
            <button disabled={isLoading || !write || !amount} onClick={() => write?.()}>
                {isLoading ? 'Sending...' : 'Deposit'}
            </button>
            {isSuccess && (
                <div className='container__success'>
                    Successfully sent {amount} matic to {contractAddress}
                    <div>
                        <a href={`https://mumbai.polygonscan.com/tx/${data?.hash}`} target='_blank'>mumbai.polygonscan.com</a>
                    </div>
                </div>
            )}
            {(isPrepareError || isError) && (
                <div className='container__error' style={{ maxWidth: '40em' }}>
                    Error: {(prepareError || error)?.message} <br />
                    {(prepareError || error as any)?.data?.message}
                </div>
            )}
        </div>
    )
}