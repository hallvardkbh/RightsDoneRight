import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { LicenseProfile } from '../models/licenseProfile';


@Injectable()
export class LicenseService {

    licenseProfileDetails: Observable<any>;

    constructor(public afs: AngularFirestore) {
    
    }

    pushLicenseProfile(licenseProfile: LicenseProfile) {
        const licenseProfileRef: AngularFirestoreDocument<any> = this.afs.doc(`licenseProfiles/${licenseProfile.licenseProfileId}`);
        return licenseProfileRef.set({
            licenseProfileId: licenseProfile.licenseProfileId,
            workId: licenseProfile.workId,
            fingerprint: licenseProfile.fingerprint,
            typeOfLicense: licenseProfile.typeOfLicense,
            price: licenseProfile.price,
            downloadUrl: licenseProfile.downloadUrl,
            description: licenseProfile.description,
            uploadedBy: licenseProfile.uploadedBy,
        }, { merge: true });
    }

    getLicenseProfileById(licenseProfileId: number): Observable<LicenseProfile> {
        return this.licenseProfileDetails = this.afs.doc(`licenseProfiles/${licenseProfileId}`).valueChanges();
    }


}
