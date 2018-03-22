import { Component, HostListener, NgZone } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Work } from './../../models/work';
import { Web3Service, EthereumService} from '../../../blockchain-services/service';

declare var window: any;

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.css'],
  templateUrl: './home.component.html'
})
export class HomeComponent {

  // TODO add proper types these variables
  account: any;
  accounts: any;
  work: any;
  totalWorkNumber: number;
  status: string;
  workId: number;
  contributorsWork: any;
  constantContributor: string;

  constructor(
    private _ngZone: NgZone,
    private web3Service: Web3Service,
    private ethereumService: EthereumService,
    ) {
    this.onReady();
    this.contributorsWork = [];
    // this.constantContributor = "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef";
    this.workId = 5;
  }

  onReady = () => {

    // Get the initial account balance so it can be displayed.
    this.web3Service.getAccounts().subscribe(accs => {
      this.accounts = accs;
      this.account = this.accounts[0];

      // This is run from window:load and ZoneJS is not aware of it we
      // need to use _ngZone.run() so that the UI updates on promise resolution
      this._ngZone.run(() =>
        this.refreshWorkCount()
      );
    }, err => alert(err))
  };

  refreshWorkCount = () => {
    this.ethereumService.getLengthOfWorkDataBase()
      .subscribe(value => {
        this.totalWorkNumber = value
      }, e => {this.setStatus('Error getting work count; see log.')})
  };

  setStatus = message => {
    this.status = message;
  };

  // getWorkListWithTokenCountFromAddress = () => {
  //   this.setStatus('Presenting related work... (please wait)');
  //   this.ethereumService.getWorkListWithTokenCountFromAddress(this.account, this.constantContributor)
  //     .subscribe(value =>{
  //       this.translateValue(value);
  //       // this.refreshWorkCount();
  //     }, e => this.setStatus('Error presenting work; see log.'))
  // };

  getWorkById = () => {
    this.ethereumService.getWorkById(this.workId)
      .subscribe(value => {
        this.work = value
      }, e => {this.setStatus('Error getting work count; see log.')})
  };

  translateValue(_rawData): void {
    let localData;
    localData = _rawData;
    let translatedArray = [];
    localData.forEach(element => {
        let innerArray = [];
        let henry = 0;
        element.forEach(element => {
            innerArray.push(element.c[0]);
        });
        translatedArray.push(innerArray);
    });
    this.contributorsWork = translatedArray;
  }

}
