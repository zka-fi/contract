// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IBaseVerifier.sol";

contract Zkafi is ERC20, ERC20Burnable, Ownable {

    IBaseVerifier public baseVerifier;
    IERC20 public dai;
    constructor(address _dai, address _baseVerifierAddress) ERC20("ZDAI", "zdai") {
        dai = IERC20(_dai);
        baseVerifier = IBaseVerifier(_baseVerifierAddress);
    }

    struct ProofData {
        uint[2] a;
        uint[2][2] b;
        uint[2] c;
        uint[2] input;
    }

    uint public annualInterestRate = 3 * 1e16; // 3%
    uint private interestRatePerSecond = annualInterestRate / 31536000;
        
    uint public totalPool;
    mapping(address => uint) private usersBorrowedAmount;
    mapping(address => uint) private usersBorrowedTimestamp;
    mapping(address => bool) private liquidator;

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

    function noPermissionBorrow (ProofData memory proofData) external {      
        require(verifyProof(proofData), "Verification Failed");
        require(usersBorrowedAmount[msg.sender] == 0, "You should repay debt first");
        uint _daiAmount = proofData.input[1];
        require(_daiAmount <= dai.balanceOf(address(this)));

        usersBorrowedAmount[msg.sender] += _daiAmount;
        usersBorrowedTimestamp[msg.sender] = block.timestamp;
        dai.approve(address(this), _daiAmount);
        dai.transferFrom(address(this), msg.sender, _daiAmount);
    }

    function noPermissionRepay (uint _daiAmount) external {
        require(_daiAmount <= dai.balanceOf(msg.sender), "No enough dai");

        uint repayAmount = this.calculateRepayAmount(msg.sender);
        usersBorrowedAmount[msg.sender] = repayAmount;

        if (_daiAmount > repayAmount) {
            _daiAmount = repayAmount;
        }
        dai.transferFrom(msg.sender, address(this), _daiAmount);
        usersBorrowedAmount[msg.sender] -= _daiAmount;
        delete usersBorrowedTimestamp[msg.sender];
    }

    function calculateRepayAmount (address borrower) public view returns(uint) {
        uint interest = usersBorrowedAmount[borrower] * (block.timestamp - usersBorrowedTimestamp[borrower]) * interestRatePerSecond / 1e18;
        uint repayAmount = usersBorrowedAmount[borrower] + interest;
        return repayAmount;
    }

    function verifyProof(ProofData memory proofData) private view returns (bool) {
        return baseVerifier.verifyProof(
            proofData.a,
            proofData.b,
            proofData.c,
            proofData.input
        );
    }

    function getUserBorrowedAmount () public view returns(uint) {
        return usersBorrowedAmount[msg.sender];
    }

    function getUserBorrowedTimestamp () public view returns(uint) {
        return usersBorrowedTimestamp[msg.sender];
    }

    function setAnnualInterestRate (uint Rate) external onlyOwner {
        annualInterestRate = Rate * 1e16;
    }

    function setLiquidator(address target, bool isLiquidator) external onlyOwner {
        liquidator[target] = isLiquidator;
    }

    function liquidate (uint _daiAmount, address borrower) external {
        require(_daiAmount <= dai.balanceOf(msg.sender));
        require(liquidator[msg.sender] == true, "You are not liquidator");

        uint repayAmount = this.calculateRepayAmount(borrower);
        usersBorrowedAmount[borrower] = repayAmount;

        if (_daiAmount > repayAmount) {
            _daiAmount = repayAmount;
        }
        dai.transferFrom(msg.sender, address(this), _daiAmount);
        usersBorrowedAmount[msg.sender] -= _daiAmount;
        delete usersBorrowedTimestamp[borrower];
    }
}
