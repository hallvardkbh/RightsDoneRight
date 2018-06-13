import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { AdminGuard } from './admin.guard';
import { UserGuard } from './user.guard';
import { RightOwnerGuard } from './rightOwner.guard';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [AuthService, AdminGuard, UserGuard, RightOwnerGuard]
})
export class AuthModule { }
