pragma solidity ^0.5.0;

contract IAErc20 {
    address public underlyingAssetAddress;

    function redeem(uint256 _amount) external;
    // function mint(uint256 mintAmount) external returns (uint);
    // function redeemUnderlying(uint256 redeemAmount) external returns (uint);
    // function balanceOfUnderlying(address owner) external returns (uint);
}