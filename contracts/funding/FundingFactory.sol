
pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./Funding.sol";
import "./FundingOracleClient.sol";

contract FundingFactory is Initializable {

  event FundingCreated(address indexed funding, address owner, address operator, address interestToken) ;

  address public link;

  function initialize(
    address _link
  ) public initializer {
    link = _link;
  }

  function createFunding(address _cToken, address _operator,
      address _oracle, bytes32 _jobId, uint8 _level, uint256 ticketPrice) public  returns (address fundingAddress) {
    FundingOracleClient oracle = new FundingOracleClient(_oracle, _jobId, _level, link);
    Funding funding = new Funding(msg.sender, _cToken, _operator, address(oracle), ticketPrice);

    fundingAddress = address(funding);
    oracle.transferOwnership(fundingAddress);
    emit FundingCreated(fundingAddress, msg.sender, _operator, _cToken);
  }
}
