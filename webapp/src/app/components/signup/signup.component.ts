import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { FormGroup, FormBuilder } from '@angular/forms';



@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  private state: string = '';
  private error: any;
  private email: string;
  private password: string;
  private createUserForm: FormGroup;
  private roles = ['licensee', 'right owner'];

  constructor(public auth: AuthService,private router: Router, private _fb: FormBuilder) {

  }

  onSubmit(formData) {
    if(formData.valid) {
      this.auth.emailSignUp(formData.value.email, formData.value.password, formData.value.role).then(
        (success) => {
        this.router.navigate(['/home'])
      }).catch(
        (err) => {
        console.log(err);
        this.error = err;
      })
    }
  }

  ngOnInit() {
    this.createUserForm = this._fb.group({
      email: '',
      password: '',
      role: ''
    });
  }

}
