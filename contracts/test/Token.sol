pragma solidity ^0.6.0;

// import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "@opengsn/gsn/contracts/TrustedForwarder.sol";

/**
 * @dev Extension of {ERC20} that adds a set of accounts with the {MinterRole},
 * which have permission to mint (create) new tokens as they see fit.
 *
 * At construction, the deployer of the contract is the only minter.
 */
contract Token is ERC20UpgradeSafe {
  // string public override name;
  // string public override symbol;
  // uint256 public override decimals;

  function initialize(address sender, string memory name, string memory symbol) public initializer {
      require(sender != address(0), "Pool/owner-zero");
      __ERC20_init(name, symbol);
  }

  /**
    * @dev See {ERC20-_mint}.
    *
    * Requirements:
    *
    * - the caller must have the {MinterRole}.
    */
  function mint(address account, uint256 amount) public returns (bool) {
      _mint(account, amount);
      return true;
  }

  uint256[50] private ______gap;
}
