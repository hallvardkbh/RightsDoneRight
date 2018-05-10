import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { UserService } from '../../firestore-services/user.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {


  userRef: AngularFirestoreDocument<any>;

  uid: string;
  mail: string;
  ethereumAddress: string;
  firstName: string;
  lastName: string;
  userRole: string;
  nonapprovedWorks: number[];
  approvedWork: number[];




  constructor(
    private userService: UserService, 
     ) {
  }

  ngOnInit() {

    this.userService.getUser().subscribe(user =>{
      this.uid = user.uid;
      this.mail = user.email;
      this.ethereumAddress = user.ethereumAddress;
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.userRole = user.role;
      this.nonapprovedWorks = user.nonApprovedWorks;
      this.approvedWork = user.approvedWorks;
    })

    // this.userRef = this.afs.doc(`users/${this.uid}`);
  }
}