export interface IOrganization {
	_id?: string;
	prettyName: string;
	url: string;
	imageUrl: string;
	owner?: any;
	created?: Date;
}

export class Organization implements IOrganization {
	public constructor(
		public prettyName: string = '',
		public url: string = '',
		public imageUrl: string = '') { }
}
