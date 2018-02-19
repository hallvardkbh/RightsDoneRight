pragma ^0.4.19;

contract TokenOwnersip is ERC721, WorkBase {

  string public constant name = "RightCoin";
  string public constant symbol = "RCN";



  function totalSupply() public view returns (uint256 total){
    //required for ERC-721 compliance
  }

  function balanceOf(address _owner) public view returns (uint256 balance){
    //required for ERC-721 compliance
  }


  function ownerOf(uint256 _tokenId) external view returns (address owner){
    //required for ERC-721 compliance
  }


  function approve(address _to, uint256 _tokenId) external{
    //required for ERC-721 compliance
  }


  function transfer(address _to, uint256 _tokenId) external{
    //required for ERC-721 compliance
  }


  function transferFrom(address _from, address _to, uint256 _tokenId) external{
    //required for ERC-721 compliance
  }


}
