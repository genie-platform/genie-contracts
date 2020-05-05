
pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./Funding.sol";

contract FundingFactory is Initializable {
  event FundingCreated(address indexed funding, address owner, address operator, address interestToken) ;

  enum LendingProtocol { COMPOUND, AAVE }
  LendingProtocol lendingProtocol;

  function initialize() public initializer {
  }

  function createFunding(address _interestToken, address _operator, uint lendingProtocol) public  returns (address fundingAddress) {

    Funding funding;
    if (lendingProtocol == COMPOUND) {
      funding = new Funding(msg.sender, _interestToken, _operator);
    } else {
      funding = new Funding(msg.sender, _interestToken, _operator);
    }

    fundingAddress = address(funding);
    emit FundingCreated(fundingAddress, msg.sender, _operator, _interestToken);
  }

  function _createFunding(address _interestToken, address _operator, uint lendingProtocol) internal returns (Funding funding) {
    require(uint(SomeData.AAVE) >= lendingProtocol, "FundingFactory/lendingProtocol");
    if (lendingProtocol == COMPOUND) {
      funding = new Funding(msg.sender, _interestToken, _operator);
    } else {
      funding = new Funding(msg.sender, _interestToken, _operator);
    }
  }
}
