import { AssetTransfersCategory, AssetTransfersResult } from 'alchemy-sdk';
import { useEffect, useState } from 'react'
import { useAppSelector } from '../../app/hooks';
import { selectContractABI, selectContractAddress, selectNeedFetchBalance } from '../../reducers/contractReducer';
import Emoji from '../shared/Emoji';
import Loader from '../shared/Loader';

export default function Transactions() {
    const contractAddress = useAppSelector(selectContractAddress);
    const contractABI = useAppSelector(selectContractABI);
    const needFetchBalance = useAppSelector(selectNeedFetchBalance);

    const [isFetchingTransfers, setIsFetchingTransfers] = useState<boolean>(false);
    const [transactions, setTransactions] = useState<AssetTransfersResult[]>([]);

    useEffect(() => {
        async function getTransactions() {
            setIsFetchingTransfers(true);
            try {
                const data = await window.alchemy.core.getAssetTransfers({
                    //fromBlock: "0x0",
                    //fromAddress: contractAddress,
                    toAddress: contractAddress as any,
                    category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155, AssetTransfersCategory.SPECIALNFT],
                    excludeZeroValue: false
                });
                console.log('alchemy.core.getAssetTransfers', contractAddress, data);
                setTransactions(data.transfers.reverse());
            } catch (error) {
                console.error('alchemy.core.getAssetTransfers', error);
            }
            setIsFetchingTransfers(false);
        };

        getTransactions();
    }, [contractAddress, needFetchBalance]);

    return (
        <div className='container'>
            <div className='container__title'>Transactions</div>
            {isFetchingTransfers && <Loader />}
            {!isFetchingTransfers && <div>
                {!transactions.length && <div>
                    Empty
                </div>}
                {transactions.map(transaction =>
                    <div key={transaction.uniqueId} style={{ fontSize: '12px', display: 'flex', margin: '10px 0' }}>
                        <div style={{ flexGrow: 1 }}>
                            From: {transaction.from} <br />
                            To: {transaction.to}
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
