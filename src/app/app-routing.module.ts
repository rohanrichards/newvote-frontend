import { NgModule } from '@angular/core'
import { Routes, RouterModule, PreloadAllModules } from '@angular/router'
import { Shell } from '@app/shell/shell.service'
import { Landing } from '@app/landing/landing.service'

const routes: Routes = [
    Shell.childRoutes([
        {
            path: '',
            loadChildren: () =>
                import('app/home/home.module').then((m) => m.HomeModule),
        },
        {
            path: 'auth',
            loadChildren: () =>
                import('app/auth/auth.module').then((m) => m.AuthModule),
        },
        {
            path: 'topics',
            loadChildren: () =>
                import('app/topic/topic.module').then((m) => m.TopicModule),
        },
        {
            path: 'issues',
            loadChildren: () =>
                import('app/issue/issue.module').then((m) => m.IssueModule),
        },
        {
            path: 'solutions',
            loadChildren: () =>
                import('app/solution/solution.module').then(
                    (m) => m.SolutionModule,
                ),
        },
        {
            path: 'suggestions',
            loadChildren: () =>
                import('app/suggestion/suggestion.module').then(
                    (m) => m.SuggestionModule,
                ),
        },
        {
            path: 'proposals',
            loadChildren: () =>
                import('app/proposal/proposal.module').then(
                    (m) => m.ProposalModule,
                ),
        },
        {
            path: 'media',
            loadChildren: () =>
                import('app/media/media.module').then((m) => m.MediaModule),
        },
        {
            path: 'communities',
            loadChildren: () =>
                import('app/organization/organization.module').then(
                    (m) => m.OrganizationModule,
                ),
        },
        {
            path: 'reps',
            loadChildren: () =>
                import('app/reps/reps.module').then((m) => m.RepsModule),
        },
        {
            path: 'profile',
            loadChildren: () =>
                import('app/profile/profile.module').then(
                    (m) => m.ProfileModule,
                ),
        },
        {
            path: 'onboarding',
            loadChildren: () =>
                import('app/onboarding/onboarding.module').then(
                    (m) => m.OnboardingModule,
                ),
        },
    ]),
    Landing.childRoutes([
        {
            path: 'landing',
            loadChildren: () =>
                import('app/communities/communities.module').then(
                    (m) => m.CommunitiesModule,
                ),
        },
    ]),

    // Fallback when no prior route is matched
    { path: '**', redirectTo: '', pathMatch: 'full' },
]

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            preloadingStrategy: PreloadAllModules,
            scrollPositionRestoration: 'enabled',
        }),
    ],
    exports: [RouterModule],
    providers: [],
})
export class AppRoutingModule {}
