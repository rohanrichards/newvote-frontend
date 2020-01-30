export interface IRep {
    _id?: string;
    displayName: string;
    position: string;
    description: string;
    organizations: any;
    proposals: Array<any>;
    issues: Array<any>;
    solutions: Array<any>;
    imageUrl: string;
    owner: any;
}

export class Rep implements IRep {
    public constructor(
        public _id: string = '',
        public displayName: string = '',
        public position: string = '',
        public description: string = '',
        public organizations: any = {},
        public proposals: Array<any> = [],
        public issues: Array<any> = [],
        public solutions: Array<any> = [],
        public imageUrl: string = '',
        public owner: any = {}
    ) {}
}
