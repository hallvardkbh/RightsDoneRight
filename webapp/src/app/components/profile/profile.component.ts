import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { UserService } from '../../firestore-services/user.service';
import { User } from '../../models/user';
import { EthereumService, Web3Service } from '../../blockchain-services/service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Work } from '../../models/work';
import { LicenseProfile } from '../../models/licenseProfile';
import { WorkService } from '../../firestore-services/work.service';
import { LicenseService } from '../../firestore-services/license.service';
import { AuthService } from '../../auth/auth.service';
import { Purchase } from '../../models/purchase';
import { PurchaseService } from '../../firestore-services/purchase.service';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit, OnDestroy {

  purchases: Purchase[];
  withdrawSubscription: Subscription;
  deactivateLicenseSubscription: Subscription;
  activateLicenseSubscription: Subscription;
  approveWorkSubscription: Subscription;
  firebaseSubscription: Subscription;

  workLoadedFromBlockchain: boolean;
  user: User;

  approvedLicenseProfiles: any;
  unapprovedLicenseProfiles: any;
  approvedWorks: any;
  unapprovedWorks: any;
  birthTime: number;
  fingerprint: string;
  totalWorkBalance: number;

  status: string;

  licenseProfilePrice: number;

  userRef: AngularFirestoreDocument<any>;

  constructor(
    private _fireUserService: UserService,
    private _fireWorkService: WorkService,
    private _fireLicenseService: LicenseService,
    private _firePurchaseService: PurchaseService,
    private _ethereumService: EthereumService,
    private web3service: Web3Service,
    public auth: AuthService
  ) {

    this.withdrawSubscription = new Subscription();
    this.deactivateLicenseSubscription = new Subscription();
    this.activateLicenseSubscription = new Subscription();
    this.approveWorkSubscription = new Subscription();

  }

  ngOnInit() {
    this.onReady();
  }


  onReady = () => {
    this.firebaseSubscription = this.auth.user$.subscribe(user => {
      this.user = user;
      this.unapprovedWorks = [];
      this.approvedWorks = [];
      this.unapprovedLicenseProfiles = [];
      this.approvedLicenseProfiles = [];
      this.purchases = [];
      if (typeof this.user.unapprovedWorks !== 'undefined') {
        this.user.unapprovedWorks.forEach(workId => {
          const loadedBlockchainWork = this.loadWorkFromBlockchain(workId);
          const loadedFirebaseWork = this.loadWorkFromFirestore(workId);
          combineLatest(loadedBlockchainWork, loadedFirebaseWork).subscribe(res => {
            this.unapprovedWorks.push({ id: workId, bcWork: res[0], fsWork: res[1] });
          });
        });
      }
      if (typeof this.user.approvedWorks !== 'undefined') {
        this.user.approvedWorks.forEach(workId => {
          const loadedBlockchainWork = this.loadWorkFromBlockchain(workId);
          const loadedFirebaseWork = this.loadWorkFromFirestore(workId);
          const loadedBlockchainWorkBalance = this.loadWorkBalanceFromBlockchain(workId);
          combineLatest(loadedBlockchainWork, loadedFirebaseWork, loadedBlockchainWorkBalance).subscribe(res => {
            const balance = res[2] / 1000000000000000000;
            this.approvedWorks.push({ id: workId, bcWork: res[0], fsWork: res[1], balance: balance });
          });
        });
      }
      if (typeof this.user.activatedLicenseProfiles !== 'undefined') {
        this.user.activatedLicenseProfiles.forEach(licenseId => {
          const loadedBlockchainLicenseProfile = this.loadLicenseProfileFromBlockchain(licenseId);
          const loadedFirebaseLicenseProfile = this.loadLicenseProfileFromFirestore(licenseId);
          combineLatest(loadedBlockchainLicenseProfile, loadedFirebaseLicenseProfile).subscribe(res => {
            this.approvedLicenseProfiles.push({ id: licenseId, bcLicenseProfile: res[0], fsLicenseProfile: res[1] });
          });
        });
      }
      if (typeof this.user.deactivatedLicenseProfiles !== 'undefined') {
        this.user.deactivatedLicenseProfiles.forEach(licenseId => {
          const loadedBlockchainLicenseProfile = this.loadLicenseProfileFromBlockchain(licenseId);
          const loadedFirebaseLicenseProfile = this.loadLicenseProfileFromFirestore(licenseId);
          combineLatest(loadedBlockchainLicenseProfile, loadedFirebaseLicenseProfile).subscribe(res => {
            this.unapprovedLicenseProfiles.push({ id: licenseId, bcLicenseProfile: res[0], fsLicenseProfile: res[1] });
          });
        });
      }
      if (typeof this.user.purchases !== 'undefined') {
        this.user.purchases.forEach(purchase => {
          const loadedPurchase = this.loadPurchase(purchase);
          loadedPurchase.subscribe(purch => {
            this.purchases.push(purch);
          });
        });
      }
    }, err => alert(err));
  }

  ngOnDestroy() {
    this.firebaseSubscription.unsubscribe();
    this.activateLicenseSubscription.unsubscribe();
    this.approveWorkSubscription.unsubscribe();
    this.deactivateLicenseSubscription.unsubscribe();
    this.withdrawSubscription.unsubscribe();

    // Clear arrays
    this.unapprovedLicenseProfiles = [];
    this.unapprovedWorks = [];
    this.approvedLicenseProfiles = [];
    this.approvedLicenseProfiles = [];
  }

  setStatus = boolean => {
    this.workLoadedFromBlockchain = boolean;
  }

  loadWorkFromFirestore(id): Observable<Work> {
    return this._fireWorkService.getWork(id).map(value => {
      const firestoreWork = value as Work;
      return firestoreWork;
    });
  }

  loadLicenseProfileFromFirestore(id): Observable<LicenseProfile> {
    return this._fireLicenseService.getLicenseProfileById(id).map(value => {
      const firestoreLicenseProfile = value as LicenseProfile;
      return firestoreLicenseProfile;
    });
  }

  loadPurchase(hash): Observable<Purchase> {
    return this._firePurchaseService.getPurchase(hash).map(value => {
      const firestorePurchase = value as Purchase;
      return firestorePurchase;
    });
  }

  loadWorkFromBlockchain(id): Observable<Work> {
    return this._ethereumService.getWorkById(id).map(value => {
      const blockchainWork = {} as Work;
      const contributors = [];
      // tslint:disable-next-line:radix
      blockchainWork.birthTime = parseInt(value[0]) * 1000;
      blockchainWork.fingerprint = value[1];
      blockchainWork.workId = id;
      for (let i = 0; i < value[2].length; i++) {
        // tslint:disable-next-line:radix
        contributors.push({ address: this.web3service.convertToChecksumAddress(value[2][i]), split: parseInt(value[3][i]) });
      }
      blockchainWork.approvedStatus = value[4];
      blockchainWork.contributors = contributors;
      if (blockchainWork != null) { this.setStatus(true); }
      return blockchainWork;
    }, e => {
      this.setStatus(false);
      console.error('Error getting work count; see log.');
    });
  }

  loadLicenseProfileFromBlockchain(id): Observable<LicenseProfile> {
    return this._ethereumService.getLicenseProfileById(id)
      .map(value => {
        const licenseProfile = {} as LicenseProfile;
        // tslint:disable-next-line:radix
        licenseProfile.birthTime = parseInt(value[0]) * 1000;
        // tslint:disable-next-line:radix
        licenseProfile.price = parseInt(value[1]);
        licenseProfile.fingerprint = value[2];
        licenseProfile.activatedStatus = value[3];
        // tslint:disable-next-line:radix
        licenseProfile.workId = parseInt(value[4]);
        return licenseProfile;
      }, e => {
        console.error('Error getting work count; see log.');
      });
  }

  // Approval and activation

  // TODO: unsubscribe

  onApproveWorkButtonClick(workId) {
    this.approveWorkSubscription = this._ethereumService.approveWork(this.user.ethereumAddress, workId)
      .subscribe(value => {
        if (value) {
          this._fireUserService.pushApprovedWorkToCurrentUser(workId);
        }
      }, e => { console.error('Error approving work; see log.'); });
  }

  onActivateLicensePreofileButtonClick(profileId) {
    this.activateLicenseSubscription = this._ethereumService.activateLicenseProfile(this.user.ethereumAddress, profileId)
      .subscribe(value => {
        if (value) {
          this._fireUserService.activateLicenseProfileToCurrentUser(profileId);
        }
      }, e => { console.error('Error activating license profile; see log.'); });
  }

  onDeactivateLicensePreofileButtonClick(profileId) {
    this.deactivateLicenseSubscription = this._ethereumService.deactivateLicenseProfile(this.user.ethereumAddress, profileId)
      .subscribe(value => {
        if (value) {
          this._fireUserService.deactivateLicenseProfileToCurrentUser(profileId);
        }
      }, e => { console.error('Error deactivating license profile; see log.'); });
  }

  loadWorkBalanceFromBlockchain(workId): Observable<number> {
    return this._ethereumService.getTotalBalanceFromWorkId(workId, this.user.ethereumAddress);
  }

  onWithdrawFromWorkId(workId) {
    this.withdrawSubscription = this._ethereumService.WithdrawFromWorkId(workId, this.user.ethereumAddress)
      .subscribe(value => {
        // console.log(value)
      });
  }


}
