import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectContractState, setIsOwnerAction } from '../../reducers/contractReducer';
import truncateEthAddress from '../../utils/address';
import Users from '../commands/Users';
import Emoji from '../shared/Emoji';
import Loader from '../shared/Loader';
import './Dashboard.css';
import { LoadStatusEnum } from '../../models';

export default function Dashboard() {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selectContractState);

    const [owner, setOwner] = useState<string>('');

    const { address } = useAccount();

    const { error: ownerError, isFetching: ownerIsFetching, isFetched: ownerIsFetched, refetch: ownerRefetch } = useContractRead({
        address: state.group?.address,
        abi: state.contractABI,
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
                    {state.balanceStatus === LoadStatusEnum.loading && <Loader />}
                    {state.balanceStatus !== LoadStatusEnum.loading &&
                        <>
                            <div className='dashboard__pin-title'>Your Balance</div>
                            <div className='dashboard__pin-balance' title={state.balanceWallet.toString()}>
                                {Number(ethers.utils.formatUnits(state.balanceWallet)).toFixed(2)} &nbsp;
                                {state.erc20Token?.symbol}
                            </div>
                        </>}
                </div>
                <div className='dashboard__pin dashboard__pin--colored'>
                    {state.balanceStatus === LoadStatusEnum.loading && <Loader />}
                    {state.balanceStatus !== LoadStatusEnum.loading &&
                        <>
                            <div className='dashboard__pin-title'>Smart Contract Balance</div>
                            <div className='dashboard__pin-balance' title={state.balanceGroup.toString()}>
                                {Number(ethers.utils.formatUnits(state.balanceGroup)).toFixed(2)} &nbsp;
                                {state.erc20Token?.symbol}
                            </div>
                        </>}
                </div>
            </div>

            <Users />
        </div>
    )
}
