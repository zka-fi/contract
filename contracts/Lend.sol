// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Lend is ERC20, ERC20Burnable {

    IERC20 public dai;
    constructor(address _dai) ERC20("ZDAI", "zdai") {
        dai = IERC20(_dai);
    }
        
    uint public totalPool;

    function bond (uint _daiAmount) external {
        uint zdai;
        if (totalPool == 0) {
            zdai = _daiAmount;
        } else {
            zdai = (_daiAmount * totalPool) / dai.balanceOf(address(this));
        }
        
        // dai -> CAdai
        dai.transferFrom(msg.sender, address(this), _daiAmount);
        totalPool += zdai;
        // need to add algo to give bond amount
        _mint(msg.sender, zdai);
    }

    function unbond (uint _zdaiAmount) external {
        // CAdai -> dai
        require(_zdaiAmount > 0, "zdai = 0");
        require(_zdaiAmount <= balanceOf(msg.sender), "zdai Not enough");
        // need to add algo to give bond amount
        uint daiAmount = (_zdaiAmount * dai.balanceOf(address(this))) / totalPool;
        totalPool -= _zdaiAmount;
        burn(_zdaiAmount);
        dai.approve(address(this), daiAmount);
        dai.transferFrom(address(this), msg.sender, daiAmount);
    }
}
