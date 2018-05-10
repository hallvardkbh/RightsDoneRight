import { Component, OnInit } from '@angular/core';
import { Web3Service, EthereumService } from './../../../blockchain-services/service';
import { Router } from '@angular/router';
import { Work } from './../../models/work';
import { ActivatedRoute } from "@angular/router";
import { DatePipe } from "@angular/common";


@Component({
  selector: 'app-view-work',
  templateUrl: './viewWork.component.html',
  styleUrls: ['./viewWork.component.css'],
  providers: [DatePipe]
})
export class ViewWorkComponent implements OnInit {

  // TODO add proper types these variables
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

  constructor(private web3Service: Web3Service, private ethereumService: EthereumService, private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params => this.getWorkById(parseInt(params['id'])));
    this.contributors = [];
  }

  ngOnInit() {

  }


  // onReady = () => {
  //   // Get the initial account number so it can be displayed.
  //   this.web3Service.getAccounts().subscribe(accs => {
  //     this.accounts = accs;
  //     this.account = this.accounts[0];
  //   }, err => alert(err))
  // };



  getWorkById = (id) => {
    this.ethereumService.getWorkById(id)
      .subscribe(value => {
        this.work = value;
        this.birthTime = parseInt(value[0]) * 1000;
        this.fingerprint = value[1];
        for (let i = 0; i < value[2].length; i++) {
          this.contributors.push({address: value[2][i], split: parseInt(value[3][i])})
        }
        this.approvedStatus = value[4];
        console.log(this.work);
        return this.work;
      }, e => { console.error('Error getting work count; see log.') })
  };

}
