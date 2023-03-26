import { useState } from 'react';
import { useContractRead, useAccount } from 'wagmi';
import { useAppSelector } from '../../app/hooks';
import { selectContractABI, selectContractAddress } from '../../reducers/contractReducer';
import truncateEthAddress from '../../utils/address';
import Loader from '../shared/Loader';
import AddUser from './AddUser';
import './Users.css';

export default function Users() {
    const contractAddress = useAppSelector(selectContractAddress);
    const contractABI = useAppSelector(selectContractABI);

    const [users, setUsers] = useState<any[]>([]);

    const { address } = useAccount();
    const { error, isFetching: getAllUsersIsFetching, isFetched: getAllUsersIsFetched } = useContractRead({
        address: contractAddress as any,
        abi: contractABI,
        functionName: 'getAllUsers',
        onError: (error) => console.error('getAllUsers', error),
        onSuccess: (data: any[]) => setUsers(data as any[])
    });

    return (
        <div className='users'>
            {getAllUsersIsFetching && <Loader />}
            {getAllUsersIsFetched &&
                <>
                    <div className='users__title'>
                        {users.length ? `${users.length} Members` : 'Member list is empty'}
                    </div>

                    <div className='users__list'>
                        {users.map(user =>
                            <div className='users__list-item' key={user}>
                                <img className='users__avatar' src={`https://effigy.im/a/${user}.png`}></img>
                                {address === user && <span style={{ marginRight: '10px' }}>You</span>}
                                <span className='users__list-item-adress--hidden'>{user}</span>
                                <span className='users__list-item-adress'>{truncateEthAddress(user)}</span>
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
