export class Work {

    constructor(
      public typeOfWork: string,
      public fingerprint: number,
      public address: Array<String>,
      public splits: Array<number>
    ) {  }
  
  }