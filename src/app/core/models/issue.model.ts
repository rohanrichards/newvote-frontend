export interface IIssue {
	_id?: string;
	name: string;
	imageUrl: string;
	description: string;
	user?: any;
	solutionMetaData?: any;
	topics?: Array<any>;
	created?: Date;
	organizations: any;
	softDeleted: boolean;
	mediaHeading?: string;
	suggestionTemplate?: string;
}

export class Issue implements IIssue {
	public constructor(
		public _id: string = '',
		public name: string = '',
		public imageUrl: string = '',
		public description: string = '',
		public organizations: any = {},
		public topics: Array<any> = [],
		public softDeleted: boolean = false
	) { }
}
