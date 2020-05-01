import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ReactiveFormsModule } from '@angular/forms'
import { HttpClientModule, HttpClientJsonpModule, HttpClientXsrfModule } from '@angular/common/http'
import { ServiceWorkerModule } from '@angular/service-worker'
import { TranslateModule } from '@ngx-translate/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MaterialModule } from './material.module'
import { Angulartics2Module } from 'angulartics2'
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga'
import { SwiperModule } from 'ngx-swiper-wrapper'
import { SWIPER_CONFIG } from 'ngx-swiper-wrapper'
import { SwiperConfigInterface } from 'ngx-swiper-wrapper'

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 3,
    centeredSlides: false
}

import { Cloudinary } from 'cloudinary-core'
import { CloudinaryModule } from '@cloudinary/angular-5.x'
export const cloudinaryLib = {
    Cloudinary: Cloudinary
}

import { environment } from '@env/environment'
import { CoreModule, tokenGetter } from '@app/core'
import { SharedModule } from '@app/shared'
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component'
import { ShareModule } from '@ngx-share/core'
import { AngularFontAwesomeModule } from 'angular-font-awesome'
import { ShellModule } from './shell/shell.module'
import { AppComponent } from './app.component'
import { AppRoutingModule } from './app-routing.module'
import { LazyLoadImageModule } from 'ng-lazyload-image'
import { CookieService } from 'ngx-cookie-service'
import { JoyrideModule } from 'ngx-joyride'
import { LandingModule } from './landing/landing.module'
import { ScrollingModule } from '@angular/cdk/scrolling'
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools'
import { SocketIoModule } from 'ngx-socket-io'
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number'
import { NgxCaptchaModule } from 'ngx-captcha'
import { RepModalComponent } from './shared/rep-modal/rep-modal.component'
<<<<<<< HEAD
import { JwtModule } from '@auth0/angular-jwt'
=======
import { FeedModule } from './feed/feed.module'
import { MomentModule } from 'ngx-moment'
>>>>>>> staging

@NgModule({
    imports: [
        ScrollingModule,
        BrowserModule,
        ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production }),
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MaterialModule,
        CoreModule,
        SharedModule,
        ShellModule,
<<<<<<< HEAD
=======
        HomeModule,
        FeedModule,
>>>>>>> staging
        ShareModule,
        InternationalPhoneNumberModule,
        AngularFontAwesomeModule,
        HttpClientXsrfModule.withOptions({
            cookieName: 'XSRF-TOKEN',
            headerName: 'X-XSRF-TOKEN',
        }),
        Angulartics2Module.forRoot([Angulartics2GoogleAnalytics]),
        CloudinaryModule.forRoot(cloudinaryLib, { cloud_name: 'newvote', upload_preset: 'qhf7z3qa' }),
        SwiperModule,
        LazyLoadImageModule,
        JoyrideModule.forRoot(),
        LandingModule,
        NgxCaptchaModule,
        SocketIoModule.forRoot({
            url: environment.socketUrl,
            options: {
                transports: ['websocket']
            }
        }),
        JwtModule.forRoot({
            config: {
                tokenGetter: tokenGetter,
                whitelistedDomains: ['api.newvote.org', 'newvote-staging.herokuapp.com', 'api.staging.newvote.org']
            }
        }),
        environment.production ? [] : AkitaNgDevtools.forRoot(),
        MomentModule,
        AppRoutingModule,
    ],
    declarations: [
        AppComponent
    ],
    entryComponents: [
        ConfirmDialogComponent,
        RepModalComponent
    ],
    providers: [
        CookieService,
        {
            provide: SWIPER_CONFIG,
            useValue: DEFAULT_SWIPER_CONFIG
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
