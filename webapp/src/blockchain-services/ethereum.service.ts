import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { Web3Service } from './web3.service'

//const workbaseArtifacts = require('../../../build/contracts/WorkBase.json');
const licensePurchase = require('../../../build/contracts/LicensePurchase.json');
const contract = require('truffle-contract');

@Injectable()
export class EthereumService {

    LicensePurchase = contract(licensePurchase);

    constructor(
        private web3Ser: Web3Service,
    ) {
        // Bootstrap the contracts
        this.LicensePurchase.setProvider(web3Ser.web3.currentProvider);
    }

    // PART: Workbase
    createWork(account, fingerprint, contributors, splits): Observable<any> {
        //let meta;
        return Observable.create(observer => {
            this.LicensePurchase.deployed()
                .then(instance => {
                    //meta = instance;
                    return instance.createWork(fingerprint, contributors, splits, { from: account, gas: 6400000 });
                })
                .then(value => {
                    observer.next(value)
                    observer.complete()
                })
                .catch(e => {
                    console.log(e);
                    observer.error(e)
                });
        })
    }

    getLengthOfWorkDataBase(): Observable<number> {
        //let meta;
        return Observable.create(observer => {
            this.LicensePurchase.deployed()
                .then(instance => {
                    //meta = instance;
                    //console.log(meta.getLengthOfWorkDataBase.call({from: account}));
                    return instance._getWorkDbLength.call();
                })
                .then(value => {
                    observer.next(value)
                    observer.complete()
                })
                .catch(e => {
                    console.log(e);
                    observer.error(e)
                });
        })
    }

    getWorkListWithTokenCountFromAddress(account, contributor): Observable<any> {
        let meta;
        return Observable.create(observer => {
            this.LicensePurchase.deployed()
                .then(instance => {
                    meta = instance;
                    return meta.getWorkListWithTokenCountFromAddress.call(contributor, { from: account, gas: 6400000 });
                })
                .then(value => {
                    observer.next(value)
                    observer.complete()
                })
                .catch(e => {
                    console.log(e);
                    observer.error(e)
                });
        })
    }

    getWorkById(workId): Observable<any> {
        let meta;
        return Observable.create(observer => {
            this.LicensePurchase.deployed()
                .then(instance => {
                    meta = instance;
                    return meta.getWorkById.call(workId);
                })
                .then(value => {
                    observer.next(value)
                    observer.complete()
                })
                .catch(e => {
                    console.log(e);
                    observer.error(e)
                });
        })
    }


    //LicenseBase PART
    createLicenseProfile(workId, price, fingerprint, account): Observable<any> {
        //let meta;
        return Observable.create(observer => {
            this.LicensePurchase.deployed()
                .then(instance => {
                    //meta = instance;
                    return instance.createLicenseProfile(workId, price, fingerprint, { from: account, gas: 6400000 });
                })
                .then(value => {
                    observer.next(value)
                    observer.complete()
                })
                .catch(e => {
                    console.log(e);
                    observer.error(e)
                });
        })
    }
}