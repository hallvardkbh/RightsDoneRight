import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';

import { environment } from '../../environments/environment';

const Web3 = require('web3');

declare var window: any;

@Injectable()
export class Web3Service {

  public web3: any;

  constructor() {
    this.checkAndInstantiateWeb3();
  }

  checkAndInstantiateWeb3 = () => {
    // Checking if Web3 has been injected by the browser
    if (typeof window.web3 !== 'undefined') {
      // MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.warn(
        'No web3 detected'
      );
      // fallback - use your fallback strategy (local node / hosted node)
      this.web3 = new Web3(
        new Web3.providers.HttpProvider(environment.HttpProvider)
      );
    }
  }

  convertToChecksumAddress(address): string {
    return this.web3.utils.toChecksumAddress(address);
  }

  getAccounts(): Observable<any> {
    return Observable.create(observer => {
      this.web3.eth.getAccounts((err, accs) => {
        if (err != null) {
          observer.error('There was an error fetching your accounts.');
        }

        if (accs.length === 0) {
          observer.error('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        }
        observer.next(accs);
        observer.complete();
      });
    });
  }
}
