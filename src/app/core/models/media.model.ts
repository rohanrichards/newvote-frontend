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
	organizations: any;
	softDeleted: boolean;
}

export class Media implements IMedia {
    public constructor(
		public _id: string = '',
		public url: string = '',
		public title: string = '',
		public description: string = '',
		public imageOnly: boolean = false,
		public image: string = '',
		public organizations: any = {},
		public softDeleted: boolean = false,
		public issues: Array<any> = []
    ) { }
}
