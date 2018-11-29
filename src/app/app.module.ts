import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
export const cloudinaryLib = {
	Cloudinary: Cloudinary
};

import { environment } from '@env/environment';
import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { ShareModule } from '@ngx-share/core';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { ChartsModule } from 'ng2-charts';
import { HomeModule } from './home/home.module';
import { ShellModule } from './shell/shell.module';
import { LoginModule } from './login/login.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
	imports: [
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
		HomeModule,
		LoginModule,
		ShareModule.forRoot(),
		AngularFontAwesomeModule,
		ChartsModule,
		Angulartics2Module.forRoot([Angulartics2GoogleAnalytics]),
		CloudinaryModule.forRoot(cloudinaryLib, { cloud_name: 'newvote', upload_preset: 'qhf7z3qa' }),
		AppRoutingModule // must be imported as the last module as it contains the fallback route
	],
	declarations: [
		AppComponent
	],
	entryComponents: [
		ConfirmDialogComponent
	],
	providers: [
		StatusBar,
		SplashScreen
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
