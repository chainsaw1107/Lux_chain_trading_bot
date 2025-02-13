import { ethers } from "ethers";

import { RPC_ENDPOINT, PROVIDER_PRIVATE_KEY, TOKEN_ADDRESS } from "./constants";
import agentkeyAbi from "./abis/AgentKey.json";

export const provider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT);

export const mainWallet = new ethers.Wallet(
  String(PROVIDER_PRIVATE_KEY),
  provider
);

export const tokenContract = new ethers.Contract(
  TOKEN_ADDRESS,
  agentkeyAbi,
  mainWallet
);
