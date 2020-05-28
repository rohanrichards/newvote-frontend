import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AdminService } from '@app/core/http/admin/admin.service';
import { AuthenticationService } from '@app/core';
import { ISuggestion } from '@app/core/models/suggestion.model';
import { RepQuery } from '@app/core/http/rep/rep.query';
import { AuthenticationQuery } from '@app/core/authentication/authentication.query';

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
    @Output() toggleEdit = new EventEmitter()
    constructor(
        public admin: AdminService,
        public auth: AuthenticationService,
        public repQuery: RepQuery,
        public authQuery: AuthenticationQuery
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

    toggleNotificationEdit(notification: Notification) {
        this.toggleEdit.emit(notification)
    }
}
