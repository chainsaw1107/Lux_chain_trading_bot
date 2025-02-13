import { ethers } from "ethers";

import wallets from "../wallets.json";
import {
  EXPLORER_URI,
  GAS_LIMIT,
  NUMBER_OF_WALLETS,
  SEND_COIN_AMOUNT,
  TRANSACTION_COUNT,
} from "./config/constants";
import { provider, mainWallet } from "./config/variables";
import { performWrap } from "./utils";

const sendEthToWallets = async () => {
  let mBalance = await mainWallet.getBalance();
  const gasPrice = await provider.getGasPrice();
  console.log(`Balance is : ${ethers.utils.formatEther(mBalance)} ETH`);
  for (let i = 0; i < Math.min(NUMBER_OF_WALLETS, TRANSACTION_COUNT); i++) {
    console.log(`Sending to Wallet${i + 1}`);
    let wallet = new ethers.Wallet(wallets[i].privateKey, provider);
    let transaction = {
      to: wallet.address,
      value: ethers.utils.parseEther(SEND_COIN_AMOUNT),
      gasLimit: GAS_LIMIT,
      gasPrice: gasPrice,
      // gasPrice: ethers.utils.parseUnits(GAS_PRICE, 'gwei'),
    };
    try {
      const tx = await mainWallet.sendTransaction(transaction);
      const receipt = await tx.wait();
      console.log(`- send transaction ===> ${EXPLORER_URI}/tx/${tx.hash}`);

      const hash = await performWrap(wallet);
      console.log(`- wrap transaction ===> ${EXPLORER_URI}/tx/${hash}`);
    } catch (error) {
      console.log(error);
    }
  }
};
sendEthToWallets();
