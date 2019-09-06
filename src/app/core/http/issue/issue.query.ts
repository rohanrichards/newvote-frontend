import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { IssueState, IssueStore } from "./issue.store";
import { Issue } from "@app/core/models/issue.model";

@Injectable()
export class IssueQuery extends QueryEntity<IssueState, Issue> {
    constructor(protected store: IssueStore) {
        super(store);
    }
}