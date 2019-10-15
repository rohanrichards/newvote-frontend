import { QueryEntity } from '@datorama/akita'
import { MediaState, MediaStore } from './media.store'
import { Issue } from '@app/core/models/issue.model'
import { Media } from '@app/core/models/media.model'

export class MediaQuery extends QueryEntity<MediaState> {
    constructor(protected store: MediaStore) {
        super(store)
    }

    selectIssueMedia(id: string) {
        return this.selectAll({
            filterBy: (media: Media) => {
                const { issues } = media

                return issues.some((issue: Issue) => {
                    if (typeof issue === 'string') {
                        return issue === id
                    }

                    return issue._id === id
                })
            }
        })
    }
}
