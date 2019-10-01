import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { SuggestionState, SuggestionStore } from "./suggestion.store";
import { Suggestion } from "@app/core/models/suggestion.model";
import { AuthenticationQuery } from "@app/core/authentication/authentication.query";

@Injectable()
export class SuggestionQuery extends QueryEntity<SuggestionState, Suggestion> {
    suggestions$ = this.selectAll({
        filterBy: (entity) => {
            if (this.auth.isModerator()) {
                return true;
            }

            return !entity.softDeleted;
        }
    })

    constructor(
        protected store: SuggestionStore,
        private auth: AuthenticationQuery
    ) {
        super(store);
    }
}