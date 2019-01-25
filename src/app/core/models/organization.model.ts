export interface IOrganization {
	_id?: string;
	name: string;
	url: string;
	imageUrl: string;
	owner?: any;
	created?: Date;
}

export class Organization implements IOrganization {
	public constructor(
		public _id: string = '',
		public name: string = '',
		public url: string = '',
		public owner: any = {},
		public imageUrl: string = '') { }
}
