import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  // set the source of the base address for module-relative URLs such as the templateUrl
  // the HTML tag that the template will be inserted into
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html'
})
export class AppComponent {
  showLogoutButton: boolean;
  title = 'Blockchain for copyrights';

  constructor(public af: AngularFireAuth){
    this.af.authState.subscribe(auth => {
      if(auth) {
        this.showLogoutButton = true;
      } else {
        this.showLogoutButton = false;
      }
    });
  }

  logout() {
    this.af.auth.signOut();
    console.log('logged out');
  }

}