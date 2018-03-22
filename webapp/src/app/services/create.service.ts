import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore'
import { AngularFireAuth } from 'angularfire2/auth';
import { Work } from './../models/work'
import { Observable } from 'rxjs/Observable';


@Injectable()
export class CreateService {

  worksCollection: AngularFirestoreCollection<Work>;
  works: Observable<Work[]>;

  constructor(public afs: AngularFirestore, private afAuth: AngularFireAuth) {
    this.worksCollection = this.afs.collection('works', ref => ref.orderBy('title', 'asc'));
    this.works = this.worksCollection.valueChanges();
  }


  // Return an observable list with optional query
  // You will usually call this from OnInit in a component
  getWorks(): any {
    // if (!this.userId) return;
    // this.works = this.db.list(`works/${this.userId}`);
    return this.works;
  }

  addWork(work: Work): any {
    this.worksCollection.add(work);
  }


  // createWork(work: Work)  {
  //   this.works.push(work)
  // }

}