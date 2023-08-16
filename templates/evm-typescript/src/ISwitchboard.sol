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
