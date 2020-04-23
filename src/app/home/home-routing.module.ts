import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { extract } from '@app/core'
import { HomeComponent } from './home.component'

const routes: Routes = [
    {
        path: ':id',
        children: [
            {
                path: '',
                component: HomeComponent,
                data: {
                    title: extract('NewVote')
                }
            },
            {
                path: 'home',
                component: HomeComponent,
            },
            {
                path: 'topics', loadChildren: 'app/topic/topic.module#TopicModule'
            },
            {
                path: 'issues', loadChildren: 'app/issue/issue.module#IssueModule'
            },
            {
                path: 'proposals', loadChildren: 'app/proposal/proposal.module#ProposalModule'
            },
            {
                path: 'solutions', loadChildren: 'app/solution/solution.module#SolutionModule'
            },
            {
                path: 'suggestions', loadChildren: 'app/suggestion/suggestion.module#SuggestionModule'
            },
            {
                path: 'media', loadChildren: 'app/media/media.module#MediaModule'
            },
            {
                path: 'reps', loadChildren: 'app/reps/reps.module#RepsModule'
            },
            { path: 'auth', loadChildren: 'app/auth/auth.module#AuthModule' },
        ]
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: []
})
export class HomeRoutingModule { }
