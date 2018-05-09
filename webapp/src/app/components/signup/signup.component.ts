import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { User } from '../../models/user';



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
  private showArtistInputField = false;
  private selectedValue: string;
  private user: User;

  constructor(public auth: AuthService,private router: Router, private _fb: FormBuilder) {

  }

  onSubmit(formData) {
    if(formData.valid) {
      this.user = formData.value;
      this.auth.emailSignUp(this.user).then(
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
      role: '',
      ethereumAddress: '',
      firstName: '',
      lastName: '',
      artistName: '',
    });
  }

}
