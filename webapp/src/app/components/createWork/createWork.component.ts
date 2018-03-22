import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Web3Service, EthereumService} from './../../../blockchain-services/service';
import { MatSliderModule, MatSelectModule, MatIconModule } from '@angular/material';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { CreateService } from './../../services/create.service';
import { Work } from './../../models/work';


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
  typeOfWork: string;
  fingerprint: number;
  contributors = [];
  splits = [];
  createForm: FormGroup;
  types = ['Composition', 'Lyrics', 'Recording', 'Song']
  savedOnChain: boolean;

  constructor(
    private web3Service: Web3Service,
    private createService: CreateService,
    private _fb: FormBuilder,
    private rightsService: EthereumService,
    public af: AngularFireAuth,
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
    this.rightsService.createWork(this.account,this.typeOfWork, this.fingerprint, this.contributors, this.splits)
      .subscribe(() =>{
        this.setStatus('Work created!');
        this.savedOnChain = true;
      }, e => {
        this.setStatus('Error creating work; see log.');
        this.savedOnChain = false;
      })
  };

  onSubmit() {
    let payload = this.createForm.value;
    this.convertToContractStandard(payload);
    this.createWork();
    // if(this.savedOnChain){
    //   this.createService.createWork(johnny)
    // }
  }

  convertToContractStandard(payload) {
      this.typeOfWork = payload.typeOfWork;
      this.fingerprint = payload.fingerprint;
      payload.contributorRows.forEach(element => {
        let cont = element.contributor;
        let spl = (element.share)/10;
        this.contributors.push(cont);
        this.splits.push(spl);
      });
  }

  initContributorRows() {
    return this._fb.group({
        // list all your form controls here, which belongs to your form array
        contributor: [''],
        share: [''],
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