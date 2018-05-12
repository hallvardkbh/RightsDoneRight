
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CreateWorkComponent } from './components/createWork/createWork.component';
import { ViewWorkComponent } from './components/viewWork/viewWork.component';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from "./components/pagenotfound/pagenotfound.component";
import { LoginComponent } from "./components/login/login.component";
import { SignupComponent } from "./components/signup/signup.component";
import { ProfileComponent } from "./components/profile/profile.component";
import { AdminGuard } from './auth/admin.guard';
import { UserGuard } from './auth/user.guard';
import { RightOwnerGuard } from './auth/rightOwner.guard';
import { CreateLicenseComponent } from './components/create-license/create-license.component';


const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
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