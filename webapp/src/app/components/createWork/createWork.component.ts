import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Web3Service, EthereumService } from './../../../blockchain-services/service';
import { MatSliderModule, MatSelectModule, MatIconModule } from '@angular/material';
import { Router } from '@angular/router';
import { Work } from './../../models/work';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-create-work',
  templateUrl: './createWork.component.html',
  styleUrls: ['./createWork.component.css']
})
export class CreateWorkComponent implements OnInit {


  fingerprintDisplay: string;
  workId: number;
  workCreated: boolean = false;
  createEventFromBlockchain: any;
  // TODO add proper types these variables
  account: any;
  accounts: any;
  status: string;
  value: number;
  typeOfWork: string;
  fingerprint: any;
  contributors = [];
  splits = [];
  roles = [];
  createForm: FormGroup;
  types = ['Composition', 'Lyrics', 'Recording', 'Song'];
  contributorTypes = ['composer', 'engineer', 'featured artist', 'label', 'lyricist', 'producer', 'publisher', 'recording artist', 'songwriter', 'other'];

  constructor(
    private web3Service: Web3Service,
    private _fb: FormBuilder,
    private ethereumService: EthereumService,
    private router: Router
  ) {
    this.onReady();
  }

  ngOnInit() {
    this.createForm = this._fb.group({
      title: '',
      description: '',
      typeOfWork: '',
      contributorRows: this._fb.array([this.initContributorRows()]),
      fingerprint: '',
      // here
    });
  }

  onUploadComplete(data) {
    console.log(data);
    console.log(this.hexEncode(data));
    this.fingerprint = data;
    this.fingerprintDisplay = this.hexEncode(data);

  }

  hexEncode(data){
    var hex, i;

    var result = "";
    for (i=0; i<data.length; i++) {
        hex = data.charCodeAt(i).toString(16);
        result += (hex).slice(-4);
    }

    return "0x"+result+"0000000000000000";
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
  };

  createWork = () => {
    this.setStatus('Creating work... (please wait)');
    this.ethereumService.createWork(this.account, this.fingerprint, this.contributors, this.splits)
      .subscribe(eventCreatedWork => {
        console.log(eventCreatedWork);
        if (eventCreatedWork.logs[0].type == "mined") {
          this.setStatus('Work created!');
          this.workCreated = true;
          this.workId = parseInt(eventCreatedWork.logs[0].args.workId);
        } else {
          this.setStatus('Not mined')
        }
      }, e => {
        this.setStatus('Error creating work; see log.');
      });
    // this.createForm.reset()
    this.contributors = [];
    this.splits = [];
  };

  onSubmit() {
    let payload = this.createForm.value;
    this.convertToContractStandard(payload);
    this.createWork();

  }

  convertToContractStandard(payload) {
    this.typeOfWork = payload.typeOfWork;
    payload.contributorRows.forEach(element => {
      let cont = element.contributor;
      let spl = (element.share) / 10;
      let role = element.role;
      this.contributors.push(cont);
      this.splits.push(spl);
      this.roles.push(role)
    });
  }

  initContributorRows() {
    return this._fb.group({
      // list of all form controls that belongs to the form array
      contributor: [''],
      share: [''],
      role: [''],
    });
  }
  addNewContributorRow() {
    const control = <FormArray>this.createForm.controls['contributorRows'];
    // add new formgroup
    control.push(this.initContributorRows());
  }

  deleteContributorRow(index: number) {
    const control = <FormArray>this.createForm.controls['contributorRows'];
    // remove the chosen row
    control.removeAt(index);
  }


}
