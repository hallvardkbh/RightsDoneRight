pragma solidity ^0.4.19;

import "./LicenseBase.sol";


contract LicensePurchase is LicenseBase {


    //mapping from an address to a list of all purchased license profiles
    mapping (address => uint[]) public addressToPurchasedLicenseIds;

    //mapping from a tokenId to its balance
    //the sum of all token balances is equal to the contract's balance
    mapping (uint => uint) public tokenIdToBalance;

    //mapping from a licenseProfileId to the number of times it's been purchased
    mapping (uint => uint) public licenseProfilePurchaseCount;

    //event for logging purchases
    event LogPurchase(uint64 timeOfPurchase, uint licenseId, uint workId);

    //event for logging withdraws from a given workId
    event LogWithdrawFromWorkId(address withdrawer, uint workId, uint withdrawSum);

    //function for buying a licenseProfile
    function buyLicense(uint _licenseId) public payable returns (bool success) {

        //License profile has to be activated in order to buy it
        require(activatedProfiles[_licenseId]);

        //license profile struct variable
        LicenseProfile memory _licenseProfile = licenseProfileDB[_licenseId];

        //the amount of weis the purchaser sent in the transaction
        uint _amount = msg.value;

        //validate transaction value
        require(_amount == _licenseProfile.price);

        //associated workId
        uint _workId = _getWorkIdByLicenseProfileId(_licenseId);

        //list of tokens associated with the work associated with _licenseId
        uint[] memory _tokenList = _getTokenListFromWorkId(_workId);

        //the value of which we increase each tokenBalance
        //NOTE: the divide-operator rounds down to nearest uint; (10/3 = 3)
        //This means that each token might get a slightly lower balance increase
        //compared to what we would expect
        uint incrementValue = (msg.value / _tokenList.length);

        //loop over all tokens belonging to the work associated with _licenseId
        for (uint i = 0; i < _tokenList.length; i++) {
            //update the tokenIdToBalance mapping increasing the balance of the relevant tokens
            tokenIdToBalance[_tokenList[i]] += incrementValue;
        }

        //uppdate the addressToPurchasedLicenseIds mapping adding the _licenseId to the list value
        addressToPurchasedLicenseIds[msg.sender].push(_licenseId);

        //increment the count of which a license profile has been purchased
        licenseProfilePurchaseCount[_licenseId]++;

        //Emit LogPurchase event
        LogPurchase(uint64(now), _licenseId, _workId);

        return true;
    }

    //function for withdrawing the balance of all owned tokens associated with one work
    function withdrawFromWorkId(uint _workId) public returns (bool success) {

        //list of tokens owned by msg.sender associated with the input _workId 
        uint[] memory _ownedTokens = getTokensFromWorkIdAndAddress(_workId, msg.sender);


        uint _totalWithdraSum = 0;

        //iterate over owned tokens
        for (uint i = 0; i < _ownedTokens.length; i++) {
            uint _tokenId = _ownedTokens[i];

            //increase the withdraw sum with the balance of _tokenId
            _totalWithdraSum += tokenIdToBalance[_tokenId];

            //reset the balance associated with _tokenId
            delete tokenIdToBalance[_tokenId];
        }

        //transfer the sum from the contract balance to msg.sender
        msg.sender.transfer(_totalWithdraSum);

        LogWithdrawFromWorkId(msg.sender, _workId, _totalWithdraSum);

        return true;
    }

    function getTotalBalanceFromWorkIdAndAddress(uint _workId, address _address) public view returns (uint) {

        //list of tokens owned by msg.sender associated with the input _workId 
        uint[] memory _ownedTokens = getTokensFromWorkIdAndAddress(_workId, _address);

        uint _totalBalance = 0;

        //iterate over owned tokens
        for (uint i = 0; i < _ownedTokens.length; i++) {
            uint _tokenId = _ownedTokens[i];

            //increase the withdraw sum with the balance of _tokenId
            _totalBalance += tokenIdToBalance[_tokenId];
        }
        return _totalBalance;

    }

}
