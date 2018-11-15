import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

import { environment } from '@env/environment';
import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
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
		HttpClientModule,
		TranslateModule.forRoot(),
		BrowserAnimationsModule,
		MaterialModule,
		CoreModule,
		SharedModule,
		ShellModule,
		HomeModule,
		LoginModule,
		Angulartics2Module.forRoot([Angulartics2GoogleAnalytics]),
		AppRoutingModule // must be imported as the last module as it contains the fallback route
	],
	declarations: [AppComponent],
	providers: [
		StatusBar,
		SplashScreen
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
