import { Connection } from "@solana/web3.js";

export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
export const CLUSTER_NETWORK = process.env.NEXT_PUBLIC_CLUSTER_NETWORK;
export const CANDY_MACHINE_ID = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID;
export const SPL_TOKEN_NAME = process.env.NEXT_PUBLIC_SPL_TOKEN_NAME;
export const connection: Connection = new Connection(
  RPC_ENDPOINT as string,
  "confirmed"
);
