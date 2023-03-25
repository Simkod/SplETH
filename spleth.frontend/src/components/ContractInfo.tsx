import { ChangeEvent, useState } from 'react';
import { useBalance } from 'wagmi';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectContractABI, selectContractAddress, setContractABIAction, setContractAddressAction } from '../reducers/contractReducer';
import Emoji from './shared/Emoji';

export default function ContractInfo() {
    const dispatch = useAppDispatch();
    const storeContractAddress = useAppSelector(selectContractAddress);
    const storeContractABI = useAppSelector(selectContractABI);
    const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined | string>(storeContractAddress);

    const { data: balanceData, isError: balanceIsError, error: balanceError, isLoading: balanceIsLoading } = useBalance({
        address: storeContractAddress,
    })


    return (
        <div className='container'>
            <div className='container__title'>
                Contract
                <a
                    href={`https://mumbai.polygonscan.com/address/${contractAddress}`}
                    style={{ margin: '0 10px' }}
                    title='Open mumbai.polygonscan.com'
                    className='button'
                    target='_blank'
                >
                    <Emoji symbol='🔗' />
                </a>
            </div>
            <div style={{ display: 'flex', margin: '10px 0' }}>
                <input
                    type='text'
                    onChange={(e) => setContractAddress(state => e.target.value === '' || e.target.value.match(/^0x[a-fA-F0-9]{40}$/ig) ? e.target.value : state)}
                    pattern={'^0x[a-fA-F0-9]{40}$'}
                    placeholder='0x...'
                    value={contractAddress}
                    style={{ flexGrow: 1 }}
                />

            </div>
            <div className='container__separator'></div>
            {balanceIsLoading && <div style={{ margin: '10px 0', padding: '5px' }}>Fetching balance...</div>}
            {balanceData &&
                <div className='container__success'>
                    Balance: {balanceData?.formatted} {balanceData?.symbol}
                </div>}
            {balanceIsError &&
                <div className='container__error'>Error: {balanceError?.message}</div>}
        </div>
    )
}
