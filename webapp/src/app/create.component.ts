import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Web3Service, RightsService} from '../services/service';
import {MatSliderModule, MatSelectModule, MatIconModule} from '@angular/material';


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  // TODO add proper types these variables
  account: any;
  accounts: any;
  sjekke = 40;
  status: string;

  constantContributor: any;
  typeOfWork: string;
  fingerprint: number;
  contributors = [];
  splits = [];

  createForm: FormGroup;

  types = ['Composition', 'Lyrics', 'Recording', 'Song']

  // types = [
  //   {value: 'composition-0', viewValue: 'Composition'},
  //   {value: 'lyrics-1', viewValue: 'Lyrics'},
  //   {value: 'recording-2', viewValue: 'Recording'},
  //   {value: 'song-3', viewValue: 'Song'}
  // ];
  constructor(
    private web3Service: Web3Service,
    private _fb: FormBuilder,
    private rightsService: RightsService,
    ) {
    this.onReady();
    // this.typeOfWork = "Recording";
    // this.fingerprint = 34818;
    // this.contributors = ["0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef","0xf17f52151EbEF6C7334FAD080c5704D77216b732"];
    // //For remix: "song",4891,["0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef","0xf17f52151EbEF6C7334FAD080c5704D77216b732"],[50,50]
    this.constantContributor = "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef";
    // this.splits = [5,5];
  }

  ngOnInit() {
    this.createForm = this._fb.group({
      typeOfWork: '',
      fingerprint: '',
      contributorRows: this._fb.array([this.initContributorRows()]) // here
    });
  }

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
    // control refers to your formarray
    const control = <FormArray>this.createForm.controls['contributorRows'];
    // add new formgroup
    control.push(this.initContributorRows());
  }

  deleteContributorRow(index: number) {
    // control refers to your formarray
    const control = <FormArray>this.createForm.controls['contributorRows'];
    // remove the chosen row
    control.removeAt(index);
  }

  onReady = () => {
    // Get the initial account balance so it can be displayed.
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
      }, e => this.setStatus('Error creating work; see log.'))
  };
}
