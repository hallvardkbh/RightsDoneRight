import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { switchMap } from 'rxjs/operators';
import { User } from './../models/user';

@Injectable()
export class AuthService {

  user$: Observable<User>;

  constructor(private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router) {

    //// Get auth data, then get firestore user document || null
    this.user$ = this.afAuth.authState.switchMap(user => {
      if (user) {
        return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
      } else {
        return Observable.of(null);
      }
    });
  }


  ///// Login/Signup //////
  emailLogin(email, password) {
    return this.oAuthLogin(email, password);
  }

  emailSignUp(user) {
    return this.oAuthSignUp(user);
  }

  getAuthState(): any {
    return this.afAuth.authState;
  }


  private oAuthSignUp(userData) {
    return this.afAuth.auth.createUserWithEmailAndPassword(userData.email, userData.password).then((credential) => {
      this.updateUserData(credential, userData);
    });
  }

  private oAuthLogin(email, password) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
    // .then((credential) => {
    //   this.updateUserData(credential)
    // })
  }

  signOut() {
    this.afAuth.auth.signOut();
    this.router.navigate(['/login']);
  }

  private updateUserData(credential, userData) {
    // Sets user data to firestore on login
    this.afAuth.auth.currentUser.updateProfile({
      displayName: userData.ethereumAddress,
      photoURL: ''
    }).then(function () {
      // Update successful.
    }).catch(function (error) {
      // An error happened.
    });

    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${credential.uid}`);
    const user: User = {
      email: credential.email,
      aliasName: userData.aliasName,
      ethereumAddress: userData.ethereumAddress,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
    };

    const ethereumCollectionRef: AngularFirestoreDocument<any> = this.afs.doc(`ethereumAddresses/${userData.ethereumAddress}`);
    ethereumCollectionRef.set({ uid: credential.uid });

    return userRef.set(user, { merge: true });
  }


  ///// Role-based Authorization //////
  isLoggedIn(user: User): boolean {
    const allowed = ['admin', 'licensee', 'right owner'];
    return this.checkAuthorization(user, allowed);
  }

  isRightOwner(user: User): boolean {
    const allowed = ['admin', 'right owner'];
    return this.checkAuthorization(user, allowed);
  }

  isAdmin(user: User): boolean {
    const allowed = ['admin'];
    return this.checkAuthorization(user, allowed);
  }



  // determines if user has matching role
  private checkAuthorization(user: User, allowedRoles: string[]): boolean {
    if (!user) { return false; }
    for (const role of allowedRoles) {
      if (user.role === role) {
        return true;
      }
    }
    return false;
  }
}
