import { Contributor } from "./contributor";

export interface Work {
  workId?: number;
  title: string;
  typeOfWork: string;
  description: string;
  contributors: Array<Contributor>;
  fingerprint: string;
  uploadedBy?: string;
  birthTime?: number;
  approvedStatus?: boolean;
}