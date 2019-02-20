export interface ISuggestion {
	_id?: string;
	created?: Date;
	title: string;
	description: string;
	statements: string;
	media: string;
	parentType?: string;
	parent?: any;
	votes?: any;
	user?: any;
	accepted: boolean;
	organizations: any;
}

export class Suggestion implements ISuggestion {
	public constructor(
		public _id: string = '',
		public title: string = '',
		public description: string = '',
		public statements: string = '',
		public media: string = '',
		public accepted: boolean = false,
		public organizations: any = {}
	) { }
}
