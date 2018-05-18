import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Web3Service, EthereumService } from './../../../blockchain-services/service';
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



@Component({
  selector: 'app-create-license',
  templateUrl: './create-license.component.html',
  styleUrls: ['./create-license.component.css']
})
export class CreateLicenseComponent implements OnInit {


  user: User;
  licenseProfile: LicenseProfile;

  fingerprint: any;
  fingerprintDisplay: string;

  workId: number;
  licenseId: number;

  licenseCreated: boolean = false;
  createEventFromBlockchain: any;

  tokenHolderAddresses = [];
  tokenHolderUids = []

  account: any;
  accounts: any;
  status: string;
  value: number;
  createForm: FormGroup;


  licenseTypes = ['Public Performance', 'Synchronization', 'Mechanical', 'Stream', 'Print'];



  constructor(
    private _fb: FormBuilder,
    private ethereumService: EthereumService,
    private _web3Service: Web3Service,
    private router: Router,
    private route: ActivatedRoute,
    private _fireUserService: UserService,
    private _fireLicenseService: LicenseService
  ) {
    this.licenseProfile = {} as LicenseProfile;

    this.route.params.subscribe(params => this.workId = parseInt(params['workId']));
    console.log(this.licenseProfile.workId);


    this.onReady();
  }

  ngOnInit() {
    this.createForm = this._fb.group({
      typeOfLicense: '',
      price: '',
      description: '',
      fingerprint: '',
    })
  }

  onReady = () => {
    this._fireUserService.getLoggedInUserDetails().subscribe(user => {
      this.user = user;
    }, err => alert(err))

    // this.setTokenHolders(this.workId);

  }

  // setTokenHolders(workId) {
  //   this.ethereumService.getTokenHoldersFromWorkId(workId)
  //     .subscribe(value => {
  //       for (let i = 0; i < value.length; i++) {
  //         this.tokenHolderAddresses.push(value[i]);
  //       }
  //     })
  // }


  hexEncode(data) {
    var hex, i;
    var result = "";
    for (i = 0; i < data.length; i++) {
      hex = data.charCodeAt(i).toString(16);
      result += (hex).slice(-4);
    }
    return "0x" + result + "0000000000000000";
  }

  onSubmit() {
    this.licenseProfile = this.createForm.value;
    this.licenseProfile.workId = this.workId;

    this.createLicense();

    // this.tokenHolderAddresses.forEach(async tokenHolder => {
    //   let user = await this._fireUserService.getUserFromAddress(tokenHolder);
    //   this.tokenHolderUid.push(user.key);
    // })

  }


  createLicense() {
    this.setStatus('Creating license.. (please wait)');
    this.ethereumService.createLicenseProfile(this.licenseProfile.workId, this.licenseProfile.price, this.fingerprint, this.user.ethereumAddress)
      .subscribe(eventCreateLicenseProfile => {
        console.log(eventCreateLicenseProfile);
        if (eventCreateLicenseProfile.logs[0].type == "mined") {
          this.licenseCreated = true;
          this.setStatus('LicenseProfile Created!');

          let event = eventCreateLicenseProfile.logs[0].args;


          this.licenseProfile.licenseProfileId = parseInt(event.licenseProfileId);

          this.tokenHolderAddresses = event.tokenHolders;

          console.log(this.tokenHolderAddresses);

          this.pushToFireStore(this.tokenHolderAddresses, this.licenseProfile);


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

  pushToFireStore(tokenHolderAddresses, licenseProfile) {
    this._fireLicenseService.pushLicenseProfile(this.licenseProfile);

    this.tokenHolderAddresses.forEach(async tokenHolder => {
      let correctAddress: string  = this._web3Service.convertToChecksumAddress(tokenHolder);
      let user = await this._fireUserService.getUserFromAddress(correctAddress);
      this.tokenHolderUids.push(user.key);
    })
    console.log(this.tokenHolderUids);



    //this._fireUserService.pushUnapprovedLicenseProfilesToUsers(tokenHolderIds, licenseProfile.licenseProfileId);
  }


  onUploadComplete(data) {
    this.fingerprint = data;
    this.fingerprintDisplay = this.hexEncode(data);
  }


}
