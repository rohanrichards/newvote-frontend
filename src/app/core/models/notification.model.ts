
export interface INotification {
    _id?: string;
    createdAt: string;
    parent: any;
    parentType: string;
    imageUrl: string;
    user: any;
    description: string;
    organizations: any;
}

export class Notification implements INotification {
    public constructor(
        public _id: string = '',
        public createdAt: string = '',
        public parent: string = '',
        public parentType: string = '',
        public imageUrl: string = '',
        public description: string = '',
        public organizations: any = {},
        public user: any = {}
    ) { }
}
