pragma solidity ^0.4.19;

import "./TokenOwnership.sol";


contract LicenseBase is TokenOwnership {

    //A struct containing the birthTime and fingerprint of a license profile
    struct LicenseProfile {
        //The block number of which the License profile is created
        uint birthTime;

        //price in wei / ether
        uint price;

        //hash of the profile-document describing the terms for the profile
        bytes32 fingerprint;
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
    //mapping of associated tokens and their boolean activation value
    mapping (uint => mapping (uint => bool)) public licenseProfileToTokenActivation;

    //
    event CreateLicenseProfile(
        uint licenseProfileId,
        uint birthtime,
        bytes32 fingerprint,
        uint price,
        address[] tokenHolders
    );

    /*
    PUBLIC FUNCTIONS
    These functions costs gas as they alter the state of the contract
    blablabla mer info om dette
    */
    //
    //public function for registering a license profile
    function createLicenseProfile (uint _workId, uint _price, bytes32 _fingerprint) public returns (bool){

        //require(_workIsApproved(_workId));
        //need to validate inputs!
        //who can call this function?

        //get the timestamp of when the licenseProfile is created
        uint64 _birthTime = uint64(now);

        //A License profile struct with info about the terms. PS: this data is permanent
        LicenseProfile memory _newLicenseProfile = LicenseProfile({
            birthTime: _birthTime,
            price: _price,
            fingerprint: _fingerprint
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
        //PS: I think this is done by default
        for (uint i = 0; i < _tokenList.length; i++) {
            licenseProfileToTokenActivation[_newLicenseProfileId][_tokenList[i]] = false;
        }

        //list of token holders for a given _workId
        address[] memory _tokenHolders = _getTokenHoldersFromWorkId(_workId);

        //emit the CreateLicenseProfile event
        CreateLicenseProfile(_newLicenseProfileId, _birthTime, _fingerprint, _price, _tokenHolders);

        return true;
    }

    //function for approving activation of a licenseProfile
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

        _setLicenseActivationStatus(_licenseProfileId);
    }

    //function for approving deactivation of a licenseProfile
    function approveLicenseProfileDeactivation(uint _licenseProfileId) public {
        //the workId of the input _licenseProfileId
        uint _workId = _getWorkIdByLicenseProfileId(_licenseProfileId);

        //a list of tokenIds associated with _workId owned by msg.sender
        uint[] memory _ownedTokens = getTokensFromWorkIdAndAddress(_workId, msg.sender);

        //loop over the _ownedTokens
        for (uint i = 0; i < _ownedTokens.length; i++) {
            //set false activation values for the relevant tokens owned by msg.sender
            licenseProfileToTokenActivation[_licenseProfileId][_ownedTokens[i]] = false;
        }

        _setLicenseActivationStatus(_licenseProfileId);
    }

    /*
    //INTERNAL functions used by this and child-contracts
    */
    //function returning a de-struct license profile for a given _profileId
    function _getLicensePofileById(uint _profileId) public view returns(uint, uint, bytes32) {
        //local memory struct of a licenseProfile
        LicenseProfile memory _profile = licenseProfileDB[_profileId];

        return (_profile.birthTime, _profile.price, _profile.fingerprint);
    }

    //function returning a list of licenseProfileIds associated with a _workId
    function _getLicenseProfileListFromWorkId(uint _workId) internal view returns(uint[]) {
        return workIdToLicenseProfileList[_workId];
    }

    //function returning the workId associated with a _licenseProfileId
    function _getWorkIdByLicenseProfileId(uint _licenseProfileId) internal view returns(uint) {
        return licenseProfileIdToWorkId[_licenseProfileId];
    }

    //function checking for token activation majority
    function _checkLicenseProfileActivationMajority(uint _licenseProfileId) internal view returns(bool) {

        //a list of all tokens belonging to the work associated with _licenseProfileId
        uint[] memory _tokenList = _getTokenListFromWorkId(_getWorkIdByLicenseProfileId(_licenseProfileId));

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

    //function for setting the license activation bool value in the activatedProfiles mapping
    //used in approveLicenseProfileActivation() and approveLicenseProfileDeactivation()
    function _setLicenseActivationStatus(uint _licenseProfileId) internal {

        //check for license activation majority
        if (_checkLicenseProfileActivationMajority(_licenseProfileId)) {
            //activate the license profile
            activatedProfiles[_licenseProfileId] = true;
        }else {
            //deactivate the profile
            activatedProfiles[_licenseProfileId] = false;
        }

    }
}
