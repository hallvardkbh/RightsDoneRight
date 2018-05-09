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

  
  // TODO add proper types these variables
  account: any;
  accounts: any;
  status: string;
  value: number;
  typeOfWork: string;
  fingerprint: number;
  contributors = [];
  splits = [];
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
      typeOfWork: '',
      fingerprint: '',
      contributorRows: this._fb.array([this.initContributorRows()]) // here
    });
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
  };

  createWork = () => {
    this.setStatus('Creating work... (please wait)');
    this.ethereumService.createWork(this.account, this.fingerprint, this.contributors, this.splits)
      .subscribe(eventCreatedWork => {
        console.log(eventCreatedWork);
        if (eventCreatedWork.logs[0].type == "mined") {
          this.setStatus('Work created!');
        } else {
          this.setStatus('Not mined')
        }
      }, e => {
        this.setStatus('Error creating work; see log.');
      });
    this.createForm.reset()
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
    this.fingerprint = payload.fingerprint;
    payload.contributorRows.forEach(element => {
      let cont = element.contributor;
      let spl = (element.share) / 10;
      this.contributors.push(cont);
      this.splits.push(spl);
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
