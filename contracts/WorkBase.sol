pragma solidity ^0.4.0;


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
    mapping(address => uint[]) public addressToWorklist;

    //mapping from owner address to the count of tokens that address owns
    mapping(address => uint) public addressToTokenCount;

    //mapping from tokenId to an address that has been approved to call transferFrom()
    //each token can only have one approved address for transfer at any time.
    mapping (uint => address) public tokenIdToApproved;

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
        uint newWorkId = workDB.push(_newWork) - 1;

        //update each contributors worklist
        for (uint i= 0; i < _contributors.length; i++) {
            address _contributor = _contributors[i];

            //update mapping from contributors to their worklist
            addressToWorklist[_contributor].push(newWorkId);

            //issue rcn-tokens to involved contributors
            for (uint j= 0; j < _splits[i]; j++) {
                uint newTokenId = rcnDB.push(newWorkId) - 1;
                _transferToken(0, _contributor, newTokenId);
            }
        }
    }

    function getWorklistWithTokenCountFromAddress(address _address) public view returns(uint[], uint[]) {
        //list containing all works associated with an address
        uint[] memory _workList = addressToWorklist[_address];

        //an empty array of uints with size equal to _worklist
        uint[] memory _amountList = new uint[](_workList.length);

        for (uint i = 0; i < _workList.length; i++) {
            //list of all tokens associated with workId
            uint[] memory _tokensFromWorkId = getTokenListFromWorkId(_workList[i]);

            for (uint j = 0; j < _tokensFromWorkId.length; j++) {

                uint _tokenId = _tokensFromWorkId[j];

                if (_owns(_address, _tokenId)) {
                    _amountList[i]++;
                }
            }
        }

        return (_workList, _amountList);
    }

    //INTERNAL functions used by this and child-contracts
    //
    //function returning a list of tokenIds associated with a _workId
    function getTokenListFromWorkId (uint _workId) internal pure returns (uint[]) {

        //the first token associated with a workId
        uint _firstTokenId = (_workId * 100);

        //initialize an empty array of size 100
        uint[] memory _result = new uint[](100);

        //fill the array with tokensIds
        for (uint i = 0; i < 100; i++) {
            _result[i] = (_firstTokenId + i);
        }

        return _result;
    }

    //function returning the workId associated with any _tokenId
    function getWorkIdfromTokenId(uint _tokenId) internal view returns (uint) {
        //throws exception if _tokenId is not valid (not owned by anyone)
        require(tokenIdToOwner[_tokenId] != address(0));

        return (_tokenId/(100));
    }

    //function for checking if a given _workId exists in the worklist associated with an address
    function _workIdNotInWorklist(uint _workId, address _address) internal view returns(bool) {
        uint[] memory _workList = addressToWorklist[_address];
        for (uint i = 0; i < _workList.length; i++) {
            if (_workId == _workList[i]) {
                return false;
            }
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
            uint _workId = getWorkIdfromTokenId(_tokenId);

            //check if _to address already has the workId in his workList
            if (_workIdNotInWorklist(_workId, _to)) {

                //add the workId to worklist associated with the _to address
                addressToWorklist[_to].push(_workId);
            }
        }
        //Must also emit the Transfer-event
    }
}
