import { useAppSelector } from '../../app/hooks'
import { selectContractAddress } from '../../reducers/contractReducer'
import Spend from '../commands/Spend'
import Transactions from '../commands/Transactions'
import Withdraw from '../commands/Withdraw'
import Dashboard from '../sections/Dashboard'
import Groups from '../sections/Groups'
import './HomePage.css';

export default function HomePage() {
    const selectedContractAddress = useAppSelector(selectContractAddress);

    return (
        <div className={`home ${selectedContractAddress ? 'home--selected-address' : ''}`}>
            <div className='home__groups container'>
                <div className='container__title'>Groups</div>
                <Groups />
            </div>
            {selectedContractAddress &&
                <div className='home__group'>
                    {!selectedContractAddress &&
                        <div>

                        </div>
                    }
                    {selectedContractAddress &&
                        <>
                            <Dashboard />

                            <Spend />
                            <Withdraw />
                            {/* <Transactions /> */}
                        </>
                    }
                </div>
            }
        </div>
    )
}
