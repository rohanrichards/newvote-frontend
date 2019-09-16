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
	organizations: any;
	softDeleted: boolean;
	suggestionTemplate?: string;
}

export class Proposal implements IProposal {
	public constructor(
		public _id: string = '',
		public title: string = '',
		public imageUrl: string = '',
		public description: string = '',
		public likert: boolean = false,
		public organizations: any = {},
		public votes: any = {},
		public softDeleted: boolean = false,
		public solutions: any = []
	) { }
}
