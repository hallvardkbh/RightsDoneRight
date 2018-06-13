import { Component, HostListener, NgZone } from '@angular/core';
import { EthereumService } from '../../blockchain-services/service';
import { WorkService } from '../../firestore-services/work.service';

declare var window: any;

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html'
})
export class HomeComponent {

  totalWorkNumberBlockchain: number;
  status: string;


  constructor(
    private _ngZone: NgZone,
    private _ethereumService: EthereumService,
    private _fireWorkService: WorkService,
  ) {
    this.onReady();
  }

  works;
  lastKeypress = 0;

  search($event) {

    const q = $event.target.value;
    const start = q;
    const end = q + '\uf8ff';
    this._fireWorkService.getWorks(start, end).valueChanges().subscribe((res) => {
      this.works = res;
    });

  }

  // Number of works on Blockchain

  onReady = () => {
    this._ngZone.run(() =>
      this.refreshWorkCount()
    );
  }

  refreshWorkCount = () => {
    this._ethereumService.getLengthOfWorkDataBase()
      .subscribe(value => {
        this.totalWorkNumberBlockchain = value;
      }, e => { this.setStatus('Error getting work count; see log.'); });
  }

  setStatus = message => {
    this.status = message;
  }

}
