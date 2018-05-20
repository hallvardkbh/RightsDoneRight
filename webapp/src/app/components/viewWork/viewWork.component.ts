import { Component, OnDestroy } from '@angular/core';
import { Web3Service, EthereumService } from './../../../blockchain-services/service';
import { Router } from '@angular/router';
import { Work } from './../../models/work';
import { ActivatedRoute } from "@angular/router";
import { DatePipe } from "@angular/common";
import { WorkService } from '../../firestore-services/work.service';
import { Subscription } from 'rxjs';
import { LicenseProfile } from '../../models/licenseProfile';


@Component({
  selector: 'app-view-work',
  templateUrl: './viewWork.component.html',
  styleUrls: ['./viewWork.component.css'],
  providers: [DatePipe]
})
export class ViewWorkComponent implements OnDestroy {

  workId: number;
  licenseProfileList: [number];
  spin: boolean;

  firestoreSubscription: Subscription;
  blockchainSubscription: Subscription;

  firestoreWork: Work;
  blockchainWork: Work;

  firestoreLicenseProfile: LicenseProfile;
  blockchainLicenseProfile: LicenseProfile;

  status: string;
  approvedStatus: boolean;
  contributors: Array<{
    address: string,
    split: number
  }>;

  constructor(
    private web3Service: Web3Service,
    private ethereumService: EthereumService,
    private workService: WorkService,
    private router: Router,
    private route: ActivatedRoute) {


    this.firestoreWork = {} as Work;
    this.blockchainWork = {} as Work;

    this.firestoreLicenseProfile = {} as LicenseProfile;
    this.blockchainLicenseProfile = {} as LicenseProfile;



    this.route.params.subscribe(params => this.workId = parseInt(params['id']));

    this.getWorkFromWorkId(this.workId);
    this.getLicenseProfileIdsFromWorkId(this.workId);
  }

  ngOnDestroy() {
    this.firestoreSubscription.unsubscribe();
    this.blockchainSubscription.unsubscribe();
  }


  getWorkFromWorkId = (id) => {
    this.getWorkFromBlockchainById(id);
    this.getWorkFromFirebaseById(id);
  }

  getLicenseProfileIdsFromWorkId= (id) => {
    this.ethereumService.getLicenseProfileListFromWorkId(id)
    .subscribe(value => {

      
      console.log(value);

      // for(let i = 0; i < value[0].length; i++) {
      //   console.log(parseInt(value[0][i]))
      // }
      
      
      
        
      
      //console.log(this.licenseProfileList);
    }, e => { console.error('Error getting licenseprofileList; see log.') });
  }


  getWorkFromBlockchainById = (id) => {
    this.blockchainSubscription = this.ethereumService.getWorkById(id)
    .subscribe(value => {
      this.contributors = new Array<{
        address: string,
        split: number
      }>();
      this.blockchainWork.birthTime = parseInt(value[0]) * 1000;
      this.blockchainWork.fingerprint = value[1];
      this.blockchainWork.workId = id;
      for (let i = 0; i < value[2].length; i++) {
        this.contributors.push({ address: this.web3Service.convertToChecksumAddress(value[2][i]), split: parseInt(value[3][i]) })
      }
      this.blockchainWork.approvedStatus = value[4];
    }, e => { console.error('Error getting work; see log.') });
}

  getWorkFromFirebaseById = (id) => {
    this.spin = true;
    this.firestoreSubscription = this.workService.getWork(id).
    subscribe(value => {
      this.firestoreWork = value as Work;
      this.spin = false;
    });
  }

}
