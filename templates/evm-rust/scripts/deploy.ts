import { ethers } from "hardhat";

async function main() {
  const diamondAddress =
    process.env.SWITCHBOARD_ADDRESS ?? process.env.DIAMOND_ADDRESS ?? "";

  const contract = await ethers.deployContract("SwitchboardParamsReceiver", [
    diamondAddress, // switchboard address,
  ]);
  await contract.deployed();
  console.log("SwitchboardParamsReceiver deployed to:", contract.address);
  console.log(
    `plrease run: export SWITCHBOARD_RECEIVER_ADDRESS=${diamondAddress}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
