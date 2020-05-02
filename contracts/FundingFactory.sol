
pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./Funding.sol";

contract FundingFactory is Initializable {

  event FundingCreated(address indexed funding, address owner, address operator, address interestToken) ;

  function initialize() public initializer {
  }

  function createFunding(address _cToken, address _operator) public  returns (address fundingAddress) {

    Funding funding = new Funding(msg.sender, _cToken, _operator);

    fundingAddress = address(funding);
    emit FundingCreated(fundingAddress, msg.sender, _operator, _cToken);
  }
}
