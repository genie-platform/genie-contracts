
pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./BaseFunding.sol";
import "./CompoundFunding.sol";
import "./AaveFunding.sol";

contract FundingFactory is Initializable {
  event FundingCreated(address indexed funding, address owner, address operator, address interestToken, uint lendingProtocol) ;

  enum LendingProtocol { COMPOUND, AAVE }

  function initialize() public initializer {
  }

  function createFunding(address _interestToken, uint _lendingProtocol, address _operator) public  returns (address fundingAddress) {

    BaseFunding funding = _createFunding(_interestToken, _lendingProtocol, _operator);

    fundingAddress = address(funding);
    emit FundingCreated(fundingAddress, msg.sender, _operator, _interestToken, _lendingProtocol);
  }

  function _createFunding(address _interestToken, uint _lendingProtocol, address _operator) internal returns (BaseFunding funding) {
    require(uint(LendingProtocol.AAVE) >= _lendingProtocol, "FundingFactory/lendingProtocol");
    if (_lendingProtocol == uint(LendingProtocol.COMPOUND)) {
      funding = new CompoundFunding(msg.sender, _interestToken, _operator);
    } else {
      funding = new AaveFunding(msg.sender, _interestToken, _operator);
    }
  }
}
