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
  
  tokenHolderIds = [];

  account: any;
  accounts: any;
  status: string;
  value: number;
  createForm: FormGroup;


  licenseTypes = ['Public Performance', 'Synchronization', 'Mechanical', 'Stream', 'Print'];



  constructor(
    private web3Service: Web3Service,
    private _fb: FormBuilder,
    private ethereumService: EthereumService,
    private router: Router,
    private route: ActivatedRoute,
    private _fireUserService: UserService,
    private _fireLicenseService: LicenseService
  ) {

    this.route.params.subscribe(params => this.workId = parseInt(params['workId']));
    console.log(this.workId);
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
    // Get the initial account number so it can be displayed.
    this.web3Service.getAccounts().subscribe(accs => {
      this.accounts = accs;
      this.account = this.accounts[0];
    }, err => alert(err))
  };


  onUploadComplete(data) {
    this.fingerprint = data;
    this.fingerprintDisplay = this.hexEncode(data);
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

  onSubmit() {
    this.licenseProfile = this.createForm.value;
    this.licenseProfile.workId = this.workId;

    this.createLicense();
  }


  setStatus = message => {
    this.status = message;
  }

  createLicense = () => {
    this.setStatus('Creating license.. (please wait)');
    this.ethereumService.createLicenseProfile(this.licenseProfile.workId, this.licenseProfile.price, this.fingerprint, this.account)
      .subscribe(eventCreateLicenseProfile => {
        console.log(eventCreateLicenseProfile);
        if (eventCreateLicenseProfile.logs[0].type == "mined") {
          this.setStatus('LicenseProfile Created!');
          this.licenseProfile.licenseProfileId = parseInt(eventCreateLicenseProfile.logs[0].args.licenseProfileId);


          //this.tokenHolderIds = this.ethereumService.getTokenHoldersFromWorkId(this.workId)


          this.pushToFireStore(this.tokenHolderIds, this.licenseProfile)
          this.licenseCreated = true;          
        } else {
          this.setStatus("not mined")
        }
      }, e => {
        this.setStatus('Error creating licenseProfile; see log.');
      });
    
  }

  pushToFireStore(tokenHolderIds: any, licenseProfile: LicenseProfile) {
    //this._fireUserService.pushUnapprovedLicenseProfilesToUsers(tokenHolderIds, this.licenseProfile.licenseProfileId);
    this._fireLicenseService.pushLicenseProfile(licenseProfile);
  }

 
}
