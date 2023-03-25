import { useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { ethers, BigNumber } from 'ethers';
import { selectContractAddress, selectContractABI } from '../../reducers/contractReducer';
import { useAppSelector } from '../../app/hooks';
import Loader from '../shared/Loader';

export default function MyBalance() {
    const contractAddress = useAppSelector(selectContractAddress);
    const contractABI = useAppSelector(selectContractABI);

    const [balance, setBalance] = useState<string>('');

    const { address } = useAccount();
    const { error, isFetching, isFetched } = useContractRead({
        address: contractAddress,
        abi: contractABI,
        functionName: 'getBalance',
        args: [address],
        onError: (error) => setBalance('***'),
        onSuccess: (data: BigNumber) => setBalance(ethers.utils.formatUnits(data))
    });

    return (
        <div className='dashboard__pin'>
            {isFetching && <Loader />}
            {error &&
                <div className='container__error'>
                    {error.message}
                </div>}
            {isFetched &&
                <div>{balance}</div>
            }
        </div>
    )
}
