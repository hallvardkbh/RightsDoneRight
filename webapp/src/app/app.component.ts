import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html'
})
export class AppComponent {
  showCreateWorkButton: boolean;
  signedIn: boolean;
  showAdminWelcomeMessage: boolean;
  title = 'Rights Done Right';
  name = 'Menu';

  constructor(public auth: AuthService) {
    // tslint:disable-next-line:no-shadowed-variable
    this.auth.user$.subscribe(auth => {
      if (auth !== null) {
        this.name = auth.firstName + ' ' + auth.lastName;
        if (auth.role === 'admin') {
          this.isAdmin();
        } else if (auth.role === 'right owner') {
          this.isRightOwner();
        } else if (auth.role === 'licensee') {
          this.isLicensee();
        } else {
          this.showCreateWorkButton = false;
          this.showAdminWelcomeMessage = false;
          this.signedIn = false;
        }
      }
    });
  }

  private isAdmin(): void {
    this.showAdminWelcomeMessage = true;
    this.showCreateWorkButton = true;
    this.signedIn = true;
  }

  private isRightOwner(): void {
    this.showAdminWelcomeMessage = false;
    this.showCreateWorkButton = true;
    this.signedIn = true;
  }

  private isLicensee(): void {
    this.showAdminWelcomeMessage = false;
    this.showCreateWorkButton = false;
    this.signedIn = true;
  }

  logout() {
    this.signedIn = false;
    this.showAdminWelcomeMessage = false;
    this.showCreateWorkButton = false;
  }

}
