import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RouteReusableStrategy } from './route-reusable-strategy';
import { AuthenticationService } from './authentication/authentication.service';
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service';
import { AuthenticationGuard } from './authentication/authentication.guard';
import { AdminGuard } from './authentication/admin.guard';
import { OwnerGuard } from './authentication/owner.guard';
import { ModeratorGuard } from './authentication/moderator.guard';
import { SuggestionCreatorGuard } from './authentication/suggestion-creator.guard';
import { ContentGuard } from './authentication/content.guard';
import { EndorserGuard } from './authentication/endorser.guard';
import { OrganizationService } from './http/organization/organization.service';
import { MetaService } from './meta.service';
import { I18nService } from './i18n.service';
import { HttpService } from './http/http.service';
import { HttpCacheService } from './http/http-cache.service';
import { ApiPrefixInterceptor } from './http/api-prefix.interceptor';
import { ErrorHandlerInterceptor } from './http/error-handler.interceptor';
import { OganizationHeaderInterceptor } from './http/organization-header.interceptor';
import { CacheInterceptor } from './http/cache.interceptor';
import { JwtModule } from '@auth0/angular-jwt';
import { VoteStore } from './http/vote/vote.store';
import { VotesQuery } from './http/vote/vote.query';
import { VoteService } from './http/vote/vote.service';

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
				tokenGetter: tokenGetter,
				whitelistedDomains: ['api.newvote.org', 'newvote-staging.herokuapp.com']
			}
		}),
		RouterModule
	],
	providers: [
		AuthenticationService,
		SuggestionService,
		AuthenticationGuard,
		AdminGuard,
		OwnerGuard,
		ModeratorGuard,
		ContentGuard,
		EndorserGuard,
		SuggestionCreatorGuard,
		OrganizationService,
		MetaService,
		I18nService,
		HttpCacheService,
		ApiPrefixInterceptor,
		ErrorHandlerInterceptor,
		CacheInterceptor,
		OganizationHeaderInterceptor,
		VoteStore,
		VotesQuery,
		VoteService,
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
