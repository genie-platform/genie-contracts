pragma solidity ^0.5.0;

import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/ReentrancyGuard.sol";
import '@openzeppelin/upgrades/contracts/Initializable.sol';

import "./compound/ICErc20.sol";

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
   * @param winner The address of the winner
   * @param winnings The net winnings given to the winner
   * @param fee The fee being given to the draw beneficiary
   */
  event Rewarded(
    address indexed winner,
    uint256 winnings,
    uint256 fee
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

  constructor(address _owner, address _cToken, address _operator) public {
    require(_owner != address(0), "Funding/owner-zero");
    require(_cToken != address(0), "Funding/ctoken-zero");
    require(_operator != address(0), "Funding/operator-zero");

    Ownable.initialize(_owner);
    cToken = ICErc20(_cToken);
    operator = _operator;
  }

  /**
   * @notice Returns the token underlying the cToken.
   * @return An ERC20 token address
   */
  function token() public view returns (IERC20) {
    return IERC20(cToken.underlying());
  }

  /**
   * @notice Returns a user's total balance.  This includes their sponsorships, fees, open deposits, and committed deposits.
   * @param _addr The address of the user to check.
   * @return The user's current balance.
   */
  function balanceOf(address _addr) external view returns (uint256) {
    return balances[_addr];
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
    // Update the user's balance
    balances[_spender] = balances[_spender].add(_amount);

    // Update the total of this contract
    accountedBalance = accountedBalance.add(_amount);

    // Deposit into Compound
    require(token().approve(address(cToken), _amount), "Funding/approve");
    require(cToken.mint(_amount) == 0, "Funding/supply");
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
    require(cToken.redeemUnderlying(_amount) == 0, "Funding/redeem");
    require(token().transfer(_sender, _amount), "Funding/transfer");
  }

  function reward() public onlyOperator {

  }

}