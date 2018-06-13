
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CreateWorkComponent } from './components/create-work/create-work.component';
import { ViewWorkComponent } from './components/view-work/view-work.component';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/pagenotfound/pagenotfound.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { SignupComponent } from './components/signup/signup.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminGuard } from './auth/admin.guard';
import { UserGuard } from './auth/user.guard';
import { RightOwnerGuard } from './auth/rightOwner.guard';
import { CreateLicenseComponent } from './components/create-license/create-license.component';


const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent},
  { path: 'signup', component: SignupComponent },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [UserGuard] },
  { path: 'createWork', component: CreateWorkComponent, canActivate: [RightOwnerGuard] },
  { path: 'work/:id', component: ViewWorkComponent },
  { path: 'createLicense/:workId', component: CreateLicenseComponent, canActivate: [RightOwnerGuard] },
  { path: '404', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
