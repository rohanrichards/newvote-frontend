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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { environment } from '@env/environment'
import { CoreModule } from '@app/core'
import { SharedModule } from '@app/shared'
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component'
import { ShareModule } from '@ngx-share/core'
import { HomeModule } from './home/home.module'
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
import { MomentModule } from 'ngx-moment';
import { ProfileModule } from './profile/profile.module';
import { NotificationPopupDialog } from './shared/notification-bell/notification-bell.component'

@NgModule({
    imports: [
        ScrollingModule,
        BrowserModule,
        ServiceWorkerModule.register('./my-worker.js', { enabled: environment.production, registrationStrategy: 'registerImmediately' }),
        FormsModule,
        FontAwesomeModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MaterialModule,
        CoreModule,
        SharedModule,
        ShellModule,
        HomeModule,
        ShareModule,
        InternationalPhoneNumberModule,
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
        environment.production ? [] : AkitaNgDevtools.forRoot(),
        MomentModule,
        AppRoutingModule,
        ProfileModule,
    ],
    declarations: [
        AppComponent
    ],
    entryComponents: [
        ConfirmDialogComponent,
        RepModalComponent,
        NotificationPopupDialog
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
