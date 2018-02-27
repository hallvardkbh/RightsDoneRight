pragma solidity ^0.4.19;

import "./WorkBase.sol";
import "./erc721.sol";


contract TokenOwnersip is ERC721, WorkBase {

    string public constant NAME = "RightCoin";
    string public constant SYMBOL = "RCN";

    function approve(address _to, uint256 _tokenId) external {
    //required for ERC-721 compliance
    }

    function transfer(address _to, uint256 _tokenId) external {
    //required for ERC-721 compliance
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) external {
    //required for ERC-721 compliance
    }

    function ownerOf(uint256 _tokenId) external view returns (address) {
        address owner = tokenIdToOwner[_tokenId];
        require(owner != address(0));
        return (owner);
    }

    function _owns(address _address, uint _tokenId) public view returns(bool) {
        return (tokenIdToOwner[_tokenId] == _address);
    }

    function totalSupply() public view returns (uint256) {
        return rcnDB.length;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return addressToTokenCount[_owner];
    }

}
