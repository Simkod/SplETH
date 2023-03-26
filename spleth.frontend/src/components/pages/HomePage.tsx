import { useAppSelector } from '../../app/hooks'
import { selectContractAddress } from '../../reducers/contractReducer'
import Deposit from '../commands/Deposit'
import Spend from '../commands/Spend'
import Transactions from '../commands/Transactions'
import Withdraw from '../commands/Withdraw'
import Dashboard from '../sections/Dashboard'
import Groups from '../sections/Groups'
import NewGroup from '../sections/NewGroup'
import './HomePage.css';

export default function HomePage() {
    const selectedContractAddress = useAppSelector(selectContractAddress);

    return (
        <div className={`home ${selectedContractAddress !== undefined ? 'home--selected-address' : ''}`}>
            <div className='home__groups container'>
                <div className='container__title'>Groups</div>
                <Groups />
            </div>

            <div className='home__group'>
                {selectedContractAddress === null &&
                    <>
                        <NewGroup />
                    </>
                }
                {selectedContractAddress &&
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
