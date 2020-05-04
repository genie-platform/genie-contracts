
pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./Funding.sol";
import "./lending/ILending.sol";
import "./lending/compound/CompoundLending.sol";

contract FundingFactory is Initializable {

  event FundingCreated(address indexed funding, address owner, address operator, address interestToken) ;

  function initialize() public initializer {
  }

  function createFunding(address _cToken, address _operator) public  returns (address fundingAddress) {

    ILending iLending = new CompoundLending(_cToken);
    Funding funding = new Funding(msg.sender, iLending, _operator);

    fundingAddress = address(funding);
    emit FundingCreated(fundingAddress, msg.sender, _operator, _cToken);
  }
}
