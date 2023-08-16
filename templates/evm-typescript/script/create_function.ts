import { ethers } from "hardhat";
import { SwitchboardProgram, FunctionAccount } from "@switchboard-xyz/evm.js";

async function main() {
  const [deployer] = await ethers.getSigners();

  const diamondAddress =
    process.env.SWITCHBOARD_ADDRESS ?? process.env.DIAMOND_ADDRESS ?? "";

  const schedule = process.env.SCHEDULE;
  const container = process.env.CONTAINER_NAME;
  const queueId = process.env.QUEUE_ID;
  const ethValue = process.env.ETH_VALUE ?? "0.1";

  // empty permittedCallers can be called by anyone (default)
  const permittedCallers = process.env.PERMITTED_CALLERS
    ? process.env.PERMITTED_CALLERS.split(",")
    : [];

  let functionId =
    process.env.FUNCTION_ID ?? ethers.Wallet.createRandom().address;

  if (!diamondAddress) {
    throw new Error(
      "Please set the diamond address with: export SWITCHBOARD_ADDRESS=..."
    );
  }

  if (!schedule) {
    throw new Error(
      'Please set the schedule, ex: export SCHEDULE="* * * * * *"'
    );
  }

  if (!container) {
    throw new Error(
      'Please set the container, ex: export CONTAINER="switchboardlabs/price-oracle"'
    );
  }

  if (!queueId) {
    throw new Error("Please set the queueid with: export QUEUE_ID=...");
  }

  console.log("Account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  const switchboardProgram = await SwitchboardProgram.load(
    deployer,
    diamondAddress
  );

  const [func, tx] = await FunctionAccount.create(
    switchboardProgram,
    {
      functionId: functionId,
      authority: deployer.address!,
      attestationQueue: queueId!,
      name: "my switchboard function",
      containerRegistry: "dockerhub",
      container: container!,
      schedule: schedule!,
      version: "latest",
      permittedCallers,
    },
    { value: ethers.utils.parseEther(ethValue) }
  );

  const receipt = await tx.wait();
  console.log(`Function create signature: ${receipt.logs[0].transactionHash}`);
  console.log(`Function address: ${func.address}`);
  console.log(`Please run: export FUNCTION_ID=${func.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
