import { useState } from 'react';
import { useContractRead } from 'wagmi';
import { useAppSelector } from '../../app/hooks';
import { selectContractABI, selectContractAddress } from '../../reducers/contractReducer';
import AddUser from './AddUser';

export default function Users() {
  const contractAddress = useAppSelector(selectContractAddress);
  const contractABI = useAppSelector(selectContractABI);

  const [users, setUsers] = useState<any[]>([]);
  const { error, isFetching: getAllUsersIsFetching, isFetched: getAllUsersIsFetched, refetch } = useContractRead({
    enabled: false,
    address: contractAddress,
    abi: contractABI,
    functionName: 'getAllUsers',
    onError: (error) => console.error('getAllUsers', error),
  });

  const onGetAllUsersClick = async () => {
    const response = await refetch();
    setUsers(response.data as any[]);
  };

  return (
    <div className='container'>
      <div className='container__title'>Users</div>
      <div>
        <button onClick={onGetAllUsersClick} disabled={getAllUsersIsFetching}>
          {getAllUsersIsFetching ? 'Getting all users...' : 'getAllUsers'}
        </button>
        {error &&
          <div className='container__error'>
            {error.message}
          </div>}
        {getAllUsersIsFetched && users.length === 0 &&
          <div className='container__warning'>User list is empty</div>
        }
        <ul>
          {users.map(user =>
            <li key={user}>{user}</li>
          )}
        </ul>
      </div>
      <div className='container__separator'></div>
      <div>
        <AddUser />
      </div>
    </div>
  )
}
