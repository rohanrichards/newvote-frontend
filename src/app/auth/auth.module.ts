import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SharedModule } from '@app/shared';
import { MaterialModule } from '@app/material.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotComponent } from './forgot/forgot.component';
import { VerifyComponent } from './verify/verify.component';
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';
import { NgxCaptchaModule } from 'ngx-captcha';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslateModule,
        SharedModule,
        FlexLayoutModule,
        MaterialModule,
        AuthRoutingModule,
        InternationalPhoneNumberModule,
        NgxCaptchaModule
    ],
    declarations: [
        LoginComponent,
        SignupComponent,
        VerifyComponent,
        ForgotComponent
    ]
})
export class AuthModule { }
