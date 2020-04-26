pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./compound/ICErc20.sol";

contract Funding is Ownable {

  using SafeMath for uint256;

  /**
   * Contract's operator
   */
  address public operator;

  /**
   * The total of all balances
   */
  uint256 public accountedBalance;

  /**
   * The Compound cToken that this Pool is bound to.
   */
  ICErc20 public cToken;

  /**
   * The total deposits for each user.
   */
  mapping (address => uint256) internal balances;

  modifier onlyOperator() {
    require(msg.sender == operator, "is-admin");
    _;
  }

  constructor(address _operator) public {
    operator = _operator;
  }

  function deposit() public {

  }

  function withdraw() public {

  }

  /**
  * @notice Deposits into the pool for a user.  Updates their balance and transfers their tokens into this contract.
  * @param _spender The user who is depositing
  * @param _amount The amount they are depositing
  */
  function _depositFrom(address _spender, uint256 _amount) internal {
    // Update the user's balance
    balances[_spender] = balances[_spender].add(_amount);

    // Update the total of this contract
    accountedBalance = accountedBalance.add(_amount);

    // Deposit into Compound
    // require(token().approve(address(cToken), _amount), "Pool/approve");
    // require(cToken.mint(_amount) == 0, "Pool/supply");
  }

  function reward() public onlyOperator {

  }

}