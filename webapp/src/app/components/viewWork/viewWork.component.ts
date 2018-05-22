import { Component, OnDestroy, OnInit } from '@angular/core';
import { Web3Service, EthereumService } from './../../../blockchain-services/service';
import { Router } from '@angular/router';
import { Work } from './../../models/work';
import { ActivatedRoute } from "@angular/router";
import { DatePipe } from "@angular/common";
import { WorkService } from '../../firestore-services/work.service';
import { Subscription } from 'rxjs';
import { LicenseProfile } from '../../models/licenseProfile';
import { LicenseService } from '../../firestore-services/license.service';
import { User } from '../../models/user';
import { UserService } from '../../firestore-services/user.service';
import { Purchase } from '../../models/purchase';
import { PurchaseService } from '../../firestore-services/purchase.service';


@Component({
  selector: 'app-view-work',
  templateUrl: './viewWork.component.html',
  styleUrls: ['./viewWork.component.css'],
  providers: [DatePipe]
})
export class ViewWorkComponent implements OnInit, OnDestroy {

  user: User;

  purchase: Purchase;

  workId: number;
  licenseProfileIds: number[];
  licenseProfiles: LicenseProfile[];
  spin: boolean;

  firestoreSubscription: Subscription;
  blockchainSubscription: Subscription;

  firestoreWork: Work;
  blockchainWork: Work;

  blockchainLicenseProfile: LicenseProfile;

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
    private router: Router,
    private route: ActivatedRoute) {
    this.onReady();

    this.licenseProfiles = new Array;


    this.firestoreWork = {} as Work;
    this.blockchainWork = {} as Work;

    this.blockchainLicenseProfile = {} as LicenseProfile;



    this.route.params.subscribe(params => this.workId = parseInt(params['id']));

    this.getWorkFromWorkId(this.workId);

    this.getLicenseProfiles(this.workId);
  }


  ngOnInit() {

  }

  onReady = () => {
    this.firestoreSubscription = this._fireUserService.userDetails.subscribe(user => {
      this.user = user;
    }, err => alert(err))
  }

  ngOnDestroy() {
    this.blockchainSubscription.unsubscribe();
    this.firestoreSubscription.unsubscribe();
  }


  getWorkFromWorkId = (id) => {
    this.getWorkFromBlockchainById(id);
    this.getWorkFromFirebaseById(id);
  }

  getLicenseProfiles = (id) => {
    this.blockchainSubscription = this.ethereumService.getLicenseProfileListFromWorkId(id)
      .subscribe(value => {
        for (let i = 0; i < value.length; i++) {
          this.firestoreSubscription = this._fireLicenseService.getLicenseProfileById(parseInt(value[i]))
            .subscribe(async profile => {
              let newProfile = await profile as LicenseProfile;
              this.licenseProfiles.push(newProfile);
            })
        }
      }, e => { console.error('Error getting licenseprofileList; see log.') });

  }

  getWorkFromBlockchainById = (id) => {
    this.blockchainSubscription = this.ethereumService.getWorkById(id)
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
    this.firestoreSubscription = this._fireWorkService.getWork(id).
      subscribe(value => {
        this.firestoreWork = value as Work;
        this.spin = false;
      });
  }

  onLicensePanelClick(id) {
    this.blockchainSubscription = this.ethereumService.getLicenseProfileById(id)
      .subscribe(value => {
        this.blockchainLicenseProfile.birthTime = parseInt(value[0]) * 1000;
        this.blockchainLicenseProfile.price = value[1];
        this.blockchainLicenseProfile.fingerprint = value[2];
        this.blockchainLicenseProfile.activatedStatus = value[3];
        this.blockchainLicenseProfile.workId = value[4];
      })
  }

  buyLicenseProfile(profileId, price) {
    this.blockchainSubscription = this.ethereumService.buyLicenseProfile(this.user.ethereumAddress, profileId, parseInt(price))
    .subscribe(async value => {
      let transaction = value.logs[0];
      console.log(transaction);

      if(transaction.type == "mined") {
        this.purchase = {} as Purchase;
        let user = await this._fireUserService.getUserFromAddress(this.user.ethereumAddress);
        
        this.purchase.transactionHash = transaction.transactionHash;

        this.purchase.blockNumber = transaction.blockNumber;

        this.purchase.timeOfPurchase = parseInt(transaction.args.timeOfPurchase);

        this.purchase.licenseProfileId = parseInt(transaction.args.licenseId);

        this.purchase.workId = parseInt(transaction.args.workId);


        this._fireUserService.pushPurchaseToUser(this.purchase.transactionHash, user.key);

        this._firePurchaseService.pushPurchase(this.purchase);
    
        
      }

      console.log(this.purchase);
   

      



    })
  }

}
