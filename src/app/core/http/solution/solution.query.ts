import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { SolutionState, SolutionStore } from "./solution.state";
import { Solution } from "@app/core/models/solution.model";

@Injectable()
export class SolutionQuery extends  QueryEntity<SolutionState, Solution> {
    constructor(protected store: SolutionStore) {
        super(store);
    }
}