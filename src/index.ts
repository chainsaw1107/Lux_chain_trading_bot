import { ethers, logger } from "ethers";
import JSBI from "jsbi";

import {
  BUFFER,
  EXPLORER_URI,
  MAX_BUY_QUANTITY,
  MAX_SELL_QUANTITY,
  MAX_TIME,
  MIN_BUY_QUANTITY,
  MIN_SELL_QUANTITY,
  MIN_TIME,
  NUMBER_OF_WALLETS,
  SWAP_ROUTER_CONTRACT,
  TOKEN_DECIMALS,
  TRANSACTION_COUNT,
} from "./config/constants";
import wallets from "../wallets.json";
import { mainWallet, provider, tokenContract } from "./config/variables";
import { fetchAssets, performBuy, performSell } from "./utils";
import { getRandomNumber, getRandomRunTime } from "./config/config";
import swapRouterAbi from "./config/abis/swap_router.json";

let transactionCount: number = TRANSACTION_COUNT;
interface WALLET_STATUS {
  wallet: ethers.Wallet;
  id: number;
}
let walletArray: WALLET_STATUS[] = [];
let timeout = getRandomRunTime(MIN_TIME, MAX_TIME);

const main = async () => {
  logger.info(`Randomly Buying & Selling`);
  logger.info(`We will exit this process after ${timeout} miliseconds...`);
  for (let i = 0; i < NUMBER_OF_WALLETS; i++) {
    const wallet = new ethers.Wallet(wallets[i].privateKey, provider);
    walletArray = [...walletArray, { wallet, id: i }];
  }
  await runBot();
};

setInterval(() => {
  if (timeout === 0) {
    logger.info("process is exited\n\t Times up!");
    process.exit(1);
  }
  timeout--;
}, 1000);

const runBot = async () => {
  let walletAmount = walletArray.length;
  if (walletAmount === 0) {
    logger.info("Please create wallets.");
    process.exit(1);
  }

  for (let i = 0; i < Math.min(transactionCount, walletAmount); i++) {
    try {
      let rnt = getRandomRunTime(1, 2);
      const [coinBalance, tokenBalance] = await fetchAssets(
        walletArray[i].wallet,
        provider
      );

      // 1: buy   2: sell
      if (rnt == 1) {
        console.log(`------------------ Will buy ------------------`);

        const ethAmount = getRandomNumber(MIN_BUY_QUANTITY, MAX_BUY_QUANTITY);
        const tokenUnitAmount = ethers.utils.parseUnits(
          ethAmount,
          TOKEN_DECIMALS
        );
        console.log(`LUX Amount: ${ethAmount}`);

        console.log(`Wallet${i + 1}'s LUX Balance: ${coinBalance}`);

        if (
          JSBI.lessThan(
            JSBI.BigInt(coinBalance),
            JSBI.add(
              JSBI.BigInt(ethers.utils.parseEther(ethAmount)),
              JSBI.BigInt(BUFFER * 10 ** 18)
            )
          )
        ) {
          console.log(`Transaction Reverted: Not enough balance.`);
        } else {
          const swapRouterContract = new ethers.Contract(
            SWAP_ROUTER_CONTRACT,
            swapRouterAbi,
            walletArray[i].wallet
          ); // Use the wallet to send the transaction
          // const tx = await performWrap(walletArray[i].wallet);
          const tx = await performBuy(
            swapRouterContract,
            walletArray[i].wallet,
            tokenUnitAmount
          );
          console.log(`   Explorer  ----------->  ${EXPLORER_URI}/tx/${tx}\n`);
        }
      } else {
        console.log(`------------------ Will sell ------------------`);

        const ethAmount = getRandomNumber(MIN_SELL_QUANTITY, MAX_SELL_QUANTITY);
        const tokenUnitAmount = ethers.utils.parseUnits(
          ethAmount,
          TOKEN_DECIMALS
        );
        console.log(`Token Amount: ${ethAmount}`);

        console.log(`Wallet${i + 1}'s Token Balance: ${tokenBalance}`);

        if (tokenUnitAmount.gt(tokenBalance)) {
          console.log(`Transaction Reverted: Not enough balance.`);
        } else {
          //start selling …
          const swapRouterContract = new ethers.Contract(
            SWAP_ROUTER_CONTRACT,
            swapRouterAbi,
            walletArray[i].wallet
          ); // Use the wallet to send the transaction
          const tx = await performSell(
            swapRouterContract,
            walletArray[i].wallet,
            tokenUnitAmount
          );
          console.log(`   Explorer  ----------->   ${EXPLORER_URI}/tx/${tx}\n`);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  const wtime = getRandomRunTime(
    Number(process.env.MIN_TRADE_WAIT),
    Number(process.env.MAX_TRADE_WAIT)
  );
  console.log(`waiting ${wtime} miliseconds...`);
  setTimeout(runBot, wtime);
  console.log(`We will exit this process after ${timeout} seconds...`);
};

main();
