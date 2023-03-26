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
import { isNumeric } from '../../utils';

export default function Deposit() {
    const contractAddress = useAppSelector(selectContractAddress);
    const contractABI = useAppSelector(selectContractABI);

    const [amount, setAmount] = useState('');
    const [debouncedAmount] = useDebounce(amount);

    const { address } = useAccount();
    const {
        config,
        error: prepareError,
        isError: isPrepareError
    } = usePrepareContractWrite({
        address: contractAddress as any,
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
        <>
            <div className='container'>
                <div className='container__title'>Deposit</div>
                <div style={{ display: 'flex' }}>
                    <input
                        type='text'
                        onChange={(e) => setAmount(state => e.target.value === '' || isNumeric(e.target.value) ? e.target.value : state)}
                        placeholder='Amount'
                        value={amount}
                        style={{ flexGrow: 1 }}
                    />
                    <button disabled={isLoading || !write || !amount} onClick={() => write?.()}>
                        {isLoading ? 'Sending...' : 'Deposit'}
                    </button>
                </div>
                <div>
                    {isSuccess && (
                        <div className='container__success'>
                            Successfully sent {amount} matic to {contractAddress}
                            <div>
                                <a href={`https://mumbai.polygonscan.com/tx/${data?.hash}`} target='_blank'>mumbai.polygonscan.com</a>
                            </div>
                        </div>
                    )}
                    {(isPrepareError || isError) && (
                        <div className='container__error'>
                            Error: {(prepareError || error)?.message} <br />
                            {(prepareError || error as any)?.data?.message}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}