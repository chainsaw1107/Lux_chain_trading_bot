import { ethers } from "ethers";
import { mainWallet, provider, tokenContract } from "./config/variables";
import { EXPLORER_URI, GAS_LIMIT, NUMBER_OF_WALLETS } from "./config/constants";
import wallets from "../wallets.json";

const sendEthToWallets = async () => {
  const gasPrice = await provider.getGasPrice();

  for (let i = 0; i < NUMBER_OF_WALLETS; i++) {
    try {
      console.log(`Gathering from Wallet${i + 1}`);
      let wallet = new ethers.Wallet(wallets[i].privateKey, provider);
      console.log(`- private key: ${wallets[i].privateKey}`);
      console.log(`- public key: ${wallet.address}`);

      const tokenBalance = await tokenContract.balanceOf(wallet.address);

      if (tokenBalance.gt(0)) {
        // Prepare the transaction object for the transfer of tokens
        const tx = await tokenContract
          .connect(wallet)
          .transfer(mainWallet.address, tokenBalance);

        // Optionally, you can wait for the transaction to be confirmed
        await tx.wait();
        console.log(`- Token Amount: ${tokenBalance}`);
        console.log(`  Explorer  ----------->  ${EXPLORER_URI}/tx/${tx.hash}`);
      }

      const balance = await wallet.getBalance();
      const value = balance.sub(gasPrice.mul(GAS_LIMIT));

      const transaction = {
        to: mainWallet.address,
        value,
        gasLimit: GAS_LIMIT,
        gasPrice: gasPrice,
        // gasPrice: ethers.utils.parseUnits(GAS_PRICE, 'gwei'),
      };
      const tx = await wallet.sendTransaction(transaction);
      console.log(`- Coin Amount: ${value}`);
      console.log(`  Explorer  ----------->  ${EXPLORER_URI}/tx/${tx.hash}`);
    } catch (error) {
      console.log(error);
    }
  }
};
sendEthToWallets();
