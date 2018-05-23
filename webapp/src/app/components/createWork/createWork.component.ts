import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-create-work',
  templateUrl: './createWork.component.html',
  styleUrls: ['./createWork.component.css']
})
export class CreateWorkComponent implements OnInit, OnDestroy {
  
  downloadURL: any;
  subscription: Subscription;
  contributorIds = [];
  user: User;
  userDetails: Observable<User>;

  work: Work;
  contributorsToFirestore: Array<Contributor>;
  fingerprintDisplay: string;
  workCreated: boolean = false;
  createEventFromBlockchain: any;

  status: string;
  fingerprint: any;
  contributorsToChain = [];
  splitsToChain = [];
  createForm: FormGroup;
  types = ['Composition', 'Lyrics', 'Recording', 'Song'];
  contributorTypes = ['composer', 'engineer', 'featured artist', 'label', 'lyricist', 'producer', 'publisher', 'recording artist', 'songwriter', 'other'];

  constructor(
    private _fb: FormBuilder,
    private _ethereumService: EthereumService,
    private _router: Router,
    private _fireUserService: UserService,
    private _fireWorkService: WorkService,
    public auth: AuthService,
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  //Event from file upload
  onUploadComplete(data) {
    this.fingerprint = data.hash;
    this.downloadURL = data.downloadURL;
    this.fingerprintDisplay = this.hexEncode(data.hash);

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
    this.subscription = this.auth.user$.subscribe(user => {
      this.user = user;
    },err => alert(err))
  }

  onSubmit() {
    this.work = this.createForm.value;
    this.work.uploadedBy = this.user.ethereumAddress;
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
      let user = await this._fireUserService.getUserFromAddress(cont);
      this.contributorIds.push(user.key);
      if (!user.value.aliasName) {
        contributorName = user.value.firstName + ' ' + user.value.lastName;
      } else {
        contributorName = user.value.aliasName;
      }
      let creator: Contributor = {
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
    this._ethereumService.createWork(this.user.ethereumAddress, this.fingerprint, this.contributorsToChain, this.splitsToChain)
      .subscribe(eventCreatedWork => {
        if (eventCreatedWork.logs[0].type == "mined") {
          this.setStatus('Work created!');
          this.work.workId = parseInt(eventCreatedWork.logs[0].args.workId);
          this.work.downloadUrl = this.downloadURL;
          this.work.contributors = this.contributorsToFirestore;
          this.pushToFireStore(this.contributorIds, this.work);
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
    this.contributorIds = [];
  };


  pushToFireStore(contributorIds: any, work: Work) {
    this._fireUserService.pushUnapprovedWorkToUsers(contributorIds, work.workId);
    this._fireWorkService.pushWork(work);
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
