export interface IFeed {
    _id?: string;
    created?: Date;
    organizations: any;
    parent: string;
    parentType: string;
    news: Array<any>;
}

export class Feed implements IFeed {
    public constructor(
        public _id: string = '',
        public organizations: any = {},
        public parent: string = '',
        public parentType: string = '',
        public news: Array<any> = []
    ) { }
}
