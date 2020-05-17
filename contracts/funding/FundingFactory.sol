
pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./Funding.sol";
import "./FundingOracle.sol";

contract FundingFactory is Initializable {

  event FundingCreated(address indexed funding, address owner, address operator, address interestToken) ;

  address public link;

  function initialize(
    address _link
  ) public initializer {
    link = _link;
  }

  function createFunding(address _cToken, address _operator) public  returns (address fundingAddress) {
    FundingOracle oracle = new FundingOracle(link);
    Funding funding = new Funding(msg.sender, _cToken, _operator, address(oracle));

    fundingAddress = address(funding);
    emit FundingCreated(fundingAddress, msg.sender, _operator, _cToken);
  }
}
