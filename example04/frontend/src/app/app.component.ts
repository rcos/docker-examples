import { Component, OnInit } from '@angular/core';
import { APIService } from './services/api-base.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    APIService
  ]
})
export class AppComponent implements OnInit {
  constructor(private api : APIService) {}

  people : Object[];

  ngOnInit () {
    this.api.get('')
      .then(people => {
        this.people = people;
      });
  }
}
