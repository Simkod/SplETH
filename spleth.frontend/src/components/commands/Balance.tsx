import { useState } from 'react';
import { useContractRead } from 'wagmi';
import { ethers, BigNumber } from 'ethers';
import Deposit from './Deposit';
import { selectContractAddress, selectContractABI } from '../../reducers/contractReducer';
import { useAppSelector } from '../../app/hooks';

export default function Balance() {
    const contractAddress = useAppSelector(selectContractAddress);
    const contractABI = useAppSelector(selectContractABI);
    const [balance, setBalance] = useState();
    const { error, isFetching: getBalanceIsFetching, isFetched: getBalanceIsFetched, refetch } = useContractRead({
        enabled: !contractAddress,
        address: contractAddress,
        abi: contractABI,
        functionName: 'getBalance',
        onError: (error) => console.error('getBalance', error),
        onSuccess: (data: BigNumber) => console.log('getBalance', ethers.utils.formatUnits(data))
    });

    const onGetBalanceClick = async () => {
        const response = await refetch();
        console.log('getBalance', response);
        if (response?.data) {
            setBalance((response.data as any).toNumber());
        }
    };

    return (
        <div className='container'>
            <div className='container__title'>Balance</div>
            <div>
                <button onClick={onGetBalanceClick} disabled={getBalanceIsFetching}>
                    getBalance
                    {getBalanceIsFetching && ' (loading)'}
                </button>
                {error &&
                    <div className='container__error'>
                        {error.message}
                    </div>}
                {getBalanceIsFetched &&
                    <div className='container__warning'>{balance}</div>
                }
            </div>
            <div className='container__separator'></div>
            <div>
                <Deposit />
            </div>
        </div>
    )
}
