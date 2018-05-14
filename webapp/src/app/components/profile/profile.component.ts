import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { UserService } from '../../firestore-services/user.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user';
import { EthereumService } from '../../../blockchain-services/service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {

  workApprovedByUser: boolean;
  firstName: string;
  email: string;
  user: User;

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
    private ethereumService: EthereumService
  ) {
    this.workApprovedByUser = false;
  }

  ngOnInit() {
    this.userService.getLoggedInUserDetails().subscribe(user => {
      this.user = user;
    });
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
          this.contributors.push({ address: value[2][i], split: parseInt(value[3][i]) })
        }
        this.approvedStatus = value[4];
      }, e => { console.error('Error getting work count; see log.') });
  }

  onApproveWorkButtonClick(account, id){
    this.ethereumService.approveWork(account, id)
    .subscribe(value => {
      console.log(value);
      this.workApprovedByUser = value;
    }, e => { console.error('Error getting work count; see log.') });
  }

}