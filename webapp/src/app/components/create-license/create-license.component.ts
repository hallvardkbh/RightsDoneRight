import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Web3Service, EthereumService } from './../../blockchain-services/service';
import { MatSliderModule, MatSelectModule, MatIconModule } from '@angular/material';
import { Router } from '@angular/router';
import { Work } from './../../models/work';
import { ActivatedRoute } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { TwitterAuthProvider_Instance } from '@firebase/auth-types';
import { User } from '../../models/user';
import { LicenseProfile } from '../../models/licenseProfile';
import { Contributor } from '../../models/contributor';
import { LicenseService } from '../../firestore-services/license.service';
import { WorkService } from '../../firestore-services/work.service';
import { UserService } from '../../firestore-services/user.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';



@Component({
  selector: 'app-create-license',
  templateUrl: './create-license.component.html',
  styleUrls: ['./create-license.component.css']
})
export class CreateLicenseComponent implements OnInit, OnDestroy {

  subscription: Subscription;

  downloadUrl: any;
  user: User;
  licenseProfile: LicenseProfile;

  fingerprint: any;
  fingerprintDisplay: string;

  workId: number;

  tokenHolderAddresses = [];
  tokenHolderUids = []

  status: string;
  createForm: FormGroup;


  licenseTypes = ['Public Performance', 'Synchronization', 'Mechanical', 'Stream', 'Print'];



  constructor(
    private _fb: FormBuilder,
    private ethereumService: EthereumService,
    private _web3Service: Web3Service,
    private router: Router,
    private route: ActivatedRoute,
    private _fireUserService: UserService,
    private _fireLicenseService: LicenseService,
    public auth: AuthService
  ) {
    this.licenseProfile = {} as LicenseProfile;

    this.route.params.subscribe(params => this.workId = parseInt(params['workId']));

    this.onReady();
  }

  ngOnInit() {
    this.createForm = this._fb.group({
      workId: '',
      typeOfLicense: '',
      price: '',
      description: '',
      fingerprint: '',
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onReady = () => {
    this.subscription = this.auth.user$.subscribe(user => {
      this.user = user;
    }, err => alert(err))
  }


  hexEncode(data) {
    var hex, i;
    var result = "";
    for (i = 0; i < data.length; i++) {
      hex = data.charCodeAt(i).toString(16);
      result += (hex).slice(-4);
    }
    return "0x" + result + "0000000000000000";
  }

  async onSubmit() {
    this.licenseProfile = this.createForm.value;
    this.licenseProfile.price *= 1000000000000000000;
    this.licenseProfile.workId = this.workId;
    this.licenseProfile.uploadedBy = this.user.ethereumAddress;

    this.createLicense();
  }
  
  createLicense() {
    this.setStatus('Creating license.. (please wait)');
    this.ethereumService.createLicenseProfile(this.licenseProfile.workId, this.licenseProfile.price, this.fingerprint, this.user.ethereumAddress)
      .subscribe(async eventCreateLicenseProfile => {
        if (eventCreateLicenseProfile.logs[0].type == "mined") {
          this.setStatus('License Profile Created!');

          let event = eventCreateLicenseProfile.logs[0].args;

          this.licenseProfile.licenseProfileId = parseInt(event.licenseProfileId);
          event.tokenHolders.forEach( tokenHolder => {
            this.tokenHolderAddresses.push(this._web3Service.convertToChecksumAddress(tokenHolder));
          })
          this.tokenHolderAddresses.forEach(async address => {
            let user = await this._fireUserService.getUserFromAddress(address);
            this._fireUserService.pushLicenseProfileToUser(user.key, this.licenseProfile.licenseProfileId);
          })

          this.licenseProfile.downloadUrl = this.downloadUrl;


          this._fireLicenseService.pushLicenseProfile(this.licenseProfile);

        } else {
          this.setStatus("not mined")
        }
      }, e => {
        this.setStatus('Error creating licenseProfile; see log.');
      });
  }


  setStatus = message => {
    this.status = message;
  }


  onUploadComplete(data) {
    this.fingerprint = data.hash;
    this.downloadUrl = data.downloadURL;
    this.fingerprintDisplay = this.hexEncode(data.hash);
  }


}
