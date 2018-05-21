import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';


@Injectable()
export class SearchService {

    constructor(private afs: AngularFirestore) { }

    getWorks(start, end) {
        return this.afs.collection('movies', ref => ref
      .orderBy('title')
      .limit(5)
      .startAt(start)
      .endAt(end)
  )
    }
}