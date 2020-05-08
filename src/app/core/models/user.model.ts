interface IProvider {
    [key: string]: {
        edupersontargetedid: string;
        edupersonscipedaffiliation: string;
        edupersonprincipalname: string;
    };
}

export interface IUser {
    _id?: string;
    firstName: string;
    lastName: string;
    displayName: string;
    email: string;
    postalCode: string;
    username: string;
    mobileNumber: string;
    verified: boolean;
    profileImageURL: string;
    roles: string[];
    completedTour?: boolean;
    organizations: string[];
    providerData?: IProvider;
    pushSubscription?: {};
    subscriptions?: {};
}

export class User implements IUser {
    public constructor(
        public _id: string = '',
        public firstName: string = '',
        public lastName: string = '',
        public displayName: string = '',
        public email: string = '',
        public postalCode: string = '',
        public username: string = '',
        public mobileNumber: string = '',
        public verified: boolean = false,
        public profileImageURL: string = '',
        public roles: string[] = ['guest'],
        public completedTour: boolean = false,
        public organizations: any[] = []
    ) { }
}
