import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { User } from '../models/user';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { Contributor } from '../models/contributor';


@Injectable()
export class WorkService {

    currentUserAddress: string;
    userChangeRef: AngularFirestoreDocument<User>;

    userDetails: Observable<User>;

    currentUser: User;

    constructor(
        public afs: AngularFirestore,
        public auth: AuthService,
        private afAuth: AngularFireAuth) {

        this.currentUser = this.afAuth.auth.currentUser;
        this.currentUserAddress = this.afAuth.auth.currentUser.displayName;

    }

    pushWork(workId: number, typeOfWork: string, title: string, description: string, contributors: Array<Contributor>) {
        const worksRef: AngularFirestoreDocument<any> = this.afs.doc(`works/${workId}`);
        return worksRef.set({
            typeOfWork: typeOfWork,
            description: description,
            contributors: contributors,
            uploadedBy: this.currentUserAddress,
        }, { merge: true });
    }


}
