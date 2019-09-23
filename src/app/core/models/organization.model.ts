export interface IOrganization {
	_id: string;
	name: string;
	organizationName?: string;
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
	newLeaderEmail?: string;
	softDeleted: boolean;
	authType: Number;
	authUrl: string;
	authEntityId: string;
	privateOrg: boolean;
}

export class Organization implements IOrganization {
	public constructor(
		public _id: string = '',
		public name: string = '',
		public organizationName: string = '',
		public description: string = '',
		public longDescription: string = '',
		public url: string = '',
		public owner: any = {},
		public moderators: any = [],
		public imageUrl: string = '',
		public iconUrl: string = '',
		public organizationUrl: string =  '',
		public futureOwner: any = {},
		public newLeaderEmail: string = '',
		public softDeleted: boolean = false,
		public authType: Number = 0,
		public authUrl: string = '',
		public authEntityId: string = '',
		public privateOrg: boolean = false
	) { }
}
