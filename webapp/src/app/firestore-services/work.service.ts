import { Injectable, Output, EventEmitter } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Work } from '../models/work';
import { Subject } from 'rxjs/Subject';


@Injectable()
export class WorkService {

    workDetails: Observable<any>;
    private pushWorkCompleteSource = new Subject<void>();
    public pushWorkComplete$ = this.pushWorkCompleteSource.asObservable();

    constructor(private afs: AngularFirestore) {

    }

    pushWork(work: Work) {
        const worksRef: AngularFirestoreDocument<any> = this.afs.doc(`works/${work.workId}`);
        return worksRef.set({
            title: work.title,
            typeOfWork: work.typeOfWork,
            description: work.description,
            contributors: work.contributors,
            fingerprint: work.fingerprint,
            downloadUrl: work.downloadUrl,
            uploadedBy: work.uploadedBy,
            workId: work.workId
        }, { merge: true }).then(() => this.pushWorkCompleteSource.next());
    }

    getWork(workId: number): Observable<Work> {
        this.workDetails = this.afs.doc<Work>(`works/${workId}`).valueChanges();
        return this.workDetails;
    }

    getWorks(start, end) {
        return this.afs.collection('works', ref =>
            ref.orderBy('title').startAt(start).endAt(end)
        );
    }


}
