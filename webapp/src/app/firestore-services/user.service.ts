import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { User } from '../models/user';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { DocumentSnapshot } from '@firebase/firestore-types';
import { Purchase } from '../models/purchase';


@Injectable()
export class UserService {

  cUserUid: string;
  userDetails: Observable<User>;

  cUser: Observable<User>;

  constructor(
    public afs: AngularFirestore,
    public auth: AuthService) {

    this.cUser = this.auth.user$;
    this.cUserUid = '';

    this.cUser.subscribe(user => {
      if (user) {
        this.getUserUidWithAddress(user.ethereumAddress).then(doc => this.cUserUid = doc.get('uid'));
      }
    });
  }

  getLoggedInUserDetails(): Observable<User> {
    return this.userDetails;
  }

  getUserUidWithAddress(address: string): Promise<DocumentSnapshot> {
    let ref = this.afs.doc(`ethereumAddresses/${address}`).ref;
    return ref.get();
  }


  async getUserFromAddress(address: string) {
    let doc = await this.getUserUidWithAddress(address);
    let contributorId: string = doc.get('uid');
    let userDocumentSnapshot = await this.getUserWithUid(contributorId);
    let userDictionary = { key: contributorId, value: userDocumentSnapshot.data() };
    return userDictionary
  }

  private getUserWithUid(uid): Promise<DocumentSnapshot> {
    let ref = this.afs.doc(`users/${uid}`).ref;
    return ref.get();
  }

  pushUnapprovedWorkToUsers(contributorIds, workId) {
    // Looping through all contributors
    contributorIds.forEach(uid => {

      //Get the user document for the current contributor
      let doc = this.afs.doc(`users/${uid}`).ref;

      // Run a transaction to prevent others from writing to the same document at the same time. 
      this.afs.firestore.runTransaction(transaction => {
        return transaction.get(doc).then(snapshot => {

          // Directly appending to the value of array property in Firestore is not possible. 
          // We do for that reason have to take a snapshot of the stored array and push to it locally.
          var unapprovedWorksArray = snapshot.get('unapprovedWorks');
          if (typeof unapprovedWorksArray != 'undefined') {
            unapprovedWorksArray.push(workId);
          } else {

            // Create a new array if the array does not already exist in the document
            unapprovedWorksArray = new Array<number>();
            unapprovedWorksArray.push(workId);
          }

          // Replaces the current value of 'unnaprovedWorks' with the local array variable
          transaction.update(doc, 'unapprovedWorks', unapprovedWorksArray);
        });
      });
    });
  }

  pushApprovedWorkToCurrentUser(workId) {
    let doc = this.afs.doc(`users/${this.cUserUid}`).ref;
    this.afs.firestore.runTransaction(transaction => {
      return transaction.get(doc).then(snapshot => {
        var approvedWorksArray = snapshot.get('approvedWorks');
        var unapprovedWorksArray = snapshot.get('unapprovedWorks');
        const index: number = unapprovedWorksArray.indexOf(workId);
        if (index !== -1) {
          unapprovedWorksArray.splice(index, 1);
        };
        if (typeof approvedWorksArray != 'undefined') {
          approvedWorksArray.push(workId);
        } else {
          approvedWorksArray = new Array<number>();
          approvedWorksArray.push(workId);
        }
        transaction.update(doc, 'approvedWorks', approvedWorksArray);
        transaction.update(doc, 'unapprovedWorks', unapprovedWorksArray);
      });
    });
  }

  pushLicenseProfileToUser(uid, licenseProfileId) {
    let doc = this.afs.doc(`users/${uid}`).ref;
    this.afs.firestore.runTransaction(transaction => {
      return transaction.get(doc).then(snapshot => {
        var deactivatedLicenseProfilesArray = snapshot.get('deactivatedLicenseProfiles');
        if (typeof deactivatedLicenseProfilesArray != 'undefined') {
          deactivatedLicenseProfilesArray.push(licenseProfileId);
        } else {
          deactivatedLicenseProfilesArray = new Array<number>();
          deactivatedLicenseProfilesArray.push(licenseProfileId);
        }
        transaction.update(doc, 'deactivatedLicenseProfiles', deactivatedLicenseProfilesArray);
      });
    });
  }

  activateLicenseProfileToCurrentUser(profileId) {
    let doc = this.afs.doc(`users/${this.cUserUid}`).ref;
    this.afs.firestore.runTransaction(transaction => {
      return transaction.get(doc).then(snapshot => {
        var activatedLicenseProfilesArray = snapshot.get('activatedLicenseProfiles');
        var deactivatedLicenseProfilesArray = snapshot.get('deactivatedLicenseProfiles');
        const index: number = deactivatedLicenseProfilesArray.indexOf(profileId);
        if (index !== -1) {
          deactivatedLicenseProfilesArray.splice(index, 1);
        };
        if (typeof activatedLicenseProfilesArray != 'undefined') {
          activatedLicenseProfilesArray.push(profileId);
        } else {
          activatedLicenseProfilesArray = new Array<number>();
          activatedLicenseProfilesArray.push(profileId);
        }
        transaction.update(doc, 'activatedLicenseProfiles', activatedLicenseProfilesArray);
        transaction.update(doc, 'deactivatedLicenseProfiles', deactivatedLicenseProfilesArray);
      });
    });
  }

  deactivateLicenseProfileToCurrentUser(profileId) {
    let doc = this.afs.doc(`users/${this.cUserUid}`).ref;
    this.afs.firestore.runTransaction(transaction => {
      return transaction.get(doc).then(snapshot => {
        var activatedLicenseProfilesArray = snapshot.get('activatedLicenseProfiles');
        var deactivatedLicenseProfilesArray = snapshot.get('deactivatedLicenseProfiles');
        const index: number = activatedLicenseProfilesArray.indexOf(profileId);
        if (index !== -1) {
          activatedLicenseProfilesArray.splice(index, 1);
        };
        if (typeof deactivatedLicenseProfilesArray != 'undefined') {
          deactivatedLicenseProfilesArray.push(profileId);
        } else {
          deactivatedLicenseProfilesArray = new Array<number>();
          deactivatedLicenseProfilesArray.push(profileId);
        }
        transaction.update(doc, 'activatedLicenseProfiles', activatedLicenseProfilesArray);
        transaction.update(doc, 'deactivatedLicenseProfiles', deactivatedLicenseProfilesArray);
      });
    });
  }

  pushPurchaseToUser(transactionHash) {
    let doc = this.afs.doc(`users/${this.cUserUid}`).ref;
    this.afs.firestore.runTransaction(transaction => {
      return transaction.get(doc).then(snapshot => {
        var largerArray = snapshot.get('purchases');
        if (typeof largerArray != 'undefined') {
          largerArray.push(transactionHash);
        } else {
          largerArray = new Array<string>();
          largerArray.push(transactionHash);
        }
        transaction.update(doc, 'purchases', largerArray);
      });
    });

  }


}
