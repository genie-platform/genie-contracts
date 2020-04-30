
pragma solidity ^0.5.0;

// import "openzeppelin-s/upgrades/contracts/Initializable.sol";
import "./Funding.sol";

contract FundingFactory {


  event FundingCreated(address indexed funding, address owner, address operator) ;

  function createFunding(address _cToken, address _operator) public  returns (address fundingAddress) {

    Funding funding = new Funding(msg.sender, _cToken, _operator);

    fundingAddress = address(funding);
    emit FundingCreated(fundingAddress, msg.sender, _operator);
  }
}
