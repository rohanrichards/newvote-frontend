import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { Shell } from '@app/shell/shell.service'
import { FeedComponent } from './feed.component'

const routes: Routes = [
    Shell.childRoutes([
        {
            path: 'feed',
            component: FeedComponent,
            data: {
                level: 'root'
            }
        }
    ])
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FeedRoutingModule { }
