import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { User } from '../models/user';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { DocumentSnapshot } from '@firebase/firestore-types';


@Injectable()
export class UserService {


  userDetails: Observable<User>;

  currentUser: any;

  constructor(
    public afs: AngularFirestore,
    public auth: AuthService,
    private afAuth: AngularFireAuth) {

    this.currentUser = this.afAuth.auth.currentUser;

    this.userDetails = this.afs.doc(`users/${this.currentUser.uid}`).valueChanges();

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

  getUserWithUid(uid): Promise<DocumentSnapshot> {
    let ref = this.afs.doc(`users/${uid}`).ref;
    return ref.get();
  }

  pushUnapprovedWorkToUsers(contributorIds, workId) {
    contributorIds.forEach(uid => {
      let doc = this.afs.doc(`users/${uid}`).ref;
      this.afs.firestore.runTransaction(transaction => {
        return transaction.get(doc).then(snapshot => {
          var largerArray = snapshot.get('unapprovedWorks');
          if (typeof largerArray != 'undefined') {
            largerArray.push(workId);
          } else {
            largerArray = new Array<number>();
            largerArray.push(workId);
          }
          transaction.update(doc, 'unapprovedWorks', largerArray);
        });
      });
    });
  }

  pushApprovedWorkToCurrentUser(workId) {
    let doc = this.afs.doc(`users/${this.currentUser.uid}`).ref;
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
    let doc = this.afs.doc(`users/${this.currentUser.uid}`).ref;
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
    let doc = this.afs.doc(`users/${this.currentUser.uid}`).ref;
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


}
