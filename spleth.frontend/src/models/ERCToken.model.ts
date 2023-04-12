import { BigNumber } from 'ethers';

export class ERCToken {
    constructor(
        public address: `0x${string}`,
        public symbol: string,
        public allowanceToSmartContract: BigNumber
    ) {
    }
}
