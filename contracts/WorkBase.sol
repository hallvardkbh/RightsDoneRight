pragma ^0.4.19;


//base contract defining basic structs and functions for works
contract WorkBase {


//every musical work is represented by a struct with a set of variables
  struct Work{
    //timestamp from the block when this work was registered
    uint64 birtTime;

    //description of work, i.e "musical composition" or "sound recording of blablabla"
    string typeOfWork;

    //mapping from an associated rightholder to their contribution role and percent
    mapping(address => (string, uint) contributors;

    //Any registered work is associated with 100 RCN-tokens,
    //each which represents 1% ownership of the work
    uint[100] tokenList;

    //the Keccak-256 hash fingerprint of the uploaded file
    uint fingerprint;
  }

  //An array containing the work struct for all registered works in existence.
  //the index of the struct in the array is the ID of the work
  Work[] workDB;

  //copyrights are represented as a struct with a set of variables
  struct Copyright{
    uint associatedWorkID;
    uint birthTime;
  }

  //a master database of all issued copyright tokens
  //whenever a work is created, 100 copyright tokens are created and added to this array,
  //with their index in the array becoming the copyright token's ID.
  Copyright[] rcnDB;


  // mapping from tokenID to the address of its owner
  mapping(uint => address) tokenIdToOwner;


}
