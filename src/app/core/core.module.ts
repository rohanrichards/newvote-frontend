import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RouteReusableStrategy } from './route-reusable-strategy';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationGuard } from './authentication/authentication.guard';
import { AdminGuard } from './authentication/admin.guard';
import { ContentGuard } from './authentication/content.guard';
import { EndorserGuard } from './authentication/endorser.guard';
import { OrganizationService } from './http/organization/organization.service';
import { I18nService } from './i18n.service';
import { HttpService } from './http/http.service';
import { HttpCacheService } from './http/http-cache.service';
import { ApiPrefixInterceptor } from './http/api-prefix.interceptor';
import { ErrorHandlerInterceptor } from './http/error-handler.interceptor';
import { OganizationHeaderInterceptor } from './http/organization-header.interceptor';
import { CacheInterceptor } from './http/cache.interceptor';
import { JwtModule } from '@auth0/angular-jwt';

export function tokenGetter() {
	const savedCredentials = sessionStorage.getItem('credentials') || localStorage.getItem('credentials');
	if (savedCredentials) {
		const credentialsObject = JSON.parse(savedCredentials);
		return credentialsObject.token;
	} else {
		return null;
	}
}

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		TranslateModule,
		JwtModule.forRoot({
			config: {
				tokenGetter: tokenGetter
			}
		}),
		RouterModule
	],
	providers: [
		AuthenticationService,
		AuthenticationGuard,
		AdminGuard,
		ContentGuard,
		EndorserGuard,
		OrganizationService,
		I18nService,
		HttpCacheService,
		ApiPrefixInterceptor,
		ErrorHandlerInterceptor,
		CacheInterceptor,
		OganizationHeaderInterceptor,
		{
			provide: HttpClient,
			useClass: HttpService
		},
		{
			provide: RouteReuseStrategy,
			useClass: RouteReusableStrategy
		}
	]
})
export class CoreModule {

	constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
		// Import guard
		if (parentModule) {
			throw new Error(`${parentModule} has already been loaded. Import Core module in the AppModule only.`);
		}
	}

}
