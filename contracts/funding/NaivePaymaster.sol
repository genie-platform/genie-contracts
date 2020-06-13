pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;

// SPDX-License-Identifier: MIT OR Apache-2.0

import "@opengsn/gsn/contracts/BasePaymaster.sol";

contract NaivePaymaster is BasePaymaster {
    address public ourTarget; // The target contract we are willing to pay for

    // allow the owner to set ourTarget
    event TargetSet(address target);

    function setTarget(address target) external onlyOwner {
        ourTarget = target;
        emit TargetSet(target);
    }

    // GNSTypes.RelayRequest is defined in GNSTypes.sol.
    // The relevant fields for us are:
    // target - the address of the target contract
    // encodedFunction - the called function's name and parameters
    // relayData.senderAddress - the sender's address
    function acceptRelayedCall(
        GSNTypes.RelayRequest calldata relayRequest,
        bytes calldata signature,
        bytes calldata approvalData,
        uint256 maxPossibleGas
    ) external override view returns (bytes memory context) {
        (signature, approvalData, maxPossibleGas); // avoid a warning

        require(relayRequest.target == ourTarget);

        // If we got here, we're successful. Return the time
        // to be able to match PreRelayed and PostRelayed events
        return abi.encode(now);
    }

    event PreRelayed(uint256);
    event PostRelayed(uint256);

    function preRelayedCall(bytes calldata context)
        external
        override
        relayHubOnly
        returns (bytes32)
    {
        emit PreRelayed(abi.decode(context, (uint256)));
        return bytes32(0);
    }

    function postRelayedCall(
        bytes calldata context,
        bool success,
        bytes32 preRetVal,
        uint256 gasUse,
        GSNTypes.GasData calldata gasData
    ) external override relayHubOnly {
        (success, preRetVal, gasUse, gasData);
        emit PostRelayed(abi.decode(context, (uint256)));
    }

    function versionPaymaster()
        external
        virtual
        override
        view
        returns (string memory)
    {
        return "1.0";
    }
}
