pragma solidity ^0.4.19;


//base contract defining basic structs and functions for works
contract WorkBase {

  //every musical work is represented by a struct with a set of variables
  struct Work{
    //timestamp from the block when this work was registered
    uint64 birtTime;

    //description of work, i.e "musical composition" or "sound recording of blablabla"
    string typeOfWork;

    //mapping from a contirbutor to the contribution percent
    mapping(address => uint) workAmount;

    //mapping from a contributor to its contribution description
    mapping(address => string) workRoles;

    //the Keccak-256 hash fingerprint of the uploaded file
    uint fingerprint;
  }

  //copyrights are represented as a struct with a set of variables
  struct Copyright{
    uint associatedWorkID;
    uint birthTime;
  }

  //An array containing the work struct for all registered works in existence.
  //the index of the struct in the array is the ID of the work
  Work[] workDB;

  //a master database of all issued copyright tokens
  //whenever a work is created, 100 copyright tokens are created and added to this array,
  //with their index in the array becoming the copyright token's ID.
  Copyright[] rcnDB;

  // mapping from tokenID to the address of its owner
  mapping(uint => address) tokenIdToOwner;

  function issueToken( (address, uint)[] _contributorsAmount, uint _workID ){
    for(uint i = 0; i < _contributorsAmount.length; i++){


      uint newTokenID = rcnDB.push()
    }
  }


  function createWork(string _typeOfWork, address[] _contributors, (string, uint)[] _workload, string _hash) internal {
    Work memory _work = Work({
      birthTime = now;
      typeOfWork = _typeOfWork;
      for(uint i = 0; i < _contributors.length; i ++){
        contributors[_contributors[i]] = _workload[i];
        }
      })
  }




}
