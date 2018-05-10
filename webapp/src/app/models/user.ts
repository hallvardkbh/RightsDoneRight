
  
export interface User {
    uid?: string;
    email?: string;
    ethereumAddress?: string,
    artistName?: string,
    firstName?: string,
    lastName?: string,
    role?: string;
    nonApprovedWorks?: number[];
    approvedWorks?: number[];
}