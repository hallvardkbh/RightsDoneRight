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

    //mapping from address (owner) to an array of workIds
    mapping(address => uint[]) public addressToWorklist;

    //mapping from owner address to the count of tokens that address owns
    //used in TokenOwnership.sol functions
    mapping(address => uint) public addressToTokenCount;

    function createWork (string _typeOfWork, uint _fingerprint, address[] _contributors, uint[] _splits) public {
        //need to validate all inputs!
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

        //for-loop to update each contributors worklist
        for (uint i= 0; i < _contributors.length; i++) {
            address _contributor = _contributors[i];

            //update mapping from contributors to their worklist
            addressToWorklist[_contributor].push(newWorkId);

            //loop for issuing rcn-tokens to involved contributors
            for (uint j= 0; j < _splits[i]; j++) {
                uint newTokenId = rcnDB.push(newWorkId) - 1;
                _transferToken(0, _contributor, newTokenId);
            }
        }
    }

    function getOwnersWork (address _address) public view returns(uint[], uint[]) {
        //Create a temporary array that an address is associated with.
        //The mapping from address to an array of workIds returns an array
        //that we can set our temporary list equal to.
        uint[] memory workList = addressToWorklist[_address];

        //Create an empty array of the same size as workList that will
        // hold the split an owner (address) has of a specific work.
        uint[] memory amountList = new uint[](workList.length);

        //For every work the address is related to we add the corresponding split amount
        //to the amountArray.
        for (uint i = 0; i < workList.length; i++) {
            Work memory _work = workDB[workList[i]];
            address[] memory _contributors = _work.contributors;

            for (uint j = 0; j < _contributors.length; j++) {
                if (_contributors[j] == _address) {
                    //Adding the corresponding split to the same index as workList
                    amountList[i] = _work.splits[j];
                    break;
                }
            }
        }
        return (workList, amountList);
    }

    function _transferToken(address _from, address _to, uint _tokenId) internal {
        //increase the token count associated with the _to address
        addressToTokenCount[_to]++;

        //for "newborn tokens", we insert the (token=>address) key-value pair in the tokenIdToOwner mapping
        //for existing tokens, we update the address-value of a tokenID-key to the _to address
        tokenIdToOwner[_tokenId] = _to;

        //for existing tokens, we decrease the token count associated with the _from address
        if (_from != address(0)) {
            addressToTokenCount[_from]--;
        }
    }
}
