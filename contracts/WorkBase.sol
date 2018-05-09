pragma solidity ^0.4.19;


contract WorkBase {

//every musical work is represented by a struct with a set of variables
    struct Work {

        //timestamp from the block when this work was registered
        uint64 birthTime;

        //the Keccak-256 hash fingerprint of the uploaded file
        uint fingerprint;

        //list of contributors address
        address[] contributors;

        //list of percentage of owned works
        uint[] splits;
    }

    //An array containing the work struct for all registered works in existence.
    //the index of the struct in the array is the ID of the work
    Work[] public workDB;

    //a master database of all issued copyright tokens
    //whenever a work is created and approved, a number of tokens are issued and added to this array.
    //A tokens index in the array is its tokenId.
    uint[] public rcnDB;


    /*
    Mappings containing basic data structures holding neseccary data (contract state)
    All these are currently public for testing purposes. They should change to internal or private when deployed
    */

    //mapping from workId to a boolean approved value
    mapping(uint => bool) public workIdToApproved;

    //mapping from a workId to a
    //mapping of contributors and their boolean work-approval value
    mapping(uint=> mapping(address => bool)) public workIdToAddressApproval;

    // mapping from tokenID to the address of its owner
    mapping(uint => address) public tokenIdToOwner;

    //mapping from address to an array of workIds
    mapping(address => uint[]) public addressToWorkList;

    //mapping from workId to array of associated tokenIDs
    mapping(uint => uint[]) public workIdToTokenList;

    //mapping from workId to tokenHolders
    mapping(uint => address[]) public workIdToTokenHolders;

    //mapping from owner address to the count of tokens that address owns
    mapping(address => uint) public addressToTokenCount;

    //mapping from tokenId to an address that has been approved to call transferFrom()
    //each token can only have one approved address for transfer at any time.
    mapping (uint => address) public tokenIdToApproved;

    //event fired in createWork()
    event CreateWork(uint workId, uint64 birthTime,
        uint fingerprint, address[] contributors, uint[] splits
    );

    //event fired in approveWork()
    event ApproveWork(uint workId, address approver);

    //event fired in _allContributorsApproved() if it returns true
    event WorkApproved(uint workId);

    /*
    PUBLIC FUNCTIONS altering the state of the contract
    These functions costs gas.
    blablabla mer info om dette
    */
    //
    //function for registering a work
    //This will update the worklist of all contributors and assign rcn-tokens according to the _splits[] argument
    function createWork (uint _fingerprint, address[] _contributors, uint[] _splits) public returns (bool) {

        require(_contributors.length == _splits.length);
        //need to validate all inputs!

        //get the timestamp of when the work is created
        uint64 _birthTime = uint64(now);

        //A work struct with info about the work. PS: this data is permanent
        Work memory _newWork = Work({
            birthTime: _birthTime,
            fingerprint: _fingerprint,
            contributors: _contributors,
            splits: _splits
        });

        //we push the newly created work-struct to the workDB
        //Its ID (index in the workDB array) is assigned the newWorkId variable
        uint _newWorkId = workDB.push(_newWork) - 1;

        //set the work to inactive until all contributors has approved the splits
        //NOTE: this is also the default value, so vi may skip this code-line
        workIdToApproved[_newWorkId] = false;

        //emit the createWork event
        CreateWork(_newWorkId, _birthTime, _fingerprint, _contributors, _splits);

        return true;
    }

    //function for a contributor to approve a newly created work
    function approveWork(uint _workId) public returns (bool) {
        //the caller updates workIdToAddressApproval mapping setting the msg.sender to true
        workIdToAddressApproval[_workId][msg.sender] = true;

        //check for approval from all relevant contributors
        if (_allContributorsApproved(_workId)) {

            WorkApproved(_workId);

            //update workIdToApproved mapping
            workIdToApproved[_workId] = true;

            //issue tokens for the workId
            _issueRcnTokens(_workId);
        }

        //emit the approved work event
        ApproveWork(_workId, msg.sender);

        //return true if succesfully approving the work
        return true;
    }

    /*
    PUBLIC VIEW FUNCTIONS
    These functions are free as they don't require miners to mine state changes
    They are free meaning everyone can call them (also other contracts)
    */
    //function returning a de-struct work-struct
    function getWorkById(uint _id) public view returns (uint64, uint, address[], uint[], bool) {
        Work memory _work = workDB[_id];
        bool _approvedStatus = _workIsApproved(_id);

        return (_work.birthTime, _work.fingerprint, _work.contributors, _work.splits, _approvedStatus);
    }

    //function returning the length of workDB
    function _getWorkDbLength() public view returns (uint) {
        return workDB.length;
    }

    function _workIsApproved(uint _workId) public view returns (bool) {
        return workIdToApproved[_workId];
    }

    //function returning a list of tokenIds associated with a _workId
    function _getTokenListFromWorkId (uint _workId) public view returns (uint[]) {
        return workIdToTokenList[_workId];
    }

    //function returning the workId associated with any _tokenId
    function _getWorkIdfromTokenId(uint _tokenId) public view returns (uint) {
        //throws exception if _tokenId is not valid (not owned by anyone)
        require(tokenIdToOwner[_tokenId] != address(0));

        return rcnDB[_tokenId];
    }

    //function returning all addresses that owns tokens for a given _workId
    function _getTokenHoldersFromWorkId(uint _workId) public view returns(address[]) {
        return workIdToTokenHolders[_workId];
    }

    //returning the address that has currently ownership of a tokenId
    function _ownerOf(uint256 _tokenId) public view returns (address) {
        return tokenIdToOwner[_tokenId];
    }

    //function returning two lists
    //the first contains all workIds associated with a given _address
    //the second lists the asociated number of owned tokens for all the workIds in the first list
    function getWorkListWithTokenCountFromAddress(address _address) public view
    returns(uint[] workId, uint[] numberOfTokens) {

        //list containing all works associated with an address
        uint[] memory _workList = addressToWorkList[_address];

        //an empty array of uints with size equal to _worklist
        uint[] memory _amountList = new uint[](_workList.length);

        //loop over all the workIds in the worklist
        for (uint i = 0; i < _workList.length; i++) {

            //list of all tokens associated with workId
            uint[] memory _tokensFromWorkId = _getTokenListFromWorkId(_workList[i]);

            //iterate over all tokens associated with _workList[i]
            for (uint j = 0; j < _tokensFromWorkId.length; j++) {

                //increment the amountList at i'th position if _address owns the token
                if (_owns(_address, _tokensFromWorkId[j])) _amountList[i]++;
            }
        }
        return (_workList, _amountList);
    }

    //function returning a list of tokenIds an address owns for a given workId
    function getTokensFromWorkIdAndAddress(uint _workId, address _address) public view
    returns (uint[] tokenIdList) {
        //all tokens associated with a workId
        uint[] memory _tokenList = _getTokenListFromWorkId(_workId);

        uint _numberOfOwnedTokens = 0;

        //loop for generating the number of tokens owned by _address
        for (uint i = 0; i < _tokenList.length; i++) {
            if (_owns(_address, _tokenList[i])) _numberOfOwnedTokens++;
        }

        //create a memory list with the size equal to _numberOfOwnedTokens
        uint[] memory _result = new uint[](_numberOfOwnedTokens);

        //variable for keeping track of where to insert the tokenId
        uint _insertIndex = 0;
        //fill the _result list with tokenIds owned by _address
        for (uint j = 0; j < _tokenList.length; j++) {

            if (_owns(_address, _tokenList[j])) {
                _result[_insertIndex] = _tokenList[j];
                _insertIndex++;
            }
        }
        return _result;
    }

    /*INTERNAL "help" functions used by this and child-contracts
    //These are used for various purposes, but should not be public. WHY?
    */
    //
    //function for checking if a given address has ownership of a given tokenId
    function _owns(address _address, uint _tokenId) internal view returns(bool) {
        return (tokenIdToOwner[_tokenId] == _address);
    }

    //function for issuing rcn-tokens to contirbutors of a work
    //this might require more validation,
    //should only be called after _allContributorsApproved returns to true
    function _issueRcnTokens(uint _workId) internal returns (bool) {
        //variable contraining the relevant work struct
        Work memory _work = workDB[_workId];

        //list of all contributors
        address[] memory _contributors = _work.contributors;

        //list of splits
        uint[] memory _splits = _work.splits;

        //Loop over all contributors
        for (uint i= 0; i < _contributors.length; i++) {
            address _contributor = _contributors[i];

            //update mapping from contributors to their worklist
            //meaning this contributor has one or more tokens related to this work
            addressToWorkList[_contributor].push(_workId);

            //update mapping from workId to tokenHolders
            workIdToTokenHolders[_workId].push(_contributor);

            //Loop from value 0 to _splits[i] (_splits[i] = number of tokens for _contributors[i])
            for (uint j= 0; j < _splits[i]; j++) {

                //create new rcn-token and push it to the master rcnDB
                //its value is the related workId and its index in the array becomes the tokenId
                uint _newTokenId = rcnDB.push(_workId) - 1;

                //Fill the tokenID-list in workIdToTokenList
                workIdToTokenList[_workId].push(_newTokenId);

                //call the internal transfer function for assigning token ownership
                _transferToken(0, _contributor, _newTokenId);
            }
        }
    }

    //function for checking if all contributors of a work have approved it
    function _allContributorsApproved(uint _workId) internal view returns(bool) {
        //variable contraining the relevant work struct
        Work memory _work = workDB[_workId];

        //list of all relevant contributors
        address[] memory _contributors = _work.contributors;

        uint _numberOfContributors = _contributors.length;

        uint _numberOfApprovedContributor = 0;

        //loop over contributors to check their approval status for workId
        for (uint i = 0; i < _numberOfContributors; i++) {
            //increment _numberOfApprovedContirbutors if contributor[i] has approved
            if (workIdToAddressApproval[_workId][_contributors[i]]) _numberOfApprovedContributor++;
        }

        //return true if all contributors have approvd
        return(_numberOfApprovedContributor == _numberOfContributors);
    }

    //function for checking if a given _workId exists in the worklist associated with an address
    function _workIdNotInWorkList(uint _workId, address _address) internal view
    returns(bool) {
        uint[] memory _workList = addressToWorkList[_address];
        for (uint i = 0; i < _workList.length; i++) {
            if (_workId == _workList[i]) return false;
        }
        return true;
    }

    //function for token ownership assignment
    //used in _issueToken() and transfer()
    function _transferToken(address _from, address _to, uint _tokenId) internal {
        //increase the token count associated with the _to address
        addressToTokenCount[_to]++;

        //for "newborn tokens", we insert the (token=>address) key-value pair in the tokenIdToOwner mapping
        //for existing tokens, we update the address-value of a tokenID-key to the _to address
        tokenIdToOwner[_tokenId] = _to;

        //For existing tokens, the _from address is not 0x0
        //This is the case in transer(), and we have to to more checks and operations
        if (_from != address(0)) {

            addressToTokenCount[_from]--;

            //clear approved transfer allowance for the token
            delete tokenIdToApproved[_tokenId];

            //get the workId associated with the _tokenId
            uint _workId = _getWorkIdfromTokenId(_tokenId);

            //check if _to address already has the workId in his workList
            if (_workIdNotInWorkList(_workId, _to)) {

                //add the workId to worklist associated with the _to address
                addressToWorkList[_to].push(_workId);

                //add the _to address in workIdToTokenHolders mapping
                workIdToTokenHolders[_workId].push(_to);
            }
        }
        //Must also emit the Transfer-event
    }
}
