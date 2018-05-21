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


    workDetails: Observable<any>;


    constructor(
        public afs: AngularFirestore,
        public auth: AuthService,
        private afAuth: AngularFireAuth) {
    }

    pushWork(work: Work) {
        let currentUserAddress = this.afAuth.auth.currentUser.displayName;
        const worksRef: AngularFirestoreDocument<any> = this.afs.doc(`works/${work.workId}`);
        return worksRef.set({
            title: work.title,
            typeOfWork: work.typeOfWork,
            description: work.description,
            contributors: work.contributors,
            fingerprint: work.fingerprint,
            uploadedBy: currentUserAddress,
            downloadUrl: work.downloadUrl
        }, { merge: true });
    }

    getWork(workId: number): Observable<Work>{
        this.workDetails = this.afs.doc<Work>(`works/${workId}`).valueChanges();
        return this.workDetails;
    }


}
