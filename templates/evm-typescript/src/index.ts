import { BigNumber, ethers, utils, Contract } from "ethers";
import { FunctionRunner } from "@switchboard-xyz/evm.js";

// Generate a random number and call into "callback"
async function main() {
  // Create a FunctionRunner
  const runner = new FunctionRunner();

  // get contract - we only need the one callback function in the abi
  const iface = new ethers.utils.Interface([
    "function fillOrder(uint256,uint256)",
  ]);

  /*
    @NOTE: decoded params must be defined in the order that they're defined in the solidity struct.
    
    This example uses the following solidity struct:
      struct OrderParams {
          uint256 orderId;
          address sender;
      }
  */
  const paramsSchema = ["uint256", "address"];

  // get all the callId / params pairs (each callId has associated params)
  const paramsResults = runner.params(paramsSchema);

  // list of blocked senders 
  const blockedSenders = new Set(["0x0000000000000000000000000000000000000000"])

  // map paramsResults to calls
  const calls = await Promise.all(paramsResults.map(async (paramsResult) => {
    const { callId, params } = paramsResult;

    if (!params) {
      return undefined;
    }

    const orderId: BigNumber = params.orderId;
    const sender: string = params.sender;

    // check if sender is blocked
    if (blockedSenders.has(sender)) {
      return undefined;
    }

    // get random uint256
    const randomBytes = utils.randomBytes(32);
    const bn = BigNumber.from(Array.from(randomBytes));

    // get txn
    return contract.populateTransaction.fillOrder(orderId, bn);
  }));

  const contract = new Contract(
    "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41",
    iface,
    runner.enclaveWallet
  );

  // emit txn
  await runner.emit(calls);
}

// run switchboard function
main();
