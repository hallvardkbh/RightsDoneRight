
  
export interface User {
    uid?: string;
    email?: string;
    ethereumAddress?: string,
    aliasName?: string,
    firstName?: string,
    lastName?: string,
    role?: string;
    
    unapprovedWorks?: number[];
    approvedWorks?: number[];

    nonApprovedLicenseProfiles?: number[];
    approvedLicenseProfiles?: number[];

}