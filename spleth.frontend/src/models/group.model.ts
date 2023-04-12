export class Group {
    title: string | undefined | null;
    address: `0x${string}`;

    constructor(address: `0x${string}`, title: string | undefined | null = null) {
        this.address = address;
        this.title = title;
    }
}
