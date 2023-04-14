import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectContractState } from '../../reducers/contractReducer';
import truncateEthAddress from '../../utils/address';
import Loader from '../shared/Loader';
import AddUser from './AddUser';
import './Users.css';
import { LoadStatusEnum } from '../../models';

export default function Users() {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selectContractState);

    const { address } = useAccount();

    return (
        <div className='users'>
            {state.usersStatus === LoadStatusEnum.loading && <Loader />}
            {state.usersStatus !== LoadStatusEnum.loading &&
                <>
                    <div style={{ display: 'flex' }}>
                        <div className='users__title'>
                            {state.usersStatus === LoadStatusEnum.idle ? '' : state.users.length ? `${state.users.length} Members` : 'Member list is empty'}
                        </div>
                        <div className='users__title-balance'>
                            Balance
                        </div>
                    </div>


                    <div className='users__list'>
                        {state.users.map(user =>
                            <div className='users__list-item' key={user.address}>
                                <img className='users__avatar' src={`https://effigy.im/a/${user.address}.png`}></img>
                                <span style={{ flexGrow: 1 }}>
                                    {address === user.address && <span style={{ marginRight: '10px', userSelect: 'none' }}>You</span>}
                                    <span className='users__list-item-adress--hidden'>{user.address}</span>
                                    <span className='users__list-item-adress'>{truncateEthAddress(user.address)}</span>
                                </span>
                                {state.usersBalanceStatus === LoadStatusEnum.loading && <Loader height={30} />}
                                {state.usersBalanceStatus !== LoadStatusEnum.loading &&
                                    <span className={`users__list-item-balance ${user.balance && Number(user.balance) > 0 ? 'users__list-item-balance--positive' : ''}`}>
                                        {user.balance && Number(ethers.utils.formatUnits(user.balance)).toFixed(2)}
                                    </span>}
                            </div>
                        )}
                    </div>
                </>}

            <AddUser />
        </div>
    )
}
