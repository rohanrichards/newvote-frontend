export interface IMedia {
	_id?: string;
	user?: any;
	created?: Date;
	url: string;
	title: string;
	description: string;
	imageOnly: boolean;
	image: string;
	issues?: Array<any>;
	votes?: any;
	organizations: Array<any>;
}

export class Media implements IMedia {
	public constructor(
		public url: string = '',
		public title: string = '',
		public description: string = '',
		public imageOnly: boolean = false,
		public image: string = '',
		public organizations: Array<any> = []
	) { }
}
