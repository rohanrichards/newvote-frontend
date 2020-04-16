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
                path: 'topics', loadChildren: 'app/topic/topic.module#TopicModule'
            },
            {
                path: 'issues', loadChildren: 'app/issue/issue.module#IssueModule'
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
            }
        ]
    },
    { path: '', redirectTo: '/communities', pathMatch: 'full' },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: []
})
export class HomeRoutingModule { }
