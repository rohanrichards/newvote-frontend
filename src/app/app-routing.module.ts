import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
	Shell.childRoutes([
		{ path: 'auth', loadChildren: 'app/auth/auth.module#AuthModule' },
		{ path: 'about', loadChildren: 'app/about/about.module#AboutModule' },
		{ path: 'topics', loadChildren: 'app/topic/topic.module#TopicModule' },
		{ path: 'issues', loadChildren: 'app/issue/issue.module#IssueModule' },
		{ path: 'solutions', loadChildren: 'app/solution/solution.module#SolutionModule' },
		{ path: 'proposals', loadChildren: 'app/proposal/proposal.module#ProposalModule' }
	]),
	// Fallback when no prior route is matched
	{ path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
	exports: [RouterModule],
	providers: []
})
export class AppRoutingModule { }
