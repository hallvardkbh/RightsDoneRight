pragma solidity ^0.4.19;

import "./TokenOwnership.sol";


contract LicenseBase is TokenOwnership {

    struct LicenseProfile {
        //The block number of which the License profile is created
        uint birthTime;

        //type of license, i.e Performing, Mechanical, etc
        string licenseType;

        uint price;

        //Optional duration (weeks) of which a potential license purchase is valid
        uint duration;
    }

    //masterDB for all licensing profiles (both activated and non-approvd/deactivated)
    LicenseProfile[] public licenseProfileDB;

    //mapping from licenseProfileIdToWorkId
    mapping (uint => uint) public licenseProfileIdToWorkId;

    //mapping from a workId to all licensing profiles (borth activated and non-approved)
    mapping (uint => uint[]) public workIdToLicenseProfileList;

    //mapping from LicenseProfileId to a bool activation value
    mapping (uint => bool) public activatedProfiles;

    //mapping from a licenseProfile to a
    //mapping of associated tokens with their boolean activation value
    mapping (uint => mapping (uint => bool)) public licenseProfileToTokenActivation;

    //
    //
    event SendActivationRequest(
        uint licenseProfileId,
        address[] tokenHolders
    );

    /*
    PUBLIC FUNCTIONS altering the state of the contract
    These functions costs gas.
    blablabla mer info om dette
    */
    //
    //public function for registering a license profile
    function createLicenseProfile
    (uint _workId, string _licenseType, uint _price, uint _duration) public {

        //need to validate all inputs!
        //A License profile struct with info about the terms. PS: this data is permanent
        LicenseProfile memory _newLicenseProfile = LicenseProfile({
            birthTime: uint64(now),
            licenseType: _licenseType,
            price: _price,
            duration: _duration
        });

        //we push the newly created LicenseProfile-struct to the licenseProfileDB
        //Its ID (index in the licenseProfileDB array) is assigned the _newLicenseProfile variable
        uint _newLicenseProfileId = licenseProfileDB.push(_newLicenseProfile) - 1;

        //update licenseProfileIdToWorkId mapping
        licenseProfileIdToWorkId[_newLicenseProfileId] = _workId;

        //push the profileId to the list of profiles associated with the _workId
        workIdToLicenseProfileList[_workId].push(_newLicenseProfileId);

        //declear the LicenseProfile as inactive
        activatedProfiles[_newLicenseProfileId] = false;

        //list of tokens associated with the workId
        uint[] memory _tokenList = _getTokenListFromWorkId(_workId);

        //set false activation values for all relevant tokens
        for (uint i = 0; i < _tokenList.length; i++) {
            licenseProfileToTokenActivation[_newLicenseProfileId][_tokenList[i]] = false;
        }

        //list of token holders for a given _workId
        address[] memory _tokenHolders = _getTokenHoldersFromWorkId(_workId);

        //emit the SendActivationRequest event
        SendActivationRequest(_newLicenseProfileId, _tokenHolders);
    }

    //function for approving a licenseProfile
    function approveLicenseProfileActivation(uint _licenseProfileId) public {
        //the workId of the input _licenseProfileId
        uint _workId = _getWorkIdByLicenseProfileId(_licenseProfileId);

        //a list of tokenIds associated with _workId owned by msg.sender
        uint[] memory _ownedTokens = getTokensFromWorkIdAndAddress(_workId, msg.sender);

        //loop over the _ownedTokens
        for (uint i = 0; i < _ownedTokens.length; i++) {
            //set true activation values for the relevant tokens owned by msg.sender
            licenseProfileToTokenActivation[_licenseProfileId][_ownedTokens[i]] = true;
        }

        if (_checkLicenseProfileActivationMajority(_licenseProfileId)) {
            activatedProfiles[_licenseProfileId] = true;
        }else {
            activatedProfiles[_licenseProfileId] = false;
        }
    }

    //function for approving a licenseProfile
    function approveLicenseProfileDeactivation(uint _licenseProfileId) public {
        //the workId of the input _licenseProfileId
        uint _workId = _getWorkIdByLicenseProfileId(_licenseProfileId);

        //a list of tokenIds associated with _workId owned by msg.sender
        uint[] memory _ownedTokens = getTokensFromWorkIdAndAddress(_workId, msg.sender);

        //loop over the _ownedTokens
        for (uint i = 0; i < _ownedTokens.length; i++) {
            //set true activation values for the relevant tokens owned by msg.sender
            licenseProfileToTokenActivation[_licenseProfileId][_ownedTokens[i]] = false;
        }

        if (_checkLicenseProfileActivationMajority(_licenseProfileId)) {
            activatedProfiles[_licenseProfileId] = true;
        }else {
            activatedProfiles[_licenseProfileId] = false;
        }
    }

    /*
    //INTERNAL functions used by this and child-contracts
    */
    //function returning a de-struct license profile for a given _profileId
    function _getLicensePofileById(uint _profileId) public view returns(uint, string, uint, uint) {
        LicenseProfile memory _profile = licenseProfileDB[_profileId];

        return (_profile.birthTime, _profile.licenseType, _profile.price, _profile.duration);
    }

    //function returning a list of licenseProfileIds associated with a _workId
    function _getLicenseProfileListFromWorkId(uint _workId) internal view returns(uint[]) {
        return workIdToLicenseProfileList[_workId];
    }

    //function returning the workId associated with a _licenseProfileId
    function _getWorkIdByLicenseProfileId(uint _licenseProfileId) internal view returns(uint) {
        return licenseProfileIdToWorkId[_licenseProfileId];
    }

    function _checkLicenseProfileActivationMajority(uint _licenseProfileId) internal view returns(bool) {
        //the workId of the input _licenseProfileId
        uint _workId = _getWorkIdByLicenseProfileId(_licenseProfileId);

        //a list of all tokens associated with the _workId
        uint[] memory _tokenList = _getTokenListFromWorkId(_workId);

        //number of tokens in _tokenList
        uint numberOfTokens = _tokenList.length;

        //variables used to count number of activated tokens
        uint numberOfActivatedTokens = 0;

        //look through the tokens in _tokenList
        for (uint i = 0; i < _tokenList.length; i++) {
            //increase numberOfActivatedTokens for activated tokens
            if (licenseProfileToTokenActivation[_licenseProfileId][_tokenList[i]]) numberOfActivatedTokens++;
        }

        if (numberOfActivatedTokens >= (numberOfTokens/2)) return true;

        return false;
    }
}
