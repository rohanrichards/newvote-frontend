export interface IProgress {
    _id?: string;
    parent: any;
    parentType: string;
    organizations: any;
    state: any;
}

export class Progress implements IProgress {
    public constructor(
        public organizations: any = {},
        public parent: string = '',
        public parentType: any = '',
        public state: any = {}
    ) { }
}
