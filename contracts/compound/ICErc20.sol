pragma solidity ^0.6.0;

abstract contract ICErc20 {
    address public underlying;
    function mint(uint256 mintAmount) external virtual returns (uint);
    function redeemUnderlying(uint256 redeemAmount) external virtual returns (uint);
    function balanceOfUnderlying(address owner) external virtual returns (uint);
    function getCash() external virtual view returns (uint);
    function supplyRatePerBlock() external virtual view returns (uint);
}