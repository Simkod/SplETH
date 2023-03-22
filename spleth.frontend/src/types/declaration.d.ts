import { Alchemy } from "alchemy-sdk";

declare module "*.module.css";

declare global {
    interface Window { alchemy: Alchemy; }
}
