import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { UserService } from '../../firestore-services/user.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user';
import { EthereumService, Web3Service } from '../../../blockchain-services/service';
import { Subscription } from 'rxjs';
import { Work } from '../../models/work';
import { LicenseProfile } from '../../models/licenseProfile';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  user: User;
  currentUser: any;


  work: Work;
  birthTime: number;
  fingerprint: string;

  licenseProfile: LicenseProfile;

  status: string;

  contributors: Array<{
    address: string,
    split: number
  }>;

  licenseProfilePrice: number;

  userRef: AngularFirestoreDocument<any>;

  constructor(
    private _fireUserService: UserService,
    private ethereumService: EthereumService,
    private web3service: Web3Service,
    private afAuth: AngularFireAuth
  ) {
    this.onReady();
    this.currentUser = this.afAuth.auth.currentUser;    
    this.work = {} as Work;
    this.licenseProfile = {} as LicenseProfile;


  }

  ngOnInit() {
  }

  onReady = () => {
    this.subscription = this._fireUserService.userDetails.subscribe(user => {
      this.user = user;
    },err => alert(err))
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  onWorkPanelClick(id) {
    this.ethereumService.getWorkById(id)
      .subscribe(value => {
        this.contributors = new Array<{
          address: string,
          split: number
        }>();
        this.work.birthTime = parseInt(value[0]) * 1000;
        this.work.fingerprint = value[1];
        this.work.workId = id;
        for (let i = 0; i < value[2].length; i++) {
          this.contributors.push({ address: this.web3service.convertToChecksumAddress(value[2][i]), split: parseInt(value[3][i]) })
        }
        this.work.approvedStatus = value[4];
      }, e => { console.error('Error getting work count; see log.') });
  }

  onLicensePanelClick(id) {
    this.ethereumService.getLicenseProfileById(id)
    .subscribe(value => {
      this.licenseProfile.birthTime = parseInt(value[0]) * 1000;
      this.licenseProfile.price = value[1];
      this.licenseProfile.fingerprint = value[2];
      this.licenseProfile.activatedStatus = value[3];
      this.licenseProfile.workId = value[4];
    })
  }

  onApproveWorkButtonClick(account, id){
    this.ethereumService.approveWork(account, id)
    .subscribe(value => {
      if(value){
        this._fireUserService.pushApprovedWorkToCurrentUser(id);
      }
    }, e => { console.error('Error approving work; see log.') });
  }

  onActivateLicensePreofileButtonClick(account, profileId){
    this.ethereumService.activateLicenseProfile(account, profileId)
    .subscribe(value => {
      if(value){
        this._fireUserService.activateLicenseProfileToCurrentUser(profileId);
      }
    }, e => { console.error('Error activating license profile; see log.') });
  }

  onDeactivateLicensePreofileButtonClick(account, profileId) {
    this.ethereumService.deactivateLicenseProfile(account, profileId)
    .subscribe(value => {
      if(value) {
        this._fireUserService.deactivateLicenseProfileToCurrentUser(profileId);
      }
    }, e => { console.error('Error deactivating license profile; see log.') });
  }

}