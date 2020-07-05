pragma solidity ^0.5.0;

import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";
import "@chainlink/contracts/src/v0.5/ChainlinkClient.sol";
import "../Funding.sol";

/**
 * @title Chainlink is an example contract which requests data from
 * the Chainlink network
 * @dev This contract is designed to work on multiple networks, including
 * local test networks
 */
contract FundingChainlinkClient is ChainlinkClient, Ownable {
  bytes32 public data;
  address public pool;
  uint8 public level;
  address public oracle;
  bytes32 public jobId;

  /**
   * @notice Deploy the contract with a specified address for the LINK
   * and Oracle contract addresses
   * @dev Sets the storage for the specified addresses
   * @param _link The address of the LINK token contract
   * @param _oracle The address of the oracle contract
   * @param _jobId The job id of the adapter
   */
  constructor(address _link, address _oracle, bytes32 _jobId) public {
    if (_link == address(0)) {
      setPublicChainlinkToken();
    } else {
      setChainlinkToken(_link);
    }

    oracle = _oracle;
    jobId = _jobId;
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
    // passing pool address as int
    req.add("pool", uintToString(_pool));
    requestId = sendChainlinkRequestTo(oracle, req, _payment);
    pool = _pool;
  }

    function uintToString(address _pool) public pure returns (string memory _uintAsString) {
      uint _i = uint256(_pool);
      if (_i == 0) {
          return "0";
      }
      uint j = _i;
      uint len;
      while (j != 0) {
          len++;
          j /= 10;
      }
      bytes memory bstr = new bytes(len);
      uint k = len - 1;
      while (_i != 0) {
          bstr[k--] = byte(uint8(48 + _i % 10));
          _i /= 10;
      }
      return string(bstr);
    }
  // function turnInt(address x) public view returns (uint) {
  //   return uint256(x);
  // }

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
    Funding(pool).rewardWinner(_data);
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