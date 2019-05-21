export interface IOrganization {
	_id?: string;
	name: string;
	description: string;
	longDescription: string;
	url: string;
	imageUrl: string;
	iconUrl: string;
	owner?: any;
	moderators?: Array<any>;
	created?: Date;
	organizationUrl?: string;
	futureOwner?: string;
}

export class Organization implements IOrganization {
	public constructor(
		public _id: string = '',
		public name: string = '',
		public description: string = '',
		public longDescription: string = '',
		public url: string = '',
		public owner: any = {},
		public moderators: any = [],
		public imageUrl: string = '',
		public iconUrl: string = '',
		public organizationUrl: '',
		public futureOwner: ''
	) { }
}
