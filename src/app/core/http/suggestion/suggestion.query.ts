import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { SuggestionState, SuggestionStore } from "./suggestion.store";
import { Suggestion } from "@app/core/models/suggestion.model";

@Injectable()
export class SuggestionQuery extends QueryEntity<SuggestionState, Suggestion> {
    constructor(protected store: SuggestionStore) {
        super(store);
    }
}