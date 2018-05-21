import { Component, HostListener, NgZone } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Work } from './../../models/work';
import { Web3Service, EthereumService } from '../../../blockchain-services/service';
import { SearchService } from '../../firestore-services/search.service';
import { Subject } from 'rxjs';

declare var window: any;

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.css'],
  templateUrl: './home.component.html'
})
export class HomeComponent {

  // TODO add proper types these variables

  works;
  totalWorkNumber: number;
  status: string;
  lastKeypress: number = 0;


  constructor(
    private _ngZone: NgZone,
    private _ethereumService: EthereumService,
    private _searchService: SearchService
  ) {
    this.onReady();
  }

  startAt = new Subject()
  endAt = new Subject()


  ngOnInit() {
    // this._searchService.getWorks(this.startAt, this.endAt).valueChanges().subscribe(movies => {
    //   console.log(movies);
    //   this.works = movies
    // })
  }

  search($event) {
    if ($event.timeStamp - this.lastKeypress > 200) {
      let q = $event.target.value
      this.startAt.next(q)
      this.endAt.next(q+"\uf8ff")
    }
    this.lastKeypress = $event.timeStamp
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
        this.totalWorkNumber = value
      }, e => { this.setStatus('Error getting work count; see log.') })
  };

  setStatus = message => {
    this.status = message;
  };



}
