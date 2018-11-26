export interface IIssue {
	_id?: string;
	name: string;
	imageUrl: string;
	description: string;
	user?: any;
	topics?: Array<any>;
	created?: Date;
}

export class Issue implements IIssue {
	public constructor(public name: string = '', public imageUrl: string = '', public description: string = '') { }
}
