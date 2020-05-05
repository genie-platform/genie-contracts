pragma solidity ^0.5.0;

import "./BaseFunding.sol";

contract AaveFunding is BaseFunding {

  /**
   * The Compound cToken that this Pool is bound to.
   */
  ICErc20 public cToken;

  constructor(address _owner, address _cToken, address _operator) public BaseFunding(_owner, _operator) {
    cToken = ICErc20(_cToken);
  }

  function interestToken() public view returns (ICErc20) {
    return cToken;
  }

  function underlyingToken() public view returns (IERC20) {
    return IERC20(cToken.underlying());
  }

  function balanceOfUnderlying(address _account) public returns (uint256) {
    return cToken.balanceOfUnderlying(_account);
  }

  function _lend(uint256 _amount) internal {
    require(underlyingToken().approve(address(cToken), _amount), "CompoundLending/approve");
    require(cToken.mint(_amount) == 0, "CompoundLending/supply");
  }

  function _redeemLending(address _sender, uint256 _amount) internal {
    require(cToken.redeemUnderlying(_amount) == 0, "CompoundLending/redeem");
    require(underlyingToken().transfer(_sender, _amount), "CompoundLending/transfer");
  }


}