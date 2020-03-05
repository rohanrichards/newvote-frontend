export interface ITopic {
    _id?: string;
    name: string;
    imageUrl: string;
    description: string;
    user?: any;
    created?: Date;
    organizations: any;
    slug: string;
    issues: Array<any>;
}

export class Topic implements ITopic {
    public constructor(
        public _id: string = '',
        public name: string = '',
        public imageUrl: string = '',
        public description: string = '',
        public organizations: any = {},
        public slug: string = '',
        public issues: Array<any> = []
    ) { }
}
