pragma solidity ^0.4.19;


//base contract defining basic structs and functions for works
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
    Work[] private workDB;

  //a master database of all issued copyright tokens
  //whenever a work is created, 100 copyright tokens are created and added to this array,
  //with their index in the array becoming the copyright token's ID.
    uint[] private rcnDB;

  // mapping from tokenID to the address of its owner
    mapping(uint => address) private tokenIdToOwner;

    function createWork (string _typeOfWork,
        uint _fingerprint,
        address[] _contributors,
        uint[] _splits) private {

          //her trenger vi masse require(blablabla);

        Work memory _newWork = Work({
            birthTime: uint64(now),
            typeOfWork: _typeOfWork,
            fingerprint: _fingerprint,
            contributors: _contributors,
            splits: _splits
        });

        uint newWorkId = workDB.push(_newWork) - 1;

    // require contributors.length <= 100

        for (uint i = 0; i < _contributors.length; i++) {
            for (uint j = 0; j < _splits[i]; j++) {
                uint newtokenId = rcnDB.push(newWorkId) - 1;
                tokenIdToOwner[newtokenId] = _contributors[i];
            }
        }

    }

}
