import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { User } from '../models/user';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';


@Injectable()
export class UserService {

  userCollection: AngularFirestoreCollection<User>;

  user: Observable<User>;

  currentUser: User;

  constructor(
    public afs: AngularFirestore,
    public auth: AuthService,
    private afAuth: AngularFireAuth) {

      this.currentUser = this.afAuth.auth.currentUser;
      
      this.user = this.afs.doc(`users/${this.currentUser.uid}`).valueChanges();

  }

  getUser() {
    return this.user;
  }

}
