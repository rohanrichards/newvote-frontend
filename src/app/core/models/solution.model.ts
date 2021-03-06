export interface ISolution {
    _id?: string;
    title: string;
    imageUrl: string;
    description: string;
    likert: boolean;
    proposals: Array<any>;
    issues?: Array<any>;
    votes?: any;
    user?: any;
    created?: Date;
    organizations: any;
    softDeleted: boolean;
    suggestionTemplate?: string;
    slug: string;
}

export class Solution implements ISolution {
    public constructor(
        public _id: string = '',
        public title: string = '',
        public imageUrl: string = '',
        public description: string = '',
        public proposals: Array<any> = [],
        public likert: boolean = false,
        public organizations: any = {},
        public votes: any = {},
        public softDeleted: boolean = false,
        public issues: Array<any> = [],
        public slug: string = '',
    ) { }
}
