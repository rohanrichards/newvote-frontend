import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationGuard } from '@app/core/authentication/authentication.guard';
import { OwnerGuard } from '@app/core/authentication/owner.guard';
import { SuggestionCreatorGuard } from '@app/core/authentication/suggestion-creator.guard';

import { extract } from '@app/core';
import { SuggestionListComponent } from './list/suggestion-list.component';
import { SuggestionViewComponent } from './view/suggestion-view.component';
import { SuggestionCreateComponent } from './create/suggestion-create.component';
import { SuggestionEditComponent } from './edit/suggestion-edit.component';

const routes: Routes = [
    {
        path: '',
        component: SuggestionListComponent,
        data: { title: extract('All Suggestions'), level: 'root' } // anyone can list
    },
    {
        path: 'create',
        component: SuggestionCreateComponent,
        data: { title: extract('New Suggestion'), level: 'child' },
        canActivate: [AuthenticationGuard] // any authenticated users can create
    },
    {
        path: 'create/:model/:id',
        component: SuggestionCreateComponent,
        data: { title: extract('New Suggestion'), level: 'child' },
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'edit/:id',
        component: SuggestionEditComponent,
        data: { title: extract('Edit Suggestion'), level: 'child' },
        canActivate: [SuggestionCreatorGuard]  // only the owner of the suggestion or the org can edit
    },
    {
        path: ':id',
        component: SuggestionViewComponent,
        data: { title: extract('Suggestion'), level: 'child' },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: []
})
export class SuggestionRoutingModule { }
