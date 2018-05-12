import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { User } from '../models/user';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { DocumentSnapshot } from '@firebase/firestore-types';


@Injectable()
export class UserService {

  userChangeRef: AngularFirestoreDocument<User>;

  userDetails: Observable<User>;

  currentUser: User;

  constructor(
    public afs: AngularFirestore,
    public auth: AuthService,
    private afAuth: AngularFireAuth) {

    this.currentUser = this.afAuth.auth.currentUser;

    this.userDetails = this.afs.doc(`users/${this.currentUser.uid}`).valueChanges();

  }

  getLoggedInUserDetails() {
    return this.userDetails;
  }

  getUserUidWithAddress(address: string): Promise<DocumentSnapshot> {
    let ref = this.afs.doc(`ethereumAddresses/${address}`).ref;
    return ref.get();
  }


  // getUserWithUid(uid: string): Promise<any> {

  //   let ref = this.afs.doc(`users/${uid}`).ref;
  //   return ref.get().then(doc => {
  //     if (doc.exists) {
  //         return doc.data;
  //     } else {
  //         return null;
  //     }
  // }).catch(function(error) {
  //     console.log("Error getting document:", error);
  // });  } 


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

  pushUnapprovedLicenseProfilesToUsers(tokenHolderIds, licenseProfileId) {
    tokenHolderIds.forEach(uid => {
      let doc = this.afs.doc(`users/${uid}`).ref;
      this.afs.firestore.runTransaction(transaction => {
        return transaction.get(doc).then(snapshot => {
          var largerArray = snapshot.get('unapprovedLicenseProfiles');
          if (typeof largerArray != 'undefined') {
            largerArray.push(licenseProfileId);
          } else {
            largerArray = new Array<number>();
            largerArray.push(licenseProfileId);
          }
          transaction.update(doc, 'unapprovedLicenseProfiles', largerArray);
        });
      });
    });
  }


}
