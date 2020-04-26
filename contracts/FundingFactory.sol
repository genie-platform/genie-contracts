
pragma solidity ^0.6.0;

// import "openzeppelin-s/upgrades/contracts/Initializable.sol";
import "./Funding.sol";

contract FundingFactory {


  event FundingCreated(address indexed funding, address owner);

  function createFunding(address _operator) public  returns (address fundingAddress) {

    Funding funding = new Funding(_operator);

    funding.transferOwnership(msg.sender);

    fundingAddress = address(funding);
    emit FundingCreated(fundingAddress, msg.sender);
  }
}
