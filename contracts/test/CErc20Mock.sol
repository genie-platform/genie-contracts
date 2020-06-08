pragma solidity ^0.6.0;

import "../compound/ICErc20.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";

contract CErc20Mock is Initializable, ICErc20 {
  mapping(address => uint256) ownerTokenAmounts;

  uint256 __supplyRatePerBlock;

  function initialize (address _token, uint256 _supplyRatePerBlock) public initializer {
    require(_token != address(0), "token is not defined");
    underlying = _token;
    __supplyRatePerBlock = _supplyRatePerBlock;
  }

  function mint(uint256 amount) external override returns (uint) {
    ownerTokenAmounts[msg.sender] = ownerTokenAmounts[msg.sender] + amount;
    require(IERC20(underlying).transferFrom(msg.sender, address(this), amount), "could not transfer tokens");
    return 0;
  }

  function getCash() external override view returns (uint) {
    return IERC20(underlying).balanceOf(address(this));
  }

  function redeemUnderlying(uint256 requestedAmount) external override returns (uint) {
    require(requestedAmount <= ownerTokenAmounts[msg.sender], "insufficient underlying funds");
    ownerTokenAmounts[msg.sender] = ownerTokenAmounts[msg.sender] - requestedAmount;
    require(IERC20(underlying).transfer(msg.sender, requestedAmount), "could not transfer tokens");
  }

  function reward(address account) external {
    ownerTokenAmounts[account] = (ownerTokenAmounts[account] * 120) / 100;
  }

  function rewardCustom(address account, uint256 amount) external {
    ownerTokenAmounts[account] = ownerTokenAmounts[account] + amount;
  }

  function balanceOfUnderlying(address account) external override returns (uint) {
    return ownerTokenAmounts[account];
  }

  function supplyRatePerBlock() external override view returns (uint) {
    return __supplyRatePerBlock;
  }

  function setSupplyRateMantissa(uint256 _supplyRatePerBlock) external {
    __supplyRatePerBlock = _supplyRatePerBlock;
  }
}
