import { AssetTransfersCategory, AssetTransfersResult } from 'alchemy-sdk';
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectContractState, setNeedFetchTransactionAction } from '../../reducers/contractReducer';
import Emoji from '../shared/Emoji';
import Loader from '../shared/Loader';
import './Transactions.css';

export default function Transactions() {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selectContractState);

    const [isFetchingTransfers, setIsFetchingTransfers] = useState<boolean>(false);
    const [transactions, setTransactions] = useState<AssetTransfersResult[]>([]);

    useEffect(() => {
        async function getTransactions() {
            setIsFetchingTransfers(true);
            try {
                const data = await window.alchemy.core.getAssetTransfers({
                    //fromBlock: "0x0",
                    //fromAddress: ,
                    toAddress: state.group?.address,
                    category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155, AssetTransfersCategory.SPECIALNFT],
                    excludeZeroValue: false
                });
                console.log('alchemy.core.getAssetTransfers', state.group?.address, data);
                setTransactions(data.transfers.reverse());
            } catch (error) {
                console.error('alchemy.core.getAssetTransfers', error);
            }
            setIsFetchingTransfers(false);
            dispatch(setNeedFetchTransactionAction(false));
        };

        if (state.needFetchTransaction) {
            getTransactions();
        }
    }, [state.needFetchTransaction]);

    return (
        <div className='container transactions'>
            <div className='container__title'>Transactions</div>
            {isFetchingTransfers && <Loader />}
            {!isFetchingTransfers && <div>
                {!transactions.length && <div>
                    Empty
                </div>}
                {transactions.map(transaction =>
                    <div className='transactions__item' key={transaction.uniqueId}>
                        <div className='transactions__item-title' style={{ flexGrow: 1 }}>
                            <img className='transactions__avatar' src={`https://effigy.im/a/${transaction.from}.png`}></img>
                            <span>{transaction.from}</span>
                        </div>
                        <div>
                            <span style={{ fontWeight: 'bold' }}>{transaction.value} {transaction.asset}</span>
                            <a
                                href={`https://mumbai.polygonscan.com/tx/${transaction.hash}`}
                                title='Open mumbai.polygonscan.com'
                                className='button'
                                target='_blank'
                            >
                                <Emoji symbol='🔗' />
                            </a>
                        </div>
                    </div>
                )}
            </div>
            }
        </div>
    )
}
