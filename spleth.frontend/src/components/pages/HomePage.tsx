import { useAppSelector } from '../../app/hooks'
import { selectContractAddress } from '../../reducers/contractReducer'
import Balance from '../commands/Balance'
import Spend from '../commands/Spend'
import Transactions from '../commands/Transactions'
import Users from '../commands/Users'
import Withdraw from '../commands/Withdraw'
import ContractInfo from '../ContractInfo'
import Groups from '../sections/Groups'
import './HomePage.css';

export default function HomePage() {
    const storeContractAddress = useAppSelector(selectContractAddress);

    return (
        <div className='home'>
            <div className='home__groups container'>
                <div className='container__title'>Groups</div>
                <Groups />
            </div>
            <div className='home__group'>
                {!storeContractAddress &&
                    <div>

                    </div>
                }
                {storeContractAddress &&
                    <>
                        <ContractInfo />
                        <Users />
                        <Balance />
                        <Spend />
                        <Withdraw />
                        {/* <Transactions /> */}
                    </>
                }
            </div>
        </div>
    )
}
