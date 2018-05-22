import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from '@firebase/util';
import { Purchase } from '../models/purchase';


@Injectable()
export class PurchaseService {

    purchaseDetails: Observable<any>

    constructor(
        public afs: AngularFirestore
    ) {

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

    // getPurchase(transactionHash: string): Observable<Purchase> {
    //     this.purchaseDetails = this.afs.doc<Purchase>(`purchases/${transactionHash}`).valueChanges();
    //     return this.purchaseDetails;
    // }








}
