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
import { User } from '../../models/user';


@Component({
  selector: 'app-create-work',
  templateUrl: './createWork.component.html',
  styleUrls: ['./createWork.component.css']
})
export class CreateWorkComponent implements OnInit {
  user: User;
  work: Work;
  contributorsToFireStore: Array<Contributor>;
  fingerprintDisplay: string;
  workCreated: boolean = false;
  createEventFromBlockchain: any;
  // TODO add proper types these variables
  account: any;
  accounts: any;
  status: string;
  value: number;

  fingerprint: any;
  contributorsToChain = [];
  splitsToChain = [];
  contributorsToFirestore = [];
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
    this.contributorsToFirestore = new Array<Contributor>();
  }

  ngOnInit() {
    this.createForm = this._fb.group({
      title: '',
      description: '',
      typeOfWork: '',
      contributors: this._fb.array([this.initContributor()]),
      fingerprint: '',
      // here
    });
  }

  //Event from file upload
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

  onReady = () => {
    // Get the initial account number so it can be displayed.
    this._web3Service.getAccounts().subscribe(accs => {
      this.accounts = accs;
      this.account = this.accounts[0];
    }, err => alert(err))
  };

  onSubmit() {
    this.work = this.createForm.value;
    console.log(this.work);
    this.convertToContractAndFirestoreStandard(this.work.contributors);
    this.createWork();
  }


  convertToContractAndFirestoreStandard(contributors) {
    contributors.forEach(async element => {
      let cont = element.address;
      let spl = (element.share) / 10;
      let role = element.role;
      this.contributorsToChain.push(cont);
      this.splitsToChain.push(spl);
      var contributorName = '';
      let user = await this.getCreatorFromFireStore(cont);
      if (!user.aliasName) {
        contributorName = user.firstName + ' ' + user.lastName;
      } else {
        contributorName = user.aliasName;
      }
      let creator = {
        address: element.address,
        share: element.share,
        role: element.role,
        name: contributorName
      }
      this.contributorsToFirestore.push(creator);
    });
  }

  createWork = () => {
    this.setStatus('Creating work... (please wait)');
    this._ethereumService.createWork(this.account, this.fingerprint, this.contributorsToChain, this.splitsToChain)
      .subscribe(eventCreatedWork => {
        if (eventCreatedWork.logs[0].type == "mined") {
          this.setStatus('Work created!');
          this.work.workId = parseInt(eventCreatedWork.logs[0].args.workId);
          this.work.contributors = this.contributorsToFirestore;
          this.pushToFireStore(this.work);
          this.workCreated = true;
        } else {
          this.setStatus('Not mined')
        }
      }, e => {
        this.setStatus('Error creating work; see log.');
      });
    // this.createForm.reset()
    this.contributorsToChain = [];
    this.splitsToChain = [];
    this.contributorsToFirestore = [];
  };


  pushToFireStore(work: Work) {
    this._fireUserService.pushUnapprovedWorkToUser(work.workId);
    this._fireWorkService.pushWork(work);
  }

  async getCreatorFromFireStore(address: string) {
    let doc = await this._fireUserService.getUserUidWithAddress(address);
    let user: Promise<User>;
    console.log(doc.get('uid'));
    let frode = doc.get('uid');
    let userDocumentSnapshot = await this._fireUserService.getUserWithUid(frode);
    console.log(userDocumentSnapshot.data());
    return userDocumentSnapshot.data()
  }

  setStatus = message => {
    this.status = message;
  };


  //Add new contributors

  initContributor() {
    return this._fb.group({
      // list of all form controls that belongs to the form array
      address: [''],
      share: [''],
      role: [''],
    });
  }

  addNewContributor() {
    const control = <FormArray>this.createForm.controls['contributors'];
    // add new formgroup
    control.push(this.initContributor());
  }

  deleteContributor(index: number) {
    const control = <FormArray>this.createForm.controls['contributors'];
    // remove the chosen row
    control.removeAt(index);
  }


}
