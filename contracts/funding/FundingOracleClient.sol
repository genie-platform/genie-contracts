pragma solidity ^0.5.0;

import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";
import "@chainlink/contracts/src/v0.5/ChainlinkClient.sol";


/**
 * @title Chainlink is an example contract which requests data from
 * the Chainlink network
 * @dev This contract is designed to work on multiple networks, including
 * local test networks
 */
contract FundingOracleClient is ChainlinkClient, Ownable {
  bytes32 public data;
  uint8 public level;
  address public oracle;
  bytes32 public jobId;

  /**
   * @notice Deploy the contract with a specified address for the LINK
   * and Oracle contract addresses
   * @dev Sets the storage for the specified addresses
   * @param _oracle The address of the oracle contract
   * @param _jobId The job id of the adapter
   * @param _level The poe level
   * @param _link The address of the LINK token contract
   */
  constructor(address _oracle, bytes32 _jobId, uint8 _level, address _link) public {
    if (_link == address(0)) {
      setPublicChainlinkToken();
    } else {
      setChainlinkToken(_link);
    }

    oracle = _oracle;
    jobId = _jobId;
    level = _level;
    Ownable.initialize(msg.sender);
  }

  /**
   * @notice Returns the address of the LINK token
   * @dev This is the public implementation for chainlinkTokenAddress, which is
   * an internal method of the ChainlinkClient contract
   */
  function getChainlinkToken() public view returns (address) {
    return chainlinkTokenAddress();
  }

  /**
   * @notice Creates a request to the specified Oracle contract address
   * @dev This function ignores the stored Oracle contract address and
   * will instead send the request to the address specified
   */
  function requestWinner(
    address _pool,
    uint256 _payment
  )
    public
    onlyOwner
    returns (bytes32 requestId)
  {
    Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
    req.addInt("level", level);
    req.addBytes("pool", abi.encodePacked(_pool));
    requestId = sendChainlinkRequestTo(oracle, req, _payment);
  }

  /**
   * @notice The fulfill method from requests created by this contract
   * @dev The recordChainlinkFulfillment protects this function from being called
   * by anyone other than the oracle address that the request was sent to
   * @param _requestId The ID that was generated for the request
   * @param _data The answer provided by the oracle
   */
  function fulfill(bytes32 _requestId, bytes32 _data)
    public
    recordChainlinkFulfillment(_requestId)
  {
    data = _data;
  }

  /**
   * @notice Allows the owner to withdraw any LINK balance on the contract
   */
  function withdrawLink() public onlyOwner {
    LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
    require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
  }

  /**
   * @notice Call this method if no response is received within 5 minutes
   * @param _requestId The ID that was generated for the request to cancel
   * @param _payment The payment specified for the request to cancel
   * @param _callbackFunctionId The bytes4 callback function ID specified for
   * the request to cancel
   * @param _expiration The expiration generated for the request to cancel
   */
  function cancelRequest(
    bytes32 _requestId,
    uint256 _payment,
    bytes4 _callbackFunctionId,
    uint256 _expiration
  )
    public
    onlyOwner
  {
    cancelChainlinkRequest(_requestId, _payment, _callbackFunctionId, _expiration);
  }
}