import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectContractState, setGroupAction } from '../../reducers/contractReducer';
import { LoadStatusEnum } from '../../models';
import Loader from '../shared/Loader';
import './Groups.css';

export default function Groups() {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selectContractState);

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
                        onClick={() => dispatch(setGroupAction(group))}
                    >
                        {group.title}
                    </div>
                )}
            </div>

            {/* {error &&
                <div className='container__error'>
                    {error.message}
                </div>} */}
        </div>
    )
}
