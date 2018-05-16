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

  pushApprovedWorkToUser(workId) {
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
