pragma solidity ^0.4.19;


contract WorkBase {
//every musical work is represented by a struct with a set of variables
    struct Work {

      //timestamp from the block when this work was registered
        uint64 birthTime;

        //description of work, i.e "musical composition" or "sound recording of blablabla"
        string typeOfWork;

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
    //whenever a work is created, 100 copyright tokens are created and added to this array,
    //with their index in the array becoming the copyright token's ID.
    uint[] public rcnDB;

    // mapping from tokenID to the address of its owner
    mapping(uint => address) public tokenIdToOwner;

    //mapping from address to an array of workIds
    mapping(address => uint[]) public addressToWorkList;

    //mapping from workId to array of associated tokenIDs
    mapping(uint => uint[]) public workIdToTokenList;

    //mapping from owner address to the count of tokens that address owns
    mapping(address => uint) public addressToTokenCount;

    //mapping from tokenId to an address that has been approved to call transferFrom()
    //each token can only have one approved address for transfer at any time.
    mapping (uint => address) public tokenIdToApproved;

    event Create(
        string typeOfWorkCreate,
        uint fingerprintCreate,
        address[] contributorsCreate,
        uint[] splitsCreate
    );

    //public function for registering a work
    //This will update the worklist of all contributors and assign rcn-tokens according to the _splits[] argument
    function createWork (string _typeOfWork, uint _fingerprint, address[] _contributors, uint[] _splits) public {
        //need to validate all inputs!
        //A work struct with info about the work. PS: this data is permanent
        Work memory _newWork = Work({
            birthTime: uint64(now),
            typeOfWork: _typeOfWork,
            fingerprint: _fingerprint,
            contributors: _contributors,
            splits: _splits
        });

        //we push the newly created work-struct to the workDB
        //Its ID (index in the workDB array) is assigned the newWorkId variable
        uint _newWorkId = workDB.push(_newWork) - 1;

        //update each contributors worklist
        for (uint i= 0; i < _contributors.length; i++) {
            address _contributor = _contributors[i];

            //update mapping from contributors to their worklist
            addressToWorkList[_contributor].push(_newWorkId);

            //issue rcn-tokens to involved contributors
            for (uint j= 0; j < _splits[i]; j++) {

                //create new token and push it to the master rcnDB
                uint _newTokenId = rcnDB.push(_newWorkId) - 1;

                //Fill the tokenID-list in workIdToTokenList
                workIdToTokenList[_newWorkId].push(_newTokenId);

                //call the internal transfer function for assigning ownership
                _transferToken(0, _contributor, _newTokenId);
            }
        }
        Create(_typeOfWork, _fingerprint, _contributors, _splits);
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

    function getLengthOfWorkDataBase() public view returns (uint) {
        return workDB.length;
    }

    function getWorkById(uint _id) public view returns (uint64, string, uint, address[], uint[]) {
        Work memory localWork = workDB[_id];
        // bytes32 byteTypeOfWork = stringToBytes32(localWork.typeOfWork);
        return (localWork.birthTime,
        localWork.typeOfWork, localWork.fingerprint, localWork.contributors, localWork.splits);
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

    //INTERNAL functions used by this and child-contracts
    //
    //function returning a list of tokenIds associated with a _workId
    function _getTokenListFromWorkId (uint _workId) internal view returns (uint[]) {
        return workIdToTokenList[_workId];
    }

    //function returning the workId associated with any _tokenId
    function _getWorkIdfromTokenId(uint _tokenId) internal view returns (uint) {
        //throws exception if _tokenId is not valid (not owned by anyone)
        require(tokenIdToOwner[_tokenId] != address(0));

        return rcnDB[_tokenId];
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

    //function for checking if a given address has ownership of a given tokenId
    function _owns(address _address, uint _tokenId) internal view returns(bool) {
        return (tokenIdToOwner[_tokenId] == _address);
    }

    //internal function for token ownership assignment
    //used in createWork() and transfer()
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
            }
        }
        //Must also emit the Transfer-event
    }

    //function converting a string to an array of bytes (bytes32)
    function stringToBytes32(string memory source) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }
}
