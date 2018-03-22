import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  postRef;
  post$;
  user;

  constructor(private afs: AngularFirestore, public auth: AuthService) { 
   this.auth.user$.subscribe(user => this.user = user)
  }

  ngOnInit() {
    this.postRef = this.afs.doc('posts/myTestPost')
    this.post$ = this.postRef.valueChanges()
  }

  editPost() {
    this.postRef.update({ title: 'Edited Title!'})
  }


  deletePost() {
    this.postRef.delete()
  }


}