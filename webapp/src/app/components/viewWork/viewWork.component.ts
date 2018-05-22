import { Component, OnDestroy, OnInit } from '@angular/core';
import { Web3Service, EthereumService } from './../../../blockchain-services/service';
import { Router } from '@angular/router';
import { Work } from './../../models/work';
import { ActivatedRoute } from "@angular/router";
import { DatePipe } from "@angular/common";
import { WorkService } from '../../firestore-services/work.service';
import { Subscription, Observable } from 'rxjs';
import { LicenseProfile } from '../../models/licenseProfile';
import { LicenseService } from '../../firestore-services/license.service';
import { User } from '../../models/user';
import { UserService } from '../../firestore-services/user.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { AuthService } from '../../auth/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';


@Component({
  selector: 'app-view-work',
  templateUrl: './viewWork.component.html',
  styleUrls: ['./viewWork.component.css'],
  providers: [DatePipe]
})
export class ViewWorkComponent implements OnInit, OnDestroy {

  currentUser: User;
  user: User;

  workId: number;
  licenseProfileIds: number[];
  licenseProfiles: LicenseProfile[];
  spin: boolean;
  userDetails: Observable<User>;


  firestoreSubscription1: Subscription;
  firestoreSubscription2: Subscription;
  firestoreSubscription3: Subscription;

  blockchainSubscription1: Subscription;
  blockchainSubscription2: Subscription;
  blockchainSubscription3: Subscription;
  blockchainSubscription4: Subscription;


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
    public afs: AngularFirestore,
    public auth: AuthService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private route: ActivatedRoute) {

    this.licenseProfiles = new Array;

    this.blockchainSubscription1 = new Subscription();
    this.blockchainSubscription2 = new Subscription();
    this.blockchainSubscription3 = new Subscription();
    this.blockchainSubscription4 = new Subscription();

    this.firestoreSubscription1 = new Subscription();
    this.firestoreSubscription2 = new Subscription();
    this.firestoreSubscription3 = new Subscription();


    this.firestoreWork = {} as Work;
    this.blockchainWork = {} as Work;

    this.blockchainLicenseProfile = {} as LicenseProfile;
    
    




    this.route.params.subscribe(params => this.workId = parseInt(params['id']));

    this.getWorkFromWorkId(this.workId);

    this.getLicenseProfiles(this.workId);
  }


  ngOnInit() {
    this.currentUser = this.afAuth.auth.currentUser;
    if(this.currentUser) this.userDetails = this.afs.doc(`users/${this.currentUser.uid}`).valueChanges();

  }

  buyLicenseProfile(profileId, price) {
    console.log(this.userDetails);
    if(this.userDetails){
      this.firestoreSubscription1 = this.userDetails.subscribe(user => {
        this.user = user;
        this.blockchainSubscription4 = this.ethereumService.buyLicenseProfile(this.user.ethereumAddress, profileId, parseInt(price)).subscribe(value => {
          console.log(value);
        })
      }, err => alert(err))
    }
  }

  ngOnDestroy() {
    this.blockchainSubscription1.unsubscribe();
    this.blockchainSubscription2.unsubscribe();
    this.blockchainSubscription3.unsubscribe();
    this.blockchainSubscription4.unsubscribe();

    this.firestoreSubscription1.unsubscribe();
    this.firestoreSubscription2.unsubscribe();
    this.firestoreSubscription3.unsubscribe();

  }


  getWorkFromWorkId = (id) => {
    this.getWorkFromBlockchainById(id);
    this.getWorkFromFirebaseById(id);
  }

  getLicenseProfiles = (id) => {
    this.blockchainSubscription1 = this.ethereumService.getLicenseProfileListFromWorkId(id)
      .subscribe(value => {
        for (let i = 0; i < value.length; i++) {
          this.firestoreSubscription2 = this._fireLicenseService.getLicenseProfileById(parseInt(value[i]))
            .subscribe(async profile => {
              let newProfile = await profile as LicenseProfile;
              this.licenseProfiles.push(newProfile);
            })
        }
      }, e => { console.error('Error getting licenseprofileList; see log.') });

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

  onLicensePanelClick(id) {
    this.blockchainSubscription3 = this.ethereumService.getLicenseProfileById(id)
      .subscribe(value => {
        this.blockchainLicenseProfile.birthTime = parseInt(value[0]) * 1000;
        this.blockchainLicenseProfile.price = value[1];
        this.blockchainLicenseProfile.fingerprint = value[2];
        this.blockchainLicenseProfile.activatedStatus = value[3];
        this.blockchainLicenseProfile.workId = value[4];
      })
  }

}
