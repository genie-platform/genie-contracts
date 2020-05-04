pragma solidity ^0.5.0;

import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/ReentrancyGuard.sol";
import '@openzeppelin/upgrades/contracts/Initializable.sol';

import "./lending/compound/ICErc20.sol";
import "./lending/ILending.sol";

contract Funding is Ownable, ReentrancyGuard {

  using SafeMath for uint256;


  /**
   * Emitted when a user deposits into the Pool.
   * @param sender The purchaser of the tickets
   * @param amount The size of the deposit
   */
  event Deposited(address indexed sender, uint256 amount);

    /**
   * Emitted when a user withdraws from the pool.
   * @param sender The user that is withdrawing from the pool
   * @param amount The amount that the user withdrew
   */
  event Withdrawn(address indexed sender, uint256 amount);

  /**
   * Emitted when a draw is rewarded.
   * @param receiver The address of the reward receiver
   * @param amount The amount of the win
   */
  event Rewarded(
    address indexed receiver,
    uint256 amount
  );

  /**
   * Contract's operator
   */
  address public operator;

  /**
   * The total of all balances
   */
  uint256 public accountedBalance;

  /**
   * Lending interface that this Pool is bound to.
   */
  ILending public iLending;

  /**
   * The total deposits for each user.
   */
  mapping (address => uint256) internal balances;

  modifier onlyOperator() {
    require(msg.sender == operator, "Funding/is-opetator");
    _;
  }

    modifier onlyOperatorOrOwner() {
    require(msg.sender == operator || msg.sender == owner(), "Funding/is-opetator-or-owner");
    _;
  }

  constructor(address _owner, ILending _iLending, address _operator) public {
    require(_owner != address(0), "Funding/owner-zero");
    require(address(_iLending) != address(0), "Funding/lending-zero");
    require(_operator != address(0), "Funding/operator-zero");

    Ownable.initialize(_owner);
    iLending = _iLending;
    // cToken = ICErc20(_cToken);
    operator = _operator;
  }

  function deposit(uint256 _amount) public nonReentrant {
    // Transfer the tokens into this contract
    require(token().transferFrom(msg.sender, address(this), _amount), "Funding/t-fail");

    // Deposit the funds
    _depositFrom(msg.sender, _amount);

    emit Deposited(msg.sender, _amount);
    // _depositPoolFrom(msg.sender, _amount);
  }

  /**
   * @notice Withdraw the sender's entire balance back to them.
   */
  function withdraw() public nonReentrant {
    uint256 balance = balances[msg.sender];
    _withdraw(msg.sender, balance);

    emit Withdrawn(msg.sender, balance);
  }

  /**
  * @notice Deposits into the pool for a user.  Updates their balance and transfers their tokens into this contract.
  * @param _spender The user who is depositing
  * @param _amount The amount they are depositing
  */
  function _depositFrom(address _spender, uint256 _amount) internal {
    require(_amount != 0, "Funding/deposit-zero");
    // Update the user's balance
    balances[_spender] = balances[_spender].add(_amount);

    // Update the total of this contract
    accountedBalance = accountedBalance.add(_amount);

    // Deposit into Compound
    iLending.deposit(_amount);
    // require(token().approve(address(cToken), _amount), "Funding/approve");
    // require(cToken.mint(_amount) == 0, "Funding/supply");
  }

    /**
   * @notice Transfers tokens from the cToken contract to the sender.  Updates the accounted balance.
   */
  function _withdraw(address _sender, uint256 _amount) internal {
    uint256 balance = balances[_sender];

    require(_amount <= balance, "Funding/no-funds");

    // Update the user's balance
    balances[_sender] = balance.sub(_amount);

    // Update the total of this contract
    accountedBalance = accountedBalance.sub(_amount);

    // Withdraw from Compound and transfer
    iLending.withdraw(_sender, _amount);
    // require(cToken.redeemUnderlying(_amount) == 0, "Funding/redeem");
    // require(token().transfer(_sender, _amount), "Funding/transfer");
  }

  function reward(address _receiver) public onlyOperatorOrOwner {
    require(_receiver != address(0), "Funding/receiver-zero");

    uint256 amount = interestEarned();
    require(amount != 0, "Funding/reward-zero");

    // require(cToken.redeemUnderlying(amount) == 0, "Funding/redeem");
    // require(token().transfer(_receiver, amount), "Funding/transfer");
    iLending.withdraw(_receiver, amount);

    emit Rewarded(_receiver, amount);
  }

    /**
   * @notice Returns the token underlying the cToken.
   * @return An ERC20 token address
   */
  function token() public view returns (IERC20) {
    return iLending.underlyingToken();
    // return IERC20(cToken.underlying());
  }

  /**
   * @notice Returns a user's total balance.  This includes their sponsorships, fees, open deposits, and committed deposits.
   * @param _addr The address of the user to check.
   * @return The user's current balance.
   */
  function balanceOf(address _addr) external view returns (uint256) {
    return balances[_addr];
  }

  /**
   * @notice Returns the underlying balance of this contract in the cToken.
   * @return The cToken underlying balance for this contract.
   */
  function balance() public returns (uint256) {
    // return cToken.balanceOfUnderlying(address(this));
    // return 0;
    return iLending.balanceOfUnderlying(address(this));
  }

    /**
   * @notice Returns the interest earned by the contract till now
   * @return The cToken underlying balance for this contract minus the deposited balance.
   */
  function interestEarned() public returns (uint256) {
    return balance().sub(accountedBalance);
  }


    /**
   * @notice Calculates the total estimated interest earned for the given number of blocks
   * @param _blocks The number of block that interest accrued for
   * @return The total estimated interest as a 18 point fixed decimal.
   */
  // function estimatedInterestRate(uint256 _blocks) public view returns (uint256) {
  //   return supplyRatePerBlock().mul(_blocks);
  // }

  /**
   * @notice Convenience function to return the supplyRatePerBlock value from the money market contract.
   * @return The cToken supply rate per block
   */
  // function supplyRatePerBlock() public view returns (uint256) {
  //   return cToken.supplyRatePerBlock();
  // }

}