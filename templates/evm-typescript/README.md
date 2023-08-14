# Switchboard Receiver

<div align="center">
  <img src="https://github.com/switchboard-xyz/sbv2-core/raw/main/website/static/img/icons/switchboard/avatar.png" />

  <h1>Switchboard<br>TS Functions Template</h1>

  <p>
    <a href="https://discord.gg/switchboardxyz">
      <img alt="Discord" src="https://img.shields.io/discord/841525135311634443?color=blueviolet&logo=discord&logoColor=white" />
    </a>
    <a href="https://twitter.com/switchboardxyz">
      <img alt="Twitter" src="https://img.shields.io/twitter/follow/switchboardxyz?label=Follow+Switchboard" />
    </a>
  </p>
</div>

## Table of Contents

- [Switchboard Receiver](#switchboard-receiver)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
    - [Node.js and Npm](#nodejs-and-npm)
    - [Installing Docker](#installing-docker)
    - [Docker Setup](#docker-setup)
  - [Components](#components)
    - [Contract](#contract)
      - [Picking a network and setting up your environment](#picking-a-network-and-setting-up-your-environment)
    - [Switchboard Function](#switchboard-function)
    - [Publishing and Initialization](#publishing-and-initialization)
    - [Initializing the function](#initializing-the-function)
    - [Adding Funding to Function](#adding-funding-to-function)
    - [Printing Function Data](#printing-function-data)
  - [Writing Switchboard TS Functions](#writing-switchboard-ts-functions)
    - [Setup](#setup)
    - [Minimal Switchboard Function](#minimal-switchboard-function)
    - [Testing your function](#testing-your-function)
    - [Deploying and Maintenance](#deploying-and-maintenance)
  - [Writing Receiver Contracts](#writing-receiver-contracts)
    - [Receiver Example](#receiver-example)

## Prerequisites

Before you can build and run the project, you'll need to have Node.js and npm installed on your system. You'll also need to have Docker installed on your system. Docker allows you to package and distribute applications as lightweight containers, making it easy to manage dependencies and ensure consistent behavior across different environments. Switchboard Functions are built and run within containers, so you'll need a docker daemon running to publish a new function.

### Node.js and Npm

If you don't have Node.js and npm installed, you can download and install them from the official Node.js website: [https://nodejs.org/](https://nodejs.org/)

### Installing Docker

If you don't have Docker installed, you can follow these steps to get it up and running:

1. **Linux**: Depending on your Linux distribution, you might need to use different package managers. For Ubuntu, you can use `apt`:

   ```bash
   sudo apt update
   sudo apt install docker.io
   ```

   For other distributions, consult your package manager's documentation.

2. **macOS**: You can install Docker Desktop for macOS by downloading the installer from the [Docker website](https://www.docker.com/products/docker-desktop) and following the installation instructions.

3. **Windows**: Similarly, you can install Docker Desktop for Windows from the [Docker website](https://www.docker.com/products/docker-desktop) and follow the provided instructions.

### Docker Setup

After installing Docker, make sure it's running by opening a terminal/command prompt and running:

```bash
docker --version
```

This should display the installed Docker version, confirming that Docker is installed and running properly.

You'll need to login to docker. If you don't yet have an account, you'll need one to publish images to dockerhub. You can sign up at [https://hub.docker.com](https://hub.docker.com).

```bash
docker login --username <your-username> --password <your-password>
```

## Components

### Contract

This SwitchboardReceiver contract is a minimal example of a contract producing randomness in a callback function at a scheduled interval.

When you deploy this contract, it will await to be bound to a switchboard function calling into it.

#### Picking a network and setting up your environment

- navigate to the [Project README.md](../../README.md) and find the switchboard deployment address
- set the `SWITCHBOARD_ADDRESS` env variable to target whichever address is appropriate for the network you're targetting

To first deploy the contract, run:

```bash
# ex:
# pnpm deploy:coredaotestnet
# pnpm deploy:coredaomain
# pnpm deploy:arbitrumtestnet
pnpm deploy:${NETWORK_NAME}
```

More deploy commands are available in [package.json](./package.json) scripts.

You will see the last line of this script output

```bash
export SWITCHBOARD_RECEIVER_ADDRESS=<RECEIVER_ADDRESS>
```

### Switchboard Function

Export the address to your environment and navigate to `switchboard-function/`

The bulk of the function logic can be found in [./switchboard-function/src/index.ts](switchboard-function/src/index.ts).

Build functions from the `switchboard-function/` directory with

```bash
make build
```

### Publishing and Initialization

You'll also need to pick a container name that your switchboard function will use on dockerhub.

```bash
export CONTAINER_NAME=your_docker_username/switchboard-function
```

Here, set the name of your container to deploy and run `make build`

After this is published, you are free to make your function account to set the rate of run for the function.

### Initializing the function

You'll need the queue id and switchboard contract address from the [Project README.md](../../README.md) for the network you're targetting.

See `scripts/create_function.ts` to create and deploy the function:

```bash
export QUEUE_ID=0x392a3217624aC36b1EC1Cf95905D49594A4DCF64 # placeholder
export SCHEDULE="" # No schedule since this will be params-triggered
export CONTAINER_NAME=switchboardlabs/test
npx hardhat run scripts/create_function.ts  --network arbitrumTestnet # or coredaoTestnet
```

### Adding Funding to Function

Add funds to your function by doing the following:

```bash
export FUNCTION_ID=0x96cE076e3Dda35679316b12F2b5F7b4A92C9a294
export ETH_VALUE="0.1"
npx hardhat run scripts/extend_function.ts  --network arbitrumTestnet
```

### Printing Function Data

Now view your function config to ensure it is to your liking:

```bash
export FUNCTION_ID=0x96cE076e3Dda35679316b12F2b5F7b4A92C9a294
npx hardhat run scripts/check_function.ts  --network arbitrumTestnet
```

## Writing Switchboard TS Functions

In order to write a successfully running switchboard function, you'll need to import `@switchboard-xyz/evm.js` to use the libraries which communicate the function results (which includes transactions to run) to the Switchboard Verifiers that execute these metatransactions.

### Setup

To get started, you'll need to install the all the packages:

```bash
npm install
```

Checkout [package.json](./package.json) for more all the packages used in this project.

### Minimal Switchboard Function

main.ts

```typescript
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

```

### Testing your function

We can't guarantee that the function will run on the blockchain, but we can test that it compiles and runs locally.

Run the following to test your function:

```bash
export CHAIN_ID=12345 # can be any integer
export VERIFYING_CONTRACT=$SWITCHBOARD_ADDRESS # can be any valid address
export FUNCTION_KEY=$FUNCTION_ID # can be any valid address
npm build
npm test # Note: this will include a warning about a missing quote which can be safely ignored.
```

Successful output:

```bash
WARNING: Error generating quote. Function will not be able to be transmitted correctly.
FN_OUT: 7b2276657273696f6e223a312c2271756f7465223a5b5d2c22666e5f6b6579223a5b3134342c32332c3233322c34342c39382c32302c39372c3232392c3138392c33302c3235322c3133362c37362c332c3136382c3130362c3138322c34352c3137352c3137325d2c227369676e6572223a5b3135382c32332c3137302c3133322c3230302c3130322c35302c38352c31302c3134382c3235322c35372c3132362c372c31372c32352c37322c3131342c38322c3134365d2c22666e5f726571756573745f6b6579223a5b5d2c22666e5f726571756573745f68617368223a5b5d2c22636861696e5f726573756c745f696e666f223a7b2245766d223a7b22747873223a5b7b2265787069726174696f6e5f74696d655f7365636f6e6473223a313639313633383836332c226761735f6c696d6974223a2235353030303030222c2276616c7565223a2230222c22746f223a5b38332c3130372c3135352c35382c39382c3132382c37332c3233392c3134382c3133332c3133342c33392c3131382c31362c34382c3235302c3130372c3133382c3234382c3135375d2c2266726f6d223a5b3135382c32332c3137302c3133322c3230302c3130322c35302c38352c31302c3134382c3235322c35372c3132362c372c31372c32352c37322c3131342c38322c3134365d2c2264617461223a5b3136302c3232332c3131392c3130362...
```

### Deploying and Maintenance

After you publish the function and create it on the blockchain, you must keep the function escrow account funded to cover gas fees. Revisions to the function can be made by deploying a new version and updating the function config on-chain.

## Writing Receiver Contracts

While Switchboard Functions can call back into any number of on-chain functions, it's useful to limit access to some privileged functions to just _your_ Switchboard Function.

In order to do this you'll need to know the switchboard address you're using, and which functionId will be calling into the function in question.

### Receiver Example

ISwitchboard.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Simplest interface for interacting with Switchboard Functions
interface ISwitchboard {
    // Funding provided to calls is contributed to the function escrow
    function callFunction(
        address functionId,
        bytes memory params
    ) external payable returns (address callId);
}
```

Recipient.sol

```solidity
//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {ISwitchboard} from "./ISwitchboard.sol";

// EIP2771 Context
// Inherited by all contracts that are recipients of switchboard callbacks
contract Recipient {
    address immutable switchboard;

    constructor(address _switchboard) {
        switchboard = _switchboard;
    }

    function callSwitchboardFunction(
        address functionId,
        bytes memory params // arbitrary user-defined parameters handled function-side
    ) internal returns (address callId) {
        callId = ISwitchboard(switchboard).callFunction{value: msg.value}(
            functionId,
            params
        );
    }

    // get forwarded sender if trusted forwarder is used
    function getMsgSender() internal view returns (address payable signer) {
        signer = payable(msg.sender);
        if (msg.data.length >= 20 && signer == switchboard) {
            assembly {
                signer := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        }
    }
}
```

Example.sol

```solidity
//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {Recipient} from "./Recipient.sol";

// An example of a contract where we pass some parameters to the callback function so we can
// handle individual orders in a batch.
contract SwitchboardParamsReceiver is Recipient {
    // Events
    event OrderCreated(uint256 orderId, address callId, address sender);
    event OrderResolved(uint256 orderId, address callId, uint256 value);

    // Errors
    error InvalidValue(uint256 value);
    error InvalidSender(address expected, address actual);
    error InvalidOrder(uint256 orderId);

    // Structs
    struct Order {
        address callId;
        address sender;
        uint256 value;
        bool filled;
    }

    // Switchboard Function Parameters
    // This struct will be defined here, but also in the Switchboard Function itself
    // We will abi.decode it off-chain to get the parameters
    struct OrderParams {
        uint256 orderId;
        address sender;
    }

    // Constants
    uint256 public constant EXPECTED_FUNCTION_GAS_COST = 300_000;

    // State variables
    address functionId;
    uint256 nextOrderId;
    mapping(uint256 => Order) public orders;
    uint256 public latestValue;

    // Pass the switchboard address and the function id to the constructor so we can validate the callback sender
    constructor(
        address _switchboard // Switchboard contract address
    ) Recipient(_switchboard) {}

    // Call the switchboard function with the order parameters
    // The function will call back into fillOrder with the value
    function createOrder() external payable {
        // make sure the value is correct - this will make it so the downstream users
        //  / order creators are the ones paying for the order execution
        if (msg.value < EXPECTED_FUNCTION_GAS_COST * tx.gasprice) {
            revert InvalidValue(msg.value);
        }

        // encode the order parameters
        bytes memory encodedOrder = abi.encode(
            OrderParams({orderId: nextOrderId, sender: getMsgSender()})
        );

        // call out to the swithcboard function, triggering an off-chain run
        address callId = callSwitchboardFunction(functionId, encodedOrder);

        // store the order data
        orders[nextOrderId].sender = msg.sender;
        orders[nextOrderId].callId = callId;

        // emit an event
        emit OrderCreated(nextOrderId, callId, getMsgSender());

        // increment nextOrderId
        nextOrderId++;
    }

    // Callback into contract with value computed off-chain
    function fillOrder(uint256 orderId, uint256 value) external {
        // extract the sender from the callback, this validates that the switchboard contract called this function
        address msgSender = getMsgSender();

        // if callback hasn't been hit, set it on first function run
        // @NOTE: do not do this in production, this is just for ease of testing
        if (functionId == address(0)) {
            functionId = msgSender;
        }

        // make sure the encoded caller is our function id
        if (msgSender != functionId) {
            revert InvalidSender(functionId, msgSender);
        }

        // sanity check that the order has been registered
        if (orders[orderId].sender == address(0)) {
            revert InvalidOrder(orderId);
        }

        // fill order and mark it as filled
        orders[orderId].value = value;
        orders[orderId].filled = true;

        latestValue = value;

        // emit an event
        emit OrderResolved(orderId, msgSender, value);
    }
}

```
