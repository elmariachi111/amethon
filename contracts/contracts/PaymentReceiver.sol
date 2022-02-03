// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//import "./IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PaymentReceiver {
    address payable private _owner;

    //https://docs.instadapp.io/connectors/mainnet/1proto
    address immutable ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    event PaymentReceived(
        address indexed buyer,
        uint256 value,
        address token,
        bytes32 paymentId
    );

    modifier onlyOwner() {
        require(msg.sender == _owner, "only allowed to be called by the owner");
        _;
    }

    constructor() {
        _owner = payable(msg.sender);
    }

    receive() external payable {
        emit PaymentReceived(msg.sender, msg.value, ETH_ADDRESS, bytes32(0));
    }

    fallback() external payable {
        emit PaymentReceived(
            msg.sender,
            msg.value,
            ETH_ADDRESS,
            bytes32(msg.data)
        );
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function release() external onlyOwner {
        (bool ok, ) = _owner.call{value: getBalance()}("");
        require(ok, "Failed to release Eth");
    }

    function payWithErc20(
        IERC20 erc20,
        uint256 amount,
        uint256 paymentId
    ) external {
        erc20.transferFrom(msg.sender, _owner, amount);
        emit PaymentReceived(
            msg.sender,
            amount,
            address(erc20),
            bytes32(paymentId)
        );
    }
}
