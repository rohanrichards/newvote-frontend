import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AdminService } from '@app/core/http/admin/admin.service';
import { AuthenticationService } from '@app/core';
import { ISuggestion } from '@app/core/models/suggestion.model';
import { RepQuery } from '@app/core/http/rep/rep.query';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-admin-panel',
    templateUrl: './admin-panel.component.html',
    styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
    @Input() isCard = false
    @Input() path: string;
    @Input() model: string;
    @Input() item: any;
    @Input() redirectRoute: string;

    @Output() updateSuggestion = new EventEmitter()

    constructor(
        public admin: AdminService,
        public auth: AuthenticationService,
        public repQuery: RepQuery,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
    }

    handleSuggestionUpdate(item: ISuggestion, status: number) {
        const object = {
            suggestion: item,
            status
        }
        this.updateSuggestion.emit(object)
    }

    handleUrl(item: any) {
        if (this.model !== 'Organization') {
            const link = this.path ? [this.path, 'edit', `${item.slug || item._id}`]
                : ['edit', `${item.slug || item._id}`]
            const options = { relativeTo: this.route } 
            return this.router.navigate(link, options)
        }
  
        return this.router.navigate([`/communities/${item.slug || item._id}`])
    }
}
