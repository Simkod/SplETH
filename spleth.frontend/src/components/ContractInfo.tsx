import { ChangeEvent, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectContractABI, selectContractAddress, setContractABIAction, setContractAddressAction } from '../reducers/contractReducer';

export default function ContractInfo() {
    const dispatch = useAppDispatch();
    const storeContractAddress = useAppSelector(selectContractAddress);
    const storeContractABI = useAppSelector(selectContractABI);
    const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>(storeContractAddress);
    const [contractABI, setContractABI] = useState(JSON.stringify(storeContractABI, null, 2));

    const onChangeContractAddress = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.match(/^0x[a-fA-F0-9]{40}$/ig)) {
            setContractAddress(e.target.value as `0x${string}`);
        }
    }

    const onButtonClick = () => {
        dispatch(setContractAddressAction(contractAddress));
        dispatch(setContractABIAction(JSON.parse(contractABI)));
    }

    return (
        <div className='container'>
            <div className='container__title'>Contract</div>
            <div>
                <div style={{ margin: '10px 0' }}>
                    <input
                        type='text'
                        onChange={onChangeContractAddress}
                        pattern={'^0x[a-fA-F0-9]{40}$'}
                        placeholder='0x...'
                        value={contractAddress}
                        style={{ minWidth: '465px' }}
                    />
                    <a href={`https://mumbai.polygonscan.com/address/${contractAddress}`} target='_blank' style={{ margin: '10px', textDecoration: 'none' }}>🔗</a>
                </div>
                <textarea
                    rows={5}
                    value={contractABI}
                    onChange={(e) => setContractABI(e.target.value)}
                    style={{ minWidth: '500px', margin: '10px 0' }}
                />
                <br />
                <button
                    disabled={!contractAddress || storeContractAddress === contractAddress}
                    onClick={onButtonClick}
                >
                    Set contract address and ABI
                </button>
            </div>
        </div>
    )
}
