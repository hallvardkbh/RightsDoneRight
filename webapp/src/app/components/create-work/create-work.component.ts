import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Web3Service, EthereumService } from './../../blockchain-services/service';
import { Router } from '@angular/router';
import { Work } from './../../models/work';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '../../firestore-services/user.service';
import { WorkService } from '../../firestore-services/work.service';
import { Contributor } from '../../models/contributor';
import { User } from '../../models/user';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-create-work',
  templateUrl: './create-work.component.html',
  styleUrls: ['./create-work.component.css']
})
export class CreateWorkComponent implements OnInit, OnDestroy {

  metadata: any;
  workPushComplete: Subscription;
  downloadURL: any;
  subscription: Subscription;
  contributorIds = [];
  user: User;

  work: Work;
  contributorsToFirestore: Array<Contributor>;
  fingerprintDisplay: string;

  status: string;
  fingerprint: any;
  contributorsToChain = [];
  splitsToChain = [];
  createForm: FormGroup;
  types = ['Composition', 'Lyrics', 'Recording', 'Song'];
  contributorTypes = ['composer', 'engineer', 'featured artist', 'label',
  'lyricist', 'producer', 'publisher', 'recording artist', 'songwriter', 'other'];

  constructor(
    private _fb: FormBuilder,
    private _ethereumService: EthereumService,
    private _fireUserService: UserService,
    private _fireWorkService: WorkService,
    public auth: AuthService,
  ) {
    this.onReady();
    this.contributorsToFirestore = new Array<Contributor>();
  }

  ngOnInit() {
    this.workPushComplete = new Subscription();
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
    this.workPushComplete.unsubscribe();
  }

  onReady = () => {
    this.subscription = this.auth.user$.subscribe(user => {
      this.user = user;
    }, err => alert(err));
  }

  // Event from file upload
  onUploadComplete(data) {
    this.metadata = data;
    this.fingerprint = data.hash;
    this.fingerprintDisplay = this.hexEncode(data.hash);
    console.log('Real fingerprint: ', this.fingerprint);
    console.log('Display fingerprint: ', this.fingerprintDisplay);
  }

  private hexEncode(data) {
    let hex, i;
    let result = '';
    for (i = 0; i < data.length; i++) {
      hex = data.charCodeAt(i).toString(16);
      result += (hex).slice(-4);
    }
    return '0x' + result + '0000000000000000';
  }

  onSubmit() {

    // Sets a Work-instance equal to the form values
    this.work = this.createForm.value;

    // Adds data to the Work-instance NOT provided by the form
    this.work.uploadedBy = this.user.ethereumAddress;

    // The form field values of the contributors cannot directly be stored on the blockchain
    // because the blockchain function requires a different data type as parameters.
    // The function below converts the contributor objects into two arrays:
    // one with contributors' Ethereum addresses and the other with shares.
    this.convertToContractAndFirestoreStandard(this.work.contributors);

    // Adds work to both the blockchain and Firestore. Will only push to Firestore if Blockchain
    // storage is a success.
    this.createWork();
  }


  private convertToContractAndFirestoreStandard(contributors) {
    contributors.forEach(async element => {
      const cont = element.address;
      const spl = (element.share) / 10;
      const role = element.role;
      this.contributorsToChain.push(cont);
      this.splitsToChain.push(spl);
      let contributorName = '';
      const user = await this._fireUserService.getUserFromAddress(cont);
      this.contributorIds.push(user.key);
      if (!user.value.aliasName) {
        contributorName = user.value.firstName + ' ' + user.value.lastName;
      } else {
        contributorName = user.value.aliasName;
      }
      const creator: Contributor = {
        address: element.address,
        share: element.share,
        role: element.role,
        name: contributorName
      };
      this.contributorsToFirestore.push(creator);
    });
  }

  createWork = () => {

    // Displaying current status for the user
    this.setStatus('Creating work... (please wait)');

    // Pushing vital properties to the Blockchain. Since the logged in user pays for the
    // Ethereum transaction the 'user.ethereumAddress' is sent as a parameter as well.
    this._ethereumService.createWork(this.user.ethereumAddress, this.fingerprint,
      this.contributorsToChain, this.splitsToChain)
      .subscribe(eventCreatedWork => {

        // If the transaction is successfully completed and the work has been
        // stored on the blockchain.
        if (eventCreatedWork.logs[0].type === 'mined') {

          this.setStatus('Work stored on blockchain.');

          // Sets the ID that the work was given on the blockchain to a property of the Work instance.
          // tslint:disable-next-line:radix
          this.work.workId = parseInt(eventCreatedWork.logs[0].args.workId);

          // Sets a property of the Work instance equal to the download URL from the returned
          // metadata object upon file upload completion to Firebase.
          this.work.downloadUrl = this.metadata.downloadURL;

          // Overwriting the contributors property of the Work instance to an array of more complex objects
          this.work.contributors = this.contributorsToFirestore;

          // Pushing the new Work to the 'works' collection in Firestore and updating fields in every
          // contributor's user document in the 'users' collection.
          this.pushToFireStore(this.contributorIds, this.work);

        } else {
          this.setStatus('Not mined');
        }
      }, e => {
        this.setStatus('Error creating work; see log.');
      });

    // this.createForm.reset()
    this.contributorsToChain = [];
    this.splitsToChain = [];
    this.contributorsToFirestore = [];
    this.contributorIds = [];

  }


  pushToFireStore(contributorIds: any, work: Work) {
    this._fireUserService.pushUnapprovedWorkToUsers(contributorIds, work.workId);
    this._fireWorkService.pushWork(work);
    this.workPushComplete = this._fireWorkService.pushWorkComplete$.subscribe(() => {
      this.setStatus('Work stored on blockchain and in Firestore.');
    });
  }

  setStatus = message => {
    this.status = message;
  }


  // Add new contributors

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
