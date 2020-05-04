pragma solidity ^0.5.0;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "./ICErc20.sol";
import "../ILending.sol";

contract CompoundLending is ILending {

    /**
   * The Compound cToken that this Pool is bound to.
   */
  ICErc20 public cToken;
  IERC20 public token;

  constructor(address _cToken) public {
    cToken = ICErc20(_cToken);
    token = IERC20(cToken.underlying());
  }

  function deposit(uint256 _amount) external {
    require(token.approve(address(cToken), _amount), "CompoundLending/approve");
    require(cToken.mint(_amount) == 0, "CompoundLending/supply");
  }

  function withdraw(address _receiver, uint256 _amount) external {
    require(cToken.redeemUnderlying(_amount) == 0, "CompoundLending/redeem");
    require(token.transfer(_receiver, _amount), "CompoundLending/transfer");
  }

  function balanceOfUnderlying(address _account) external returns (uint) {
    return cToken.balanceOfUnderlying(_account);
  }

  function interestToken() external returns (ICErc20) {
    return cToken;
  }

  function underlyingToken() external view returns (IERC20){
    return IERC20(cToken.underlying());
    // return token;
  }



  // /**
  //  * @notice Returns the token underlying the cToken.
  //  * @return An ERC20 token address
  //  */
  // function token() public view returns (IERC20) {
  //   return cToken.underlying();
  // }
}