import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Work } from '../models/work';


@Injectable()
export class WorkService {


    workDetails: Observable<any>;


    constructor(
        public afs: AngularFirestore
    ) {
    }

    pushWork(work: Work) {
        const worksRef: AngularFirestoreDocument<any> = this.afs.doc(`works/${work.workId}`);
        return worksRef.set({
            title: work.title,
            typeOfWork: work.typeOfWork,
            description: work.description,
            contributors: work.contributors,
            fingerprint: work.fingerprint,
            uploadedBy: work.uploadedBy,
        }, { merge: true });
    }

    getWork(workId: number){
        return this.workDetails = this.afs.doc(`works/${workId}`).valueChanges();
    }


}
