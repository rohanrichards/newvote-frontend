export interface ISuggestion {
    _id?: string;
    created?: Date;
    title: string;
    type: string;
    description: string;
    media: string[];
    parentTitle?: string;
    parentType?: string;
    parent?: any;
    votes?: any;
    user?: any;
    status: number;
    organizations: any;
    softDeleted: boolean;
    slug: string;
}

export class Suggestion implements ISuggestion {
    public constructor(
        public _id: string = '',
        public title: string = '',
        public type: string = '',
        public description: string = '',
        public media: string[] = [],
        public status: number = 0,
        public organizations: any = {},
        public parent: any = {},
        public parentTitle: string = '',
        public parentType: string = '',
        public softDeleted: boolean = false,
        public slug: string = ''
    ) { }
}
