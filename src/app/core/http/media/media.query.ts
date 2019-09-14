import { QueryEntity } from "@datorama/akita";
import { MediaState, MediaStore } from "./media.store";

export class MediaQuery extends QueryEntity<MediaState> {
    constructor(protected store: MediaStore) {
        super(store);
    }
}