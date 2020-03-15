import { Component,ViewChild,ChangeDetectorRef,ElementRef  } from '@angular/core';
import { NavController, NavParams} from '@ionic/angular';
import { LocationService } from '../location.service';
import {} from "googlemaps";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
	@ViewChild('map',{static: false}) mapElement: ElementRef;
	map: any;
  	directionsRender: any;
  	directionsService: any;
  	constructor() {}

  	ngAfterViewInit(){
		(<any>window).extAsyncInit = function() {
		     MessengerExtensions.getContext('175407417208540', 
			  function success(thread_context){
			  	console.log('success');
			    console.log(JSON.stringify(thread_context));
			    this.loadMap();
			  },
			  function error(err){
			    console.log(err);
			  }
			);
		};
	}

  	loadMap(){
		let mapOptions = {
			mapTypeId: google.maps.MapTypeId.ROADMAP,
	    }
	 	this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
	 	this.directionsRender = new google.maps.DirectionsRenderer( {'draggable':true});
		this.directionsService = new google.maps.DirectionsService();
		this.directionsRender.setMap(this.map);
		let self=this;
		this.directionsService.route({
		    origin: 'Margonda',
	      	destination: 'Depok',
	      	travelMode: google.maps.TravelMode.DRIVING
		}, function(response, status) {
		    if (status == google.maps.DirectionsStatus.OK) {
		        self.directionsRender.setDirections(response);
    			
	        } else {
	            window.alert('Directions request failed due to ' + status);
	        }
		});

	}

}
