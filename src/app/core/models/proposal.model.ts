export interface IProposal {
	_id?: string;
	title: string;
	imageUrl: string;
	description: string;
	likert: boolean;
	solutions?: Array<any>;
	votes?: any;
	user?: any;
	created?: Date;
	organizations: Array<any>;
}

export class Proposal implements IProposal {
	public constructor(
		public title: string = '',
		public imageUrl: string = '',
		public description: string = '',
		public likert: boolean = false,
		public organizations: Array<any> = []
	) { }
}
