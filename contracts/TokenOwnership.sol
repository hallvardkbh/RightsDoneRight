pragma solidity ^0.4.19;

import "./WorkBase.sol";
import "./erc721.sol";


contract TokenOwnership is ERC721, WorkBase {


    //Name and symbol of the non-fungible token as defined in ERC721
    string public constant NAME = "RightCoin";
    string public constant SYMBOL = "RCN";

    //External functions required for ERC-721 compliance
    //
    /*
    Grant another address the right to transfer a specific token via TransferFrom()
    _to is the address to be granted transfer approvals
    Use address(0) to clear an approval
    */
    function approve(address _to, uint256 _tokenId) external {
        //only the owner of a token can grant transfer approval for that token
        require(_owns(msg.sender, _tokenId));

        //register the approval (replacing any previous  approvals)
        tokenIdToApproved[_tokenId] = _to;

        //Must also emit Approval-Event
    }

    /*
    Transfer a token owner by another address
    The calling address must previously have beeen granted approval by the owner
    _from is the address that owns the token
    _to is the address that will take ownership of the token (can be the caller)
    _tokenId is the ID of the token to be transferred
    */
    function transferFrom(address _from, address _to, uint256 _tokenId) external {
        //check for non-zero-address 0x0
        require(_to != address(0));

        //Check for valid ownership
        require(_owns(_from, _tokenId));

        //check for valid transfer approval
        require(msg.sender == tokenIdToApproved[_tokenId]);

        _transferToken(_from, _to, _tokenId);
    }

    /*
    transfers an rcn-token to another address
    _to is the address of the recipient
    _tokenId is the ID of the rcn-token to be transferred
    */
    function transfer(address _to, uint256 _tokenId) external {
        require(_owns(msg.sender, _tokenId));

        _transferToken(msg.sender, _to, _tokenId);
    }
    /*
    returning the list of all tokenIds owned by an address
    This is quire expensive and can crash the program if _owner has ownership of many tokens
    This function is optional

    function tokensOfOwner(address _owner) external view returns (uint256[] tokenIds) {
    }
    */

    //returning the address that has currently ownership of a tokenId
    function ownerOf(uint256 _tokenId) external view returns (address) {
        address _owner = _ownerOf(_tokenId);

        //throws exception if the address is 0x0
        require(_owner != address(0));

        return _owner;
    }

    //public functions defined as in ERC721.sol
    //
    //returns the total supply of all circulating rcn-tokens
    function totalSupply() public view returns (uint256) {
        return rcnDB.length;
    }

    //returns the token count for a given address owns
    function balanceOf(address _owner) public view returns (uint256) {
        return addressToTokenCount[_owner];
    }
}
