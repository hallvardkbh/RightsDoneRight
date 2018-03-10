import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {MatIconModule, MatSliderModule, MatFormFieldModule, MatCardModule, MatSelectModule, MatInputModule} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AppComponent } from './app.component';
import { HomeComponent } from './home.component'
import { ViewComponent } from './view.component';
import { CreateComponent } from './create.component';
import { PageNotFoundComponent } from './pagenotfound.component';

import { AppRoutingModule } from './app-routing.module';

import {RightsService, Web3Service} from '../services/service';

const SERVICES = [
  RightsService,
  Web3Service,
]


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule,
    MatSliderModule,
    MatFormFieldModule,
    MatCardModule,
    MatSelectModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatIconModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    ViewComponent,
    CreateComponent,
    PageNotFoundComponent
    
  ],
  providers: [SERVICES],
  bootstrap: [AppComponent]
})
export class AppModule { }