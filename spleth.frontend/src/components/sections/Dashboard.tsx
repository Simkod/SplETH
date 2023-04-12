import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useAccount, useBalance, useContractRead } from 'wagmi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectContractABI, selectContractState, selectNeedFetchBalance, setIsOwnerAction, setNeedFetchBalanceAction } from '../../reducers/contractReducer';
import truncateEthAddress from '../../utils/address';
import Users from '../commands/Users';
import Emoji from '../shared/Emoji';
import Loader from '../shared/Loader';
import './Dashboard.css';

export default function Dashboard() {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selectContractState);

    const selectedContractABI = useAppSelector(selectContractABI);
    const needFetchBalance = useAppSelector(selectNeedFetchBalance);

    const [balance, setBalance] = useState<string>('');
    const [owner, setOwner] = useState<string>('');

    const { data: balanceData, isError: balanceIsError, error: balanceError, isLoading: balanceIsLoading, refetch: contractBalanceRefetch } = useBalance({
        address: state.group?.address as any,
    });

    const { address } = useAccount();
    const { error, isFetching: userContractBalanceIsFetching, isFetched: userContractBalanceIsFetched, refetch: userContractBalanceRefetch } = useContractRead({
        address: state.group?.address as any,
        abi: selectedContractABI,
        functionName: 'getBalance',
        args: [address],
        onError: (error) => setBalance('***'),
        onSuccess: (data: BigNumber[]) => {
            console.log('getBalance', ethers.utils.formatUnits(data[0]), ethers.utils.formatUnits(data[1]));

            setBalance(ethers.utils.formatUnits(data[0]))
        }
    });

    const { error: ownerError, isFetching: ownerIsFetching, isFetched: ownerIsFetched, refetch: ownerRefetch } = useContractRead({
        address: state.group?.address as any,
        abi: selectedContractABI,
        functionName: 'owner',
        onError: (error) => {
            setOwner('');
            dispatch(setIsOwnerAction(false));
        },
        onSuccess: (data: string) => {
            setOwner(data);
            dispatch(setIsOwnerAction(data === address));
        }
    });

    useEffect(() => {
        const update = async () => {
            await contractBalanceRefetch();
            await userContractBalanceRefetch();
            dispatch(setNeedFetchBalanceAction(false));
        }

        if (needFetchBalance) {
            update();
        }
    }, [needFetchBalance]);


    return (
        <div className='container'>
            <div className='dashboard__header'>
                <div className='dashboard__header-title'>
                    {state.group?.title}
                    <a
                        href={`https://mumbai.polygonscan.com/address/${state.group?.address}`}
                        style={{ margin: '0 10px' }}
                        title='Open mumbai.polygonscan.com'
                        className='button'
                        target='_blank'
                    >
                        <Emoji symbol='🔗' />
                    </a>
                </div>
                <div className='dashboard__pin'>
                    <div className='dashboard__pin-title'>Owner</div>
                    <div className='dashboard__pin-balance'>{owner === address ? 'You' : truncateEthAddress(owner)}</div>
                </div>
                <div className='dashboard__pin'>
                    {userContractBalanceIsFetching && <Loader />}
                    {error &&
                        <div className='container__error'>
                            {error.message}
                        </div>}
                    {!userContractBalanceIsFetching && userContractBalanceIsFetched &&
                        <>
                            <div className='dashboard__pin-title'>Your Balance</div>
                            <div className='dashboard__pin-balance' title={balance}>
                                {balance?.length > 3 ? Number(balance)?.toFixed(3) : balance} &nbsp;
                                {state.ercToken?.symbol}
                            </div>
                        </>}
                </div>
                <div className='dashboard__pin dashboard__pin--colored'>
                    {balanceIsLoading && <Loader />}
                    {!balanceIsLoading && balanceData &&
                        <>
                            <div className='dashboard__pin-title'>Smart Contract Balance</div>
                            <div className='dashboard__pin-balance' title={balanceData?.formatted}>
                                {balanceData?.formatted?.length > 3 ? Number(balanceData?.formatted)?.toFixed(3) : balanceData?.formatted} &nbsp;
                                {state.ercToken?.symbol}
                            </div>
                        </>}
                </div>
            </div>


            {balanceIsError &&
                <div className='container__error'>Error: {balanceError?.message}</div>}

            <Users />
        </div>
    )
}
