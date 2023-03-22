
export function isNumeric(n: string | any) {
    return !n?.startsWith?.('0x') && !isNaN(parseFloat(n)) && isFinite(n);
}
