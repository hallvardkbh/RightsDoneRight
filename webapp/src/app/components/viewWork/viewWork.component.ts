import { Component, OnDestroy } from '@angular/core';
import { Web3Service, EthereumService } from './../../../blockchain-services/service';
import { Router } from '@angular/router';
import { Work } from './../../models/work';
import { ActivatedRoute } from "@angular/router";
import { DatePipe } from "@angular/common";
import { WorkService } from '../../firestore-services/work.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-view-work',
  templateUrl: './viewWork.component.html',
  styleUrls: ['./viewWork.component.css'],
  providers: [DatePipe]
})
export class ViewWorkComponent implements OnDestroy {

  firestoreSubscription: Subscription;
  blockchainSubscription: Subscription;
  spin: boolean;
  // TODO add proper types these variables
  firestoreWork$: Work;
  work: any;
  status: string;
  typeOfWork: string;
  fingerprint: string;
  birthTime: number;
  approvedStatus: boolean;
  contributors: Array<{
    address: string,
    split: number
  }>;

  constructor(private web3Service: Web3Service, private workService: WorkService, private ethereumService: EthereumService, private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params => this.getWorkById(parseInt(params['id'])));
    this.contributors = new Array<{ address: string, split: number }>();
  }

  ngOnDestroy() {
    this.firestoreSubscription.unsubscribe();
    this.blockchainSubscription.unsubscribe();
  }


  // onReady = () => {
  //   // Get the initial account number so it can be displayed.
  //   this.web3Service.getAccounts().subscribe(accs => {
  //     this.accounts = accs;
  //     this.account = this.accounts[0];
  //   }, err => alert(err))
  // };

  getWorkById = (id) => {
    this.getWorkFromBlockchainById(id);
    this.getWorkFromFirebaseById(id);
  }


  getWorkFromBlockchainById = (id) => {
    this.blockchainSubscription = this.ethereumService.getWorkById(id)
      .subscribe(value => {
        this.work = value;
        this.birthTime = parseInt(value[0]) * 1000;
        this.fingerprint = value[1];
        for (let i = 0; i < value[2].length; i++) {
          let address = this.web3Service.convertToChecksumAddress(value[2][i]);
          this.contributors.push({ address: address, split: parseInt(value[3][i]) })
        }
        this.approvedStatus = value[4];
        return this.work;
      }, e => { console.error('Error getting work count; see log.') })
  };

  getWorkFromFirebaseById = (id) => {
    this.spin = true;
    this.firestoreSubscription = this.workService.getWork(id).subscribe(value => {
      this.firestoreWork$ = value as Work;
      this.spin = false;
    });
  }

}
