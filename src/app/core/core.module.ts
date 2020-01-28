import { NgModule, Optional, SkipSelf } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient, HttpClientModule } from '@angular/common/http'
import { RouteReuseStrategy, RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { RouteReusableStrategy } from './route-reusable-strategy'
import { AuthenticationService } from './authentication/authentication.service'
import { SuggestionService } from '@app/core/http/suggestion/suggestion.service'
import { AuthenticationGuard } from './authentication/authentication.guard'
import { AdminGuard } from './authentication/admin.guard'
import { OwnerGuard } from './authentication/owner.guard'
import { ModeratorGuard } from './authentication/moderator.guard'
import { SuggestionCreatorGuard } from './authentication/suggestion-creator.guard'
import { ContentGuard } from './authentication/content.guard'
import { EndorserGuard } from './authentication/endorser.guard'
import { OrganizationService } from './http/organization/organization.service'
import { MetaService } from './meta.service'
import { I18nService } from './i18n.service'
import { HttpService } from './http/http.service'
import { HttpCacheService } from './http/http-cache.service'
import { ApiPrefixInterceptor } from './http/api-prefix.interceptor'
import { ErrorHandlerInterceptor } from './http/error-handler.interceptor'
import { OganizationHeaderInterceptor } from './http/organization-header.interceptor'
import { CacheInterceptor } from './http/cache.interceptor'
import { JwtModule } from '@auth0/angular-jwt'
import { VoteStore } from './http/vote/vote.store'
import { VotesQuery } from './http/vote/vote.query'
import { VoteService } from './http/vote/vote.service'
import { SuggestionStore } from './http/suggestion/suggestion.store'
import { SuggestionQuery } from './http/suggestion/suggestion.query'
import { IssueService } from './http/issue/issue.service'
import { IssueQuery } from './http/issue/issue.query'
import { IssueStore } from './http/issue/issue.store'
import { TopicQuery } from './http/topic/topic.query'
import { TopicStore } from './http/topic/topic.store'
import { TopicService } from './http/topic/topic.service'
import { SolutionQuery } from './http/solution/solution.query'
import { SolutionStore } from './http/solution/solution.state'
import { ProposalQuery } from './http/proposal/proposal.query'
import { ProposalStore } from './http/proposal/proposal.store'
import { MediaService } from './http/media/media.service'
import { AdminService } from './http/admin/admin.service'
import { OrganizationQuery, CommunityQuery } from './http/organization/organization.query'
import { OrganizationStore, CommunityStore } from './http/organization/organization.store'
import { MediaStore } from './http/media/media.store'
import { MediaQuery } from './http/media/media.query'
import { AuthenticationQuery } from './authentication/authentication.query'
import { AuthenticationStore } from './authentication/authentication.store'
import { RepQuery } from './http/rep/rep.query'
import { RepStore } from './http/rep/rep.store'

export function tokenGetter() {
    const savedCredentials = sessionStorage.getItem('credentials') || localStorage.getItem('credentials')
    if (savedCredentials) {
        const credentialsObject = JSON.parse(savedCredentials)
        return credentialsObject.token
    } else {
        return null
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
                whitelistedDomains: ['api.newvote.org', 'newvote-staging.herokuapp.com', 'api.staging.newvote.org']
            }
        }),
        RouterModule
    ],
    providers: [
        AuthenticationService,
        AuthenticationGuard,
        AuthenticationQuery,
        AuthenticationStore,
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
        SuggestionStore,
        SuggestionQuery,
        SuggestionService,
        IssueService,
        IssueQuery,
        IssueStore,
        TopicQuery,
        TopicStore,
        TopicService,
        SolutionQuery,
        SolutionStore,
        ProposalQuery,
        ProposalStore,
        MediaService,
        AdminService,
        OrganizationService,
        OrganizationQuery,
        OrganizationStore,
        CommunityQuery,
        CommunityStore,
        MediaStore,
        MediaQuery,
        RepQuery,
        RepStore,
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
            throw new Error(`${parentModule} has already been loaded. Import Core module in the AppModule only.`)
        }
    }

}
