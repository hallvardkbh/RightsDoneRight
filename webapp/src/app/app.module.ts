import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; 
import { MatGridListModule, MatIconModule, MatListModule, MatButtonModule, MatSliderModule, MatFormFieldModule, MatCardModule, MatSelectModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from "@angular/common";
import { AngularFontAwesomeModule } from 'angular-font-awesome';


import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component'
import { ViewWorkComponent } from './components/viewWork/viewWork.component';
import { CreateWorkComponent } from './components/createWork/createWork.component';
import { PageNotFoundComponent } from './components/pagenotfound/pagenotfound.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ProfileComponent } from './components/profile/profile.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';

import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AppRoutingModule } from './app-routing.module';
import { EthereumService, Web3Service } from '../blockchain-services/service';
import { AngularFireModule } from 'angularfire2';
import { AuthModule } from './auth/auth.module';
import { DropZoneDirective } from './directives/drop-zone.directive';
import { FileSizePipe } from './pipes/file-size.pipe';
import { CreateLicenseComponent } from './components/create-license/create-license.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';




export const firebaseConfig = {
    apiKey: "AIzaSyDgdy12Wka43u18mx7A-rp7ARP_Ns0jNvE",
    authDomain: "drm-chain.firebaseapp.com",
    databaseURL: "https://drm-chain.firebaseio.com",
    projectId: "drm-chain",
    storageBucket: "drm-chain.appspot.com",
    messagingSenderId: "905685641142"
};

const SERVICES = [
  EthereumService,
  Web3Service,
]


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    MatSliderModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatListModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatGridListModule,
    AuthModule,
    MatIconModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFontAwesomeModule,
    NgbModule.forRoot()
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    ViewWorkComponent,
    CreateWorkComponent,
    PageNotFoundComponent,
    SignupComponent,
    LoginComponent,
    ProfileComponent,
    DropZoneDirective,
    FileUploadComponent,
    FileSizePipe,
    CreateLicenseComponent,
    
  ],
  providers: [SERVICES, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }