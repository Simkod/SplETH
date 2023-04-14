import { useAppSelector } from '../../app/hooks'
import { selectContractState } from '../../reducers/contractReducer'
import Deposit from '../commands/Deposit'
import Spend from '../commands/Spend'
import Transactions from '../commands/Transactions'
import Withdraw from '../commands/Withdraw'
import Dashboard from '../sections/Dashboard'
import Groups from '../sections/Groups'
import NewGroup from '../sections/NewGroup'
import './HomePage.css';

export default function HomePage() {
    const state = useAppSelector(selectContractState);

    return (
        <div className={`home ${state.group !== undefined ? 'home--selected-address' : ''}`}>
            <div className='home__groups container'>
                <div className='container__title'>Groups</div>
                <Groups />
            </div>

            <div className='home__group'>
                {state.group === null &&
                    <>
                        <NewGroup />
                    </>
                }
                {state.group &&
                    <>
                        <Dashboard />
                        <div style={{ display: 'flex' }}>
                            <div style={{ flexGrow: '1' }}>
                                <Spend />
                            </div>
                            <div style={{ flexGrow: '1' }}>
                                <Deposit />
                                <Withdraw />
                            </div>
                        </div>

                        <Transactions />
                    </>
                }
            </div>

        </div>
    )
}
