import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchBalanceAsync, fetchERCTokenInfoAsync, fetchUsersAsync, fetchUsersBalanceAsync, selectContractState, setGroupAction } from '../../reducers/contractReducer';
import { Group, LoadStatusEnum } from '../../models';
import Loader from '../shared/Loader';
import './Groups.css';

export default function Groups() {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selectContractState);

    const onSetGroupClick = async (group: Group) => {
        await dispatch(setGroupAction(group));
        await dispatch(fetchERCTokenInfoAsync());
        dispatch(fetchBalanceAsync());
        (async () => {
            await dispatch(fetchUsersAsync());
            await dispatch(fetchUsersBalanceAsync());
        })();
    };

    if (state.groupsStatus === LoadStatusEnum.loading)
        return (<Loader />);

    return (
        <div className='groups'>
            <div className='groups__items'>
                <div
                    className={`groups__item button ${state.group === null ? 'groups__item--selected' : ''}`}
                    onClick={() => dispatch(setGroupAction(null))}
                >
                    Add new group
                </div>

                {state.groups.map(group =>
                    <div
                        key={group.address}
                        className={`groups__item button ${state.group?.address === group.address ? 'groups__item--selected' : ''}`}
                        onClick={() => onSetGroupClick(group)}
                    >
                        {group.title}
                    </div>
                )}
            </div>
        </div>
    )
}
