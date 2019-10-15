export interface IVote {
	_id?: string; // objectId
	user?: string; // objectId
	organizationId?: string; // objectId
	object: string; // objectId
	objectType: string;
	voteValue: number;
	created?: Date;
}

export class Vote implements IVote {
    public constructor(
		public object: string = '',
		public objectType: string = '',
		public voteValue: number = 0,
		public organizationId: string = ''
    ) { }
}
