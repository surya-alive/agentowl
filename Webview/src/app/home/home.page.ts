import { Component,ViewChild, ElementRef,ChangeDetectorRef  } from '@angular/core';
import { NavController, NavParams} from '@ionic/angular';
import { LocationService } from '../location.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
	@ViewChild('map') mapElement: ElementRef;
  	constructor() {}

  	ionViewDidLoad(){
		this.loadMap();
	}

  	loadMap(){
		let mapOptions = {
			mapTypeId: google.maps.MapTypeId.ROADMAP
	    }
	 	this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
	 	this.directionsRender = new google.maps.DirectionsRenderer( {'draggable':true});
		this.directionsService = new google.maps.DirectionsService();
		this.directionsRender.setMap(this.map);
		let self=this;

		this.directionsRender.addListener('directions_changed', function() {
          	self.computeTotalDistance(self.directionsRender.getDirections());
        });

	}

}
