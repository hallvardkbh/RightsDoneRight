import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { User } from '../models/user';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { Contributor } from '../models/contributor';
import { Work } from '../models/work';


@Injectable()
export class WorkService {

    currentUserAddress: string;
    userChangeRef: AngularFirestoreDocument<User>;

    workDetails: Observable<any>;

    currentUser: User;

    constructor(
        public afs: AngularFirestore,
        public auth: AuthService,
        private afAuth: AngularFireAuth) {

        this.currentUserAddress = this.afAuth.auth.currentUser.displayName;

    }

    pushWork(work: Work) {
        const worksRef: AngularFirestoreDocument<any> = this.afs.doc(`works/${work.workId}`);
        return worksRef.set({
            title: work.title,
            typeOfWork: work.typeOfWork,
            description: work.description,
            contributors: work.contributors,
            fingerprint: work.fingerprint,
            uploadedBy: this.currentUserAddress,
        }, { merge: true });
    }

    getWork(workId: number){
        return this.workDetails = this.afs.doc(`works/${workId}`).valueChanges();
    }


}
