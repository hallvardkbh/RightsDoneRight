import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
import { tap, map, take } from 'rxjs/operators';

@Injectable()
export class RightOwnerGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {

    return this.auth.user$.pipe(
      take(1),
      map(user => user && user.role === 'right owner' || user.role === 'admin' ? true : false),
      tap(isRightOwner => {
        if (!isRightOwner) {
          console.error('Access denied - Right owners only');
          this.router.navigate(['/home']);
        }
      })
    );
  }
}
