export interface ISuggestion {
	_id?: string;
	created?: Date;
	title: string;
	type: string;
	description: string;
	statements: string;
	media: string[];
	parentType?: string;
	parent?: any;
	votes?: any;
	user?: any;
	status: number;
	organizations: any;
	softDeleted: boolean;
}

export class Suggestion implements ISuggestion {
	public constructor(
		public _id: string = '',
		public title: string = '',
		public type: string = '',
		public description: string = '',
		public statements: string = '',
		public media: string[] = [],
		public status: number = 0,
		public organizations: any = {},
		public parent: any = {},
		public parentType: string = '',
		public softDeleted: boolean = false
	) { }
}
