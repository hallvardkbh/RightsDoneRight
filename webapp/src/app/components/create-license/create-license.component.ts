import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Web3Service, EthereumService } from './../../../blockchain-services/service';
import { MatSliderModule, MatSelectModule, MatIconModule } from '@angular/material';
import { Router } from '@angular/router';
import { Work } from './../../models/work';
import { ActivatedRoute } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { TwitterAuthProvider_Instance } from '@firebase/auth-types';



@Component({
  selector: 'app-create-license',
  templateUrl: './create-license.component.html',
  styleUrls: ['./create-license.component.css']
})
export class CreateLicenseComponent implements OnInit {
  
  createForm: FormGroup;
  workId: number;
  account: any;
  accounts: any;
  licenseType: string;
  fingerprint: string;
  status: string;
  licenseTitle: string;
  price: number;
  description: string;



  constructor(
    private web3Service: Web3Service, 
    private _fb: FormBuilder, 
    private ethereumService: EthereumService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.route.params.subscribe(params => this.workId = parseInt(params['workId']));
    this.onReady();
  
  }

  ngOnInit() {
    this.createForm = this._fb.group({
      licenseTitle: '',
      price: '',
      licenseType: '',
      description: '',
      fingerprint: ''
    })
  }

  onUploadComplete(data) {
    console.log(data);
  }

  onReady = () => {
    // Get the initial account number so it can be displayed.
    this.web3Service.getAccounts().subscribe(accs => {
      this.accounts = accs;
      this.account = this.accounts[0];
    }, err => alert(err))
  };

  setStatus = message => {
    this.status = message;
  }

  createLicense = () => {
    this.setStatus('Creating license.. (please wait)');
    this.ethereumService.createLicenseProfile(this.workId, this.price, this.fingerprint, this.account)
      .subscribe(eventCreateLicenseProfile => {
        console.log(eventCreateLicenseProfile);
        if (eventCreateLicenseProfile.logs[0].type == "mined")  {
          this.setStatus('LicenseProfile Created!');
        } else {
          this.setStatus("not mined")
        }
      }, e => {
        this.setStatus('Error creating licenseProfile; see log.');
      });
    this.createForm.reset();
  }

  onSubmit() {

    let payload = this.createForm.value;

    this.price = payload.price;
    this.fingerprint = payload.fingerprint;
    this.licenseType = payload.licenseType;
    this.licenseTitle = payload.licenseTitle;
    this.description = payload.description;


    this.createLicense();
  }
  
  convertToContractStandard(payload) {
    this.licenseType = payload.licenseType;
    this.fingerprint = payload.fingerprint;
  }

 

}
