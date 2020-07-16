pragma solidity ^0.5.0;
import "./FundingChainlinkClient.sol";

contract PoeChainlinkClient is FundingChainlinkClient{
  uint8 public level;

  /**
  * @notice Deploy the contract with a specified address for the LINK
  * and Oracle contract addresses
  * @dev Sets the storage for the specified addresses
  * @param _oracle The address of the oracle contract
  * @param _jobId The job id of the adapter
  * @param _level The poe level
  * @param _link The address of the LINK token contract
  */
  constructor(address _link, address _oracle, bytes32 _jobId, uint8 _level) FundingChainlinkClient(_link, _oracle, _jobId) public {
    level = _level;
  }

}