pragma solidity ^0.4.19;

import "./WorkBase.sol";
import "./erc721.sol";


contract TokenOwnersip is ERC721, WorkBase {

    string public constant NAME = "RightCoin";
    string public constant SYMBOL = "RCN";

    function approve(address _to, uint256 _tokenId) external {
      //required for ERC-721 compliance
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) external {
      //required for ERC-721 compliance
    }

    //function for transfering rcn-tokens
    function transfer(address _to, uint256 _tokenId) external {
        require(_owns(msg.sender, _tokenId));

        _transferToken(msg.sender, _to, _tokenId);
    }

    //function returning the address that has ownership of a tokenId
    function ownerOf(uint256 _tokenId) external view returns (address) {
        address owner = tokenIdToOwner[_tokenId];

        //throws exception if the address is 0x0
        require(owner != address(0));
        return (owner);
    }

    //function for checking if a given address has ownership of a given tokenId
    function _owns(address _address, uint _tokenId) public view returns(bool) {
        return (tokenIdToOwner[_tokenId] == _address);
    }

    //returns the total supply of all circulating rcn-tokens
    function totalSupply() public view returns (uint256) {
        return rcnDB.length;
    }

    //returns the token count for a given address owns
    function balanceOf(address _owner) public view returns (uint256) {
        return addressToTokenCount[_owner];
    }

}
