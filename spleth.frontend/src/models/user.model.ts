import { BigNumber } from "ethers";

export class User {
    constructor(
        public address: string,
        public balance?: BigNumber
    ) {}
}
