import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Purchase } from '../models/purchase';


@Injectable()
export class PurchaseService {

    purchaseDetails: Observable<any>;

    constructor(public afs: AngularFirestore) {

    }

    getPurchase(transactionHash): Observable<Purchase> {
        return this.afs.doc<Purchase>(`purchases/${transactionHash}`).valueChanges();
    }

    pushPurchase(purchase: Purchase) {
        const purchaseRef: AngularFirestoreDocument<any> = this.afs.doc(`purchases/${purchase.transactionHash}`);
        return purchaseRef.set({
            transactionHash: purchase.transactionHash,
            timeOfPurchase: purchase.timeOfPurchase,
            blockNumber: purchase.blockNumber,
            licenseProfileId: purchase.licenseProfileId,
            workId: purchase.workId,
        }, { merge: true });
    }








}
