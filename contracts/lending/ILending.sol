pragma solidity ^0.5.0;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "./compound/ICErc20.sol";

interface ILending {

  function deposit(uint256 _amount) external;
  function withdraw(address _receiver, uint256 _amount) external;
  function balanceOfUnderlying(address _account) external returns (uint);
  function interestToken() external returns (ICErc20);
  function underlyingToken() external view returns (IERC20);
}