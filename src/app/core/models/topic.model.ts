export interface ITopic {
	name: string;
	imageUrl: string;
	description: string;
}

export class Topic implements ITopic {
	public constructor(public name: string = '', public imageUrl: string = '', public description: string = '') { }
}
