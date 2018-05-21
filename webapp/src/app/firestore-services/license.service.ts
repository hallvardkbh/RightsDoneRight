import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { User } from '../models/user';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { Contributor } from '../models/contributor';
import { Work } from '../models/work';
import { LicenseProfile } from '../models/licenseProfile';


@Injectable()
export class LicenseService {

    currentUser: any;
    currentUserAddress: string;
    userChangeRef: AngularFirestoreDocument<User>;

    licenseProfileDetails: Observable<any>;


    constructor(
        public afs: AngularFirestore,
        public auth: AuthService,
        private afAuth: AngularFireAuth) {

        this.currentUserAddress = this.afAuth.auth.currentUser.displayName;

    }

    pushLicenseProfile(licenseProfile: LicenseProfile) {
        const licenseProfileRef: AngularFirestoreDocument<any> = this.afs.doc(`licenseProfiles/${licenseProfile.licenseProfileId}`);
        return licenseProfileRef.set({
            licenseProfileId: licenseProfile.licenseProfileId,
            workId: licenseProfile.workId,
            typeOfLicense: licenseProfile.typeOfLicense,
            price: licenseProfile.price,
            fingerprint: licenseProfile.fingerprint,
            downloadUrl: licenseProfile.downloadUrl,
            description: licenseProfile.description,
            uploadedBy: this.currentUserAddress,
        }, { merge: true });
    }

    getLicenseProfileById(licenseProfileId: number): Observable<LicenseProfile> {
        return this.licenseProfileDetails = this.afs.doc(`licenseProfiles/${licenseProfileId}`).valueChanges();
    }


}
