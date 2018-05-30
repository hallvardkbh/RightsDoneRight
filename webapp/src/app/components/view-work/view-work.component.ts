import { Component, OnDestroy, OnInit } from '@angular/core';
import { Web3Service, EthereumService } from './../../blockchain-services/service';
import { Router } from '@angular/router';
import { Work } from './../../models/work';
import { ActivatedRoute } from "@angular/router";
import { DatePipe } from "@angular/common";
import { WorkService } from '../../firestore-services/work.service';
import { Subscription, Observable, combineLatest } from 'rxjs';
import { LicenseProfile } from '../../models/licenseProfile';
import { LicenseService } from '../../firestore-services/license.service';
import { User } from '../../models/user';
import { UserService } from '../../firestore-services/user.service';
import { Purchase } from '../../models/purchase';
import { PurchaseService } from '../../firestore-services/purchase.service';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-view-work',
  templateUrl: './view-work.component.html',
  styleUrls: ['./view-work.component.css'],
  providers: [DatePipe]
})
export class ViewWorkComponent implements OnInit, OnDestroy {

  firestoreSubscription4: Subscription;
  currentUser: User;
  user: User;

  purchase: Purchase;

  workId: number;
  licenseProfileIds: number[];
  licenseProfiles: any;
  spin: boolean;
  userDetails: Observable<User>;


  firestoreSubscription1: Subscription;
  firestoreSubscription2: Subscription;
  firestoreSubscription3: Subscription;

  blockchainSubscription1: Subscription;
  blockchainSubscription2: Subscription;
  blockchainSubscription4: Subscription;


  firestoreWork: Work;
  blockchainWork: Work;

  status: string;
  approvedStatus: boolean;
  contributors: Array<{
    address: string,
    split: number
  }>;

  constructor(
    private web3Service: Web3Service,
    private ethereumService: EthereumService,
    private _fireUserService: UserService,
    private _fireWorkService: WorkService,
    private _fireLicenseService: LicenseService,
    private _firePurchaseService: PurchaseService,
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute) {

    this.blockchainSubscription1 = new Subscription();
    this.blockchainSubscription2 = new Subscription();
    this.blockchainSubscription4 = new Subscription();

    this.firestoreSubscription1 = new Subscription();
    this.firestoreSubscription2 = new Subscription();
    this.firestoreSubscription3 = new Subscription();


    this.firestoreWork = {} as Work;
    this.blockchainWork = {} as Work;

    this.route.params.subscribe(params => this.workId = parseInt(params['id']));

    this.firestoreSubscription4 = this.auth.user$.subscribe(user => {
      this.user = user;
    })


    this.getWorkFromWorkId(this.workId);

    this.getLicenseProfiles(this.workId);
  }


  ngOnInit() {

  }

  ngOnDestroy() {
    this.blockchainSubscription1.unsubscribe();
    this.blockchainSubscription2.unsubscribe();
    this.blockchainSubscription4.unsubscribe();

    this.firestoreSubscription1.unsubscribe();
    this.firestoreSubscription2.unsubscribe();
    this.firestoreSubscription3.unsubscribe();
    this.firestoreSubscription4.unsubscribe();

    this.licenseProfiles = [];

  }


  getWorkFromWorkId = (id) => {
    this.getWorkFromBlockchainById(id);
    this.getWorkFromFirebaseById(id);
  }

  getLicenseProfiles = (id) => {
    this.licenseProfiles = [];
    this.blockchainSubscription1 = this.ethereumService.getLicenseProfileListFromWorkId(id)
      .subscribe(licenseProfiles => {
        if (!licenseProfiles) {
          console.log("No profiles registered for this work");
        } else {
          licenseProfiles.forEach(profile => {
            const loadedProfileFromFirestore = this.loadLicenseProfileFromFirestore(profile);
            const loadedProfileFromBlockchain = this.loadLicenseProfileFromBlockchain(profile);
            combineLatest(loadedProfileFromBlockchain, loadedProfileFromFirestore).subscribe(res => {
              let price = (res[0].price) / 1000000000000000000;
              if(res[0].activatedStatus)this.licenseProfiles.push({ id: profile, bcLicenseProfile: res[0], fsLicenseProfile: res[1], price: price });
            });
          });
        }
      }, e => { console.error('Error getting licenseprofileList; see log.') });
  }

  loadLicenseProfileFromFirestore(id): Observable<LicenseProfile> {
    return this._fireLicenseService.getLicenseProfileById(parseInt(id))
      .map(profile => { return profile as LicenseProfile })
  }

  loadLicenseProfileFromBlockchain(id): Observable<LicenseProfile> {
    return this.ethereumService.getLicenseProfileById(id)
      .map(value => {
        let blockchainLicenseProfile = {} as LicenseProfile;
        blockchainLicenseProfile.birthTime = parseInt(value[0]) * 1000;
        blockchainLicenseProfile.price = value[1];
        blockchainLicenseProfile.fingerprint = value[2];
        blockchainLicenseProfile.activatedStatus = value[3];
        blockchainLicenseProfile.workId = value[4];
        return blockchainLicenseProfile;
      })
  }



  getWorkFromBlockchainById = (id) => {
    this.blockchainSubscription2 = this.ethereumService.getWorkById(id)
      .subscribe(value => {
        this.contributors = new Array<{
          address: string,
          split: number
        }>();
        this.blockchainWork.birthTime = parseInt(value[0]) * 1000;
        this.blockchainWork.fingerprint = value[1];
        this.blockchainWork.workId = id;
        for (let i = 0; i < value[2].length; i++) {
          this.contributors.push({ address: this.web3Service.convertToChecksumAddress(value[2][i]), split: parseInt(value[3][i]) })
        }
        this.blockchainWork.approvedStatus = value[4];
      }, e => { console.error('Error getting work; see log.') });
  }

  getWorkFromFirebaseById = (id) => {
    this.spin = true;
    this.firestoreSubscription3 = this._fireWorkService.getWork(id).
      subscribe(value => {
        this.firestoreWork = value as Work;
        this.spin = false;
      });
  }

  setStatus = message => {
    this.status = message;
  };

  buyLicenseProfile(profileId, price) {
    this.setStatus('Buying license... (please wait)');
    this.blockchainSubscription4 = this.ethereumService.buyLicenseProfile(this.user.ethereumAddress, profileId, parseInt(price))
      .subscribe(async value => {

        let transaction = value.logs[0];
        if (transaction.type == "mined") {
          this.setStatus('Success! License purchased');
          this.purchase = {} as Purchase;
          this.purchase.transactionHash = transaction.transactionHash;
          this.purchase.blockNumber = transaction.blockNumber;
          this.purchase.timeOfPurchase = parseInt(transaction.args.timeOfPurchase);
          this.purchase.licenseProfileId = parseInt(transaction.args.licenseId);
          this.purchase.workId = parseInt(transaction.args.workId);
          this._fireUserService.pushPurchaseToUser(this.purchase.transactionHash);
          this._firePurchaseService.pushPurchase(this.purchase);
        } else {
          this.setStatus('Purchase failed. Transaction not mined.');
        }
      }, e => {
        this.setStatus('Error buying license; see log.');
      });
  }
}

