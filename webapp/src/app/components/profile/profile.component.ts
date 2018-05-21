import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { UserService } from '../../firestore-services/user.service';
import { User } from '../../models/user';
import { EthereumService, Web3Service } from '../../../blockchain-services/service';
import { Subscription, Observable, combineLatest } from 'rxjs';
import { Work } from '../../models/work';
import { LicenseProfile } from '../../models/licenseProfile';
import { WorkService } from '../../firestore-services/work.service';
import { LicenseService } from '../../firestore-services/license.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit, OnDestroy {

  workLoadedFromBlockchain: boolean;
  firebaseSubscription: Subscription;
  user: User;

  approvedLicenseProfiles: any;
  unapprovedLicenseProfiles: any;
  approvedWorks: any;
  unapprovedWorks: any;
  birthTime: number;
  fingerprint: string;

  status: string;

  licenseProfilePrice: number;

  userRef: AngularFirestoreDocument<any>;

  constructor(
    private _fireUserService: UserService,
    private _fireWorkService: WorkService,
    private _fireLicenseService: LicenseService,
    private ethereumService: EthereumService,
    private web3service: Web3Service
  ) {
  }

  ngOnInit() {
    this.onReady();
  }

  onReady = () => {
    this.firebaseSubscription = this._fireUserService.userDetails.subscribe(user => {
      this.user = user;
      this.unapprovedWorks = [];
      this.approvedWorks = [];
      this.unapprovedLicenseProfiles = [];
      this.approvedLicenseProfiles = [];
      if (typeof this.user.unapprovedWorks !== "undefined") {
        this.user.unapprovedWorks.forEach(workId => {
          const loadedBlockchainWork = this.loadWorkFromBlockchain(workId);
          const loadedFirebaseWork = this.loadWorkFromFirestore(workId);
          combineLatest(loadedBlockchainWork, loadedFirebaseWork).subscribe(res => {
            this.unapprovedWorks.push({ id: workId, bcWork: res[0], fsWork: res[1] })
          });
        });
      }
      if (typeof this.user.approvedWorks !== "undefined") {
        this.user.approvedWorks.forEach(workId => {
          const loadedBlockchainWork = this.loadWorkFromBlockchain(workId);
          const loadedFirebaseWork = this.loadWorkFromFirestore(workId);
          combineLatest(loadedBlockchainWork, loadedFirebaseWork).subscribe(res => {
            this.approvedWorks.push({ id: workId, bcWork: res[0], fsWork: res[1] })
          });
        });
      }
      if (typeof this.user.activatedLicenseProfiles !== "undefined") {
        this.user.activatedLicenseProfiles.forEach(licenseId => {
          const loadedBlockchainLicenseProfile = this.loadLicenseProfileFromBlockchain(licenseId);
          const loadedFirebaseLicenseProfile = this.loadLicenseProfileFromFirestore(licenseId);
          combineLatest(loadedBlockchainLicenseProfile, loadedFirebaseLicenseProfile).subscribe(res => {
            this.approvedLicenseProfiles.push({ id: licenseId, bcLicenseProfile: res[0], fsLicenseProfile: res[1] })
          });
        });
      }
      if (typeof this.user.deactivatedLicenseProfiles !== "undefined") {
        this.user.deactivatedLicenseProfiles.forEach(licenseId => {
          const loadedBlockchainLicenseProfile = this.loadLicenseProfileFromBlockchain(licenseId);
          const loadedFirebaseLicenseProfile = this.loadLicenseProfileFromFirestore(licenseId);
          combineLatest(loadedBlockchainLicenseProfile, loadedFirebaseLicenseProfile).subscribe(res => {
            this.unapprovedLicenseProfiles.push({ id: licenseId, bcLicenseProfile: res[0], fsLicenseProfile: res[1] })
          });
        });
      }
    }, err => alert(err))
  }

  ngOnDestroy(){
    this.firebaseSubscription.unsubscribe();
  }

  setStatus = boolean => {
    this.workLoadedFromBlockchain = boolean;
  };

  loadWorkFromFirestore(id): Observable<Work> {
    return this._fireWorkService.getWork(id).map(value => {
      let firestoreWork = value as Work;
      return firestoreWork;
    })
  }

  loadLicenseProfileFromFirestore(id): Observable<LicenseProfile> {
    return this._fireLicenseService.getLicenseProfileById(id).map(value => {
      let firestoreLicenseProfile = value as Work;
      return firestoreLicenseProfile;
    })
  }

  loadWorkFromBlockchain(id): Observable<Work> {
    return this.ethereumService.getWorkById(id).map(value => {
      let blockchainWork = {} as Work;
      let contributors = [];
      blockchainWork.birthTime = parseInt(value[0]) * 1000;
      blockchainWork.fingerprint = value[1];
      blockchainWork.workId = id;
      for (let i = 0; i < value[2].length; i++) {
        contributors.push({ address: this.web3service.convertToChecksumAddress(value[2][i]), split: parseInt(value[3][i]) })
      }
      blockchainWork.approvedStatus = value[4];
      blockchainWork.contributors = contributors;
      if (blockchainWork != null) { this.setStatus(true) }
      return blockchainWork;
    }, e => {
      this.setStatus(false);
      console.error('Error getting work count; see log.')
    });
  }

  loadLicenseProfileFromBlockchain(id): Observable<LicenseProfile> {
    return this.ethereumService.getLicenseProfileById(id)
      .map(value => {
        let licenseProfile = {} as LicenseProfile;
        licenseProfile.birthTime = parseInt(value[0]) * 1000;
        licenseProfile.price = parseInt(value[1]);
        licenseProfile.fingerprint = value[2];
        licenseProfile.activatedStatus = value[3];
        licenseProfile.workId = parseInt(value[4]);
        return licenseProfile;
      }, e => {
        console.error('Error getting work count; see log.')
      });
  }

  //Approval and activation

  onApproveWorkButtonClick(account, id) {
    this.ethereumService.approveWork(account, id)
      .subscribe(value => {
        if (value) {
          this._fireUserService.pushApprovedWorkToCurrentUser(id);
        }
      }, e => { console.error('Error approving work; see log.') });
  }

  onActivateLicensePreofileButtonClick(account, profileId) {
    this.ethereumService.activateLicenseProfile(account, profileId)
      .subscribe(value => {
        if (value) {
          this._fireUserService.activateLicenseProfileToCurrentUser(profileId);
        }
      }, e => { console.error('Error activating license profile; see log.') });
  }

  onDeactivateLicensePreofileButtonClick(account, profileId) {
    this.ethereumService.deactivateLicenseProfile(account, profileId)
      .subscribe(value => {
        if (value) {
          this._fireUserService.deactivateLicenseProfileToCurrentUser(profileId);
        }
      }, e => { console.error('Error deactivating license profile; see log.') });
  }

}