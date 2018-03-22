export interface Roles { 
    licensee?: boolean;
    rightOwner?: boolean;
    admin?: boolean;
 }
  
export interface User {
    uid: string;
    email: string;
    ethereumAddress?: string,
    artistName?: string,
    countryOfResidence?: string,
    firstName?: string,
    lastName?: string,
    roles: Roles;
}