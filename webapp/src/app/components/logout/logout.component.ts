import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  template: ''
})
export class LogoutComponent implements OnInit {

  constructor(private _authService: AuthService, private router: Router) {}

  ngOnInit() {
    this._authService.signOut();
    this.router.navigate(['/login']);
  }

}
