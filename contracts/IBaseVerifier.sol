// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface IBaseVerifier {
    /// @return r  bool true if proof is valid
    function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[2] memory input
        ) external view returns (bool r);
}