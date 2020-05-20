
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

  // function createFunding(address _cToken, address _operator, uint256 ticketPrice) public  returns (address fundingAddress) {
  //   Funding funding = new Funding(msg.sender, _cToken, _operator, address(0), ticketPrice);

  //   fundingAddress = address(funding);
  //   emit FundingCreated(fundingAddress, msg.sender, _operator, _cToken);
  // }

  function createFundingWithOracle(address _cToken, address _operator,
      string memory _oracleUrl, string memory _oraclePath, uint8 _level, uint256 ticketPrice) public  returns (address fundingAddress) {
    FundingOracleClient oracle = new FundingOracleClient(_oracleUrl, _oraclePath, _level, link);
    Funding funding = new Funding(msg.sender, _cToken, _operator, address(oracle), ticketPrice);

    fundingAddress = address(funding);
    oracle.transferOwnership(fundingAddress);
    emit FundingCreated(fundingAddress, msg.sender, _operator, _cToken);
  }
}
