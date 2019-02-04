export interface ISolution {
	_id?: string;
	title: string;
	imageUrl: string;
	description: string;
	likert: boolean;
	issues?: Array<any>;
	votes?: any;
	user?: any;
	created?: Date;
	organizations: any;
}

export class Solution implements ISolution {
	public constructor(
		public _id: string = '',
		public title: string = '',
		public imageUrl: string = '',
		public description: string = '',
		public likert: boolean = false,
		public organizations: any = {},
		public votes: any = {}
	) { }
}
