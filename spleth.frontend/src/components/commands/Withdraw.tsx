import { useState } from 'react';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { useAppSelector } from '../../app/hooks';
import { selectContractABI, selectContractAddress } from '../../reducers/contractReducer';
import Emoji from '../shared/Emoji';

export default function Withdraw() {
    const contractAddress = useAppSelector(selectContractAddress);
    const contractABI = useAppSelector(selectContractABI);

    const [isReady, setIsReady] = useState(false);

    const {
        config,
        error: prepareError,
        isError: isPrepareError
    } = usePrepareContractWrite({
        enabled: isReady,
        address: contractAddress,
        abi: contractABI,
        functionName: 'withdraw',
        onError: (error) => console.error('withdraw', error),
    });
    const { data, error, isError, write } = useContractWrite(config);
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

    return (
        <div className='container'>
            <div className='container__title'>Withdraw</div>
            <label>
                <input type="checkbox" onChange={() => setIsReady(!isReady)} />
                Ready to
            </label>

            <button disabled={!write || isLoading} onClick={() => write?.()}>
                {isLoading ? 'Withdrawing...' : 'withdraw'}
            </button>
            <div>
                {isSuccess && (
                    <div className='container__success'>
                        Successfully withdrew!
                        <div>
                            <a
                                href={`https://mumbai.polygonscan.com/tx/${data?.hash}`}
                                style={{ margin: '10px' }}
                                title='Open mumbai.polygonscan.com'
                                className='button'
                                target='_blank'
                            >
                                <Emoji symbol='🔗' /> mumbai.polygonscan.com
                            </a>
                        </div>
                    </div>
                )}
                {(isPrepareError || isError) && (
                    <div className='container__error'>
                        Error: {(prepareError || error)?.message} <br />
                        {(prepareError || error as any)?.data?.message}
                    </div>
                )}
            </div>
        </div>
    )
}
