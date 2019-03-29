export interface IOrganization {
	_id?: string;
	name: string;
	description: string;
	url: string;
	imageUrl: string;
	iconUrl: string;
	owner?: any;
	moderators?: Array<any>;
	created?: Date;
}

export class Organization implements IOrganization {
	public constructor(
		public _id: string = '',
		public name: string = '',
		public description: string = '',
		public url: string = '',
		public owner: any = {},
		public moderators: any = [],
		public imageUrl: string = '',
		public iconUrl: string = ''
	) { }
}
