import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { UserService } from '../../firestore-services/user.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {

  user: User;

  userRef: AngularFirestoreDocument<any>;

  constructor(
    private userService: UserService, 
     ) {
  }

  ngOnInit() {

    this.userService.getLoggedInUserDetails().subscribe(user =>{
      this.user = user;
      console.log(this.user)
    })
  }
}