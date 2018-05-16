import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { UserService } from '../../firestore-services/user.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user';
import { EthereumService, Web3Service } from '../../../blockchain-services/service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  workApprovedByUser: boolean;
  firstName: string;
  email: string;
  user$: User;

  work: any;
  status: string;
  typeOfWork: string;
  fingerprint: string;
  birthTime: number;
  approvedStatus: boolean;
  contributors: Array<{
    address: string,
    split: number
  }>;

  userRef: AngularFirestoreDocument<any>;

  constructor(
    private userService: UserService,
    private ethereumService: EthereumService,
    private web3service: Web3Service
  ) {
    this.workApprovedByUser = false;
  }

  ngOnInit() {
    this.subscription = this.userService.userDetails.subscribe(user => {
      this.user$ = user;
    });
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  onPanelClick(id) {
    this.ethereumService.getWorkById(id)
      .subscribe(value => {
        this.contributors = new Array<{
          address: string,
          split: number
        }>();
        this.birthTime = parseInt(value[0]) * 1000;
        this.fingerprint = value[1];
        for (let i = 0; i < value[2].length; i++) {
          this.contributors.push({ address: this.web3service.convertToChecksumAddress(value[2][i]), split: parseInt(value[3][i]) })
        }
        this.approvedStatus = value[4];
      }, e => { console.error('Error getting work count; see log.') });
  }

  onApproveWorkButtonClick(account, id){
    this.ethereumService.approveWork(account, id)
    .subscribe(value => {
      if(value){
        this.workApprovedByUser = value;
        this.userService.pushApprovedWorkToUser(id);
      }
    }, e => { console.error('Error getting work count; see log.') });
  }

}