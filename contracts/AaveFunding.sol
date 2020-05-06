pragma solidity ^0.5.0;

import "./BaseFunding.sol";
import "./lending/aave/ILendingPool.sol";

contract AaveFunding is BaseFunding {

  /**
   * The Compound cToken that this Pool is bound to.
   */
  ICErc20 public aToken;


  ICErc20 public provider;

  constructor(address _owner, address _provider, address _token, address _operator) public BaseFunding(_owner, _operator) {
    provider = ICErc20(_provider);
  }

  function interestToken() public view returns (ICErc20) {
    return aToken;
  }

  function underlyingToken() public view returns (IERC20) {
    return IERC20(cToken.underlying());
  }

  function balanceOfUnderlying(address _account) public returns (uint256) {
    return cToken.balanceOfUnderlying(_account);
  }

  function _lend(uint256 _amount) internal {
    IERC20(underlyingToken()).approve(provider.getLendingPoolCore(), _amount);
    ILendingPool(provider.getLendingPool()).deposit(underlyingToken(), _amount, 0);

    require(underlyingToken().approve(address(cToken), _amount), "CompoundLending/approve");
    require(cToken.mint(_amount) == 0, "CompoundLending/supply");
  }

  function _redeemLending(address _sender, uint256 _amount) internal {
    require(cToken.redeemUnderlying(_amount) == 0, "CompoundLending/redeem");
    require(underlyingToken().transfer(_sender, _amount), "CompoundLending/transfer");
  }


}