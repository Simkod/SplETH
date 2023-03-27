import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useContractRead, useAccount, readContracts } from 'wagmi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectContractABI, selectContractAddress, selectNeedFetchUsers, setNeedFetchUsersAction } from '../../reducers/contractReducer';
import truncateEthAddress from '../../utils/address';
import Loader from '../shared/Loader';
import AddUser from './AddUser';
import './Users.css';

export default function Users() {
    const dispatch = useAppDispatch();
    const needFetchUsers = useAppSelector(selectNeedFetchUsers);
    const contractAddress = useAppSelector(selectContractAddress);
    const contractABI = useAppSelector(selectContractABI);

    const [isFetchingGetBalance, setIsFetchingGetBalance] = useState<boolean>(false);
    const [users, setUsers] = useState<{ address: string, balance?: string }[]>([]);

    const { address } = useAccount();
    const { error, isFetching: getAllUsersIsFetching, isFetched: getAllUsersIsFetched, refetch: refetchGetAllUsers } = useContractRead({
        enabled: false,
        address: contractAddress as any,
        abi: contractABI,
        functionName: 'getAllUsers',
        onError: (error) => {
            setUsers([]);
            console.error('getAllUsers', error);
        },
        onSuccess: async (data: any[]) => {
            setUsers(data.map(p => ({ address: p })));
            loadBalance(data);
        }
    });

    useEffect(() => {
        refetchGetAllUsers();
        dispatch(setNeedFetchUsersAction(false));
    }, [contractAddress, needFetchUsers]);

    const loadBalance = async (userAddresses: string[]) => {
        setIsFetchingGetBalance(true);
        try {
            const response = await readContracts({
                contracts: userAddresses.map(address => {
                    return {
                        address: contractAddress,
                        abi: contractABI,
                        functionName: 'getBalance',
                        args: [address],
                    } as any;
                })
            });

            const _usersBalances: { address: string, balance?: string }[] = [];
            (response as BigNumber[]).forEach((balance, index) => {
                _usersBalances.push({
                    address: userAddresses[index],
                    balance: ethers.utils.formatUnits(balance)
                });
            });

            setUsers(_usersBalances);
        } catch (error) {
            console.error(error);
        }
        setIsFetchingGetBalance(false);
    };

    return (
        <div className='users'>
            {getAllUsersIsFetching && <Loader />}
            {getAllUsersIsFetched &&
                <>
                    <div style={{ display: 'flex' }}>
                        <div className='users__title'>
                            {users.length ? `${users.length} Members` : 'Member list is empty'}
                        </div>
                        <div className='users__title-balance'>
                            Balance
                        </div>
                    </div>


                    <div className='users__list'>
                        {users.map(user =>
                            <div className='users__list-item' key={user.address}>
                                <img className='users__avatar' src={`https://effigy.im/a/${user.address}.png`}></img>
                                <span style={{ flexGrow: 1 }}>
                                    {address === user.address && <span style={{ marginRight: '10px', userSelect: 'none' }}>You</span>}
                                    <span className='users__list-item-adress--hidden'>{user.address}</span>
                                    <span className='users__list-item-adress'>{truncateEthAddress(user.address)}</span>
                                </span>
                                {isFetchingGetBalance && <Loader height={30} />}
                                <span className={`users__list-item-balance ${user.balance && Number(user.balance) > 0 ? 'users__list-item-balance--positive' : ''}`}>
                                    {user.balance && user.balance.length > 3 ? Number(user.balance)?.toFixed(3) : user.balance}
                                </span>
                            </div>
                        )}
                    </div>

                    {error &&
                        <div className='container__error'>
                            {error.message}
                        </div>}
                </>}

            <AddUser />
        </div>
    )
}
