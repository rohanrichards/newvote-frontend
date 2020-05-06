
export interface INotification {
    _id?: string;
    created_at?: string;
    parent: any;
    parentType: string;
    imageUrl: string;
    user: any;
    rep?: any;
    description: string;
    organizations: any;
    softDeleted: boolean;
    position: string;
}

export class Notification implements INotification {
    public constructor(
        public _id: string = '',
        public parent: string = '',
        public parentType: string = '',
        public imageUrl: string = '',
        public description: string = '',
        public organizations: any = {},
        public user: any = {},
        public softDeleted: boolean = false,
        public rep: any = {},
        public position: string = ''
    ) { }
}
