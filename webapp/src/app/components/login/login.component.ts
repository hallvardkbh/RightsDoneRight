import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from '../../auth/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  error: any;

  constructor(public auth:AuthService, private router: Router) { 
    
    
  }

  onSubmit(formData) {
    if(formData.valid) {
      console.log(formData.value);
      this.auth.emailLogin(formData.value.email,formData.value.password).then(
        (success) => {
        this.router.navigate(['/createWork']);
      }).catch(
        (err) => {
        console.log(err);
        this.error = err;
      })
    }
  }

  ngOnInit() {
    if(this.auth.isLoggedIn){

    }
  }

}