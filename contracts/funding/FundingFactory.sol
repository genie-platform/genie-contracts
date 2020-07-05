
pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./Funding.sol";
import "./chainlink/PoeChainlinkClient.sol";

contract FundingFactory is Initializable {

  event FundingCreated(address indexed funding, address owner, address operator, address interestToken) ;

  address public link;

  function initialize(
    address _link
  ) public initializer {
    link = _link;
  }

  function createPoeFunding(address _cToken, address _operator,
      address _oracle, bytes32 _jobId, uint8 _level, uint256 ticketPrice) public  returns (address fundingAddress) {
    FundingChainlinkClient oracle = new PoeChainlinkClient(link, _oracle, _jobId, _level);
    Funding funding = new Funding(msg.sender, _cToken, _operator, address(oracle), ticketPrice);

    fundingAddress = address(funding);
    oracle.transferOwnership(fundingAddress);
    emit FundingCreated(fundingAddress, msg.sender, _operator, _cToken);
  }
}
