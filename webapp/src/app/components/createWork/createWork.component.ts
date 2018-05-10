import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Web3Service, EthereumService } from './../../../blockchain-services/service';
import { MatSliderModule, MatSelectModule, MatIconModule } from '@angular/material';
import { Router } from '@angular/router';
import { Work } from './../../models/work';
import { Observable } from 'rxjs/Observable';
import { UserService } from '../../firestore-services/user.service';
import { WorkService } from '../../firestore-services/work.service';
import { Contributor } from '../../models/contributor';


@Component({
  selector: 'app-create-work',
  templateUrl: './createWork.component.html',
  styleUrls: ['./createWork.component.css']
})
export class CreateWorkComponent implements OnInit {


  contributorsToFireStore: Array<Contributor>;
  description: string;
  title: string;
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
  contributorsToChain = [];
  splitsToChain = [];
  createForm: FormGroup;
  types = ['Composition', 'Lyrics', 'Recording', 'Song'];
  contributorTypes = ['composer', 'engineer', 'featured artist', 'label', 'lyricist', 'producer', 'publisher', 'recording artist', 'songwriter', 'other'];

  constructor(
    private _web3Service: Web3Service,
    private _fb: FormBuilder,
    private _ethereumService: EthereumService,
    private _router: Router,
    private _fireUserService: UserService,
    private _fireWorkService: WorkService
  ) {
    this.onReady();
    this.contributorsToChain = new Array<Contributor>();
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
    this._web3Service.getAccounts().subscribe(accs => {
      this.accounts = accs;
      this.account = this.accounts[0];
    }, err => alert(err))
  };

  pushToFireStore(workId: number, typeOfWork: string, title: string, description: string, contributors: Array<Contributor>){
    this._fireUserService.pushUnapprovedWorkToUser(workId);
    this._fireWorkService.pushWork(workId, typeOfWork, title, description, contributors);
  }

  setStatus = message => {
    this.status = message;
  };

  createWork = () => {
    this.setStatus('Creating work... (please wait)');
    this._ethereumService.createWork(this.account, this.fingerprint, this.contributorsToChain, this.splitsToChain)
      .subscribe(eventCreatedWork => {
        if (eventCreatedWork.logs[0].type == "mined") {
          this.setStatus('Work created!');
          this.workCreated = true;
          this.workId = parseInt(eventCreatedWork.logs[0].args.workId);
          this.pushToFireStore(this.workId, this.typeOfWork, this.title, this.description, this.contributorsToFireStore);
        } else {
          this.setStatus('Not mined')
        }
      }, e => {
        this.setStatus('Error creating work; see log.');
      });
    // this.createForm.reset()
    this.contributorsToChain = [];
    this.splitsToChain = [];
  };

  onSubmit() {
    let payload = this.createForm.value;
    this.convertToContractStandard(payload);
    this.createWork();

  }

  convertToContractStandard(payload) {
    this.title = payload.title;
    this.description = payload.description;
    this.typeOfWork = payload.typeOfWork;
    this.contributorsToFireStore = payload.contributorRows;
    payload.contributorRows.forEach(element => {
      let cont = element.address;
      let spl = (element.share) / 10;
      let role = element.role;
      this.contributorsToChain.push(cont);
      this.splitsToChain.push(spl);
    });
  }

  initContributorRows() {
    return this._fb.group({
      // list of all form controls that belongs to the form array
      address: [''],
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
