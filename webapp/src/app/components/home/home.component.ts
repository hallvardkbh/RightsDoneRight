import { Component, HostListener, NgZone } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Work } from './../../models/work';
import { Web3Service, EthereumService } from '../../blockchain-services/service';
import { SearchService } from '../../firestore-services/search.service';
import { Subject, Observable, combineLatest } from 'rxjs';
import { AngularFirestore } from 'angularfire2/firestore';

declare var window: any;

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html'
})
export class HomeComponent {

  // TODO add proper types these variables

  totalWorkNumberBlockchain: number;
  status: string;


  constructor(
    private _ngZone: NgZone,
    private _ethereumService: EthereumService,
    private _searchService: SearchService,
  ) {
    this.onReady();
  }

  works;
  lastKeypress: number = 0;


  ngOnInit() {
  }

  search($event) {
    
      let q = $event.target.value
      let start = q
      let end = q + '\uf8ff';
      this._searchService.getWorks(start, end).valueChanges().subscribe((res) => {
        this.works = res;
      })

  }

  //Number of works on Blockchain

  onReady = () => {
    this._ngZone.run(() =>
      this.refreshWorkCount()
    );
  };

  refreshWorkCount = () => {
    this._ethereumService.getLengthOfWorkDataBase()
      .subscribe(value => {
        this.totalWorkNumberBlockchain = value
      }, e => { this.setStatus('Error getting work count; see log.') })
  };

  setStatus = message => {
    this.status = message;
  };



}
