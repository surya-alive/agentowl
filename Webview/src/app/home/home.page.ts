import { Component,ViewChild,ElementRef  } from '@angular/core';
import { NavController, NavParams} from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
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
  	pinPoint: any;
  	isLoadPage=true;
	  showTittle;
  	titlePage;
  	place:string;
    isFound=false;
    location:string;
    key:string;
    userid:string;

  	constructor(private route: ActivatedRoute, private locationService: LocationService) {}

  	ionViewDidEnter(){
  		this.key = this.route.snapshot.queryParamMap.get('key');
  		this.userid = this.route.snapshot.queryParamMap.get('userid');
  		if(this.key==null || this.userid==null){
			this.isLoadPage=false;
			this.titlePage="Context is not found";
			this.showTittle=true;
			return;
		}
		const data={type:"get",key:this.key,userid:this.userid};
  		this.locationService.getTransaction(data).subscribe(res=>{
  			if(res.result=="notfound"){
  				this.titlePage="Context is not found";
  				this.isLoadPage=false;
  				this.showTittle=true;
  			} 
  			else if(res.result=="found"){
  				this.titlePage=res.data.slots.deliveryPlace;
  				this.isLoadPage=false;
  				this.showTittle=true;
          this.isFound=true;
          this.location=res.data.pinLocationGeometry;
				  this.loadMap(res.data);
  			}
  		},err=>{
        	console.log('error',err);
        	this.isLoadPage=false;
        	this.showTittle=true;
      });
	}

  done(){
    console.log(this.location);
    this.isLoadPage=true;
    this.showTittle=false;
    const data={type:"post",key:this.key,userid:this.userid,location:this.location};
    this.locationService.getTransaction(data).subscribe(res=>{
    console.log(res);
      MessengerExtensions.requestCloseBrowser(function success() {}, function error(err) {console.log(err)});
    },err=>{
    console.log(err);
      MessengerExtensions.requestCloseBrowser(function success() {}, function error(err) {console.log(err)});
    });


    
  }

  	loadMap(data){
  		let lnglat = JSON.parse(data.pinLocationGeometry);
		let mapOptions = {
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			zoom: 15,
    		center: lnglat
	    }
	 	this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
	 	this.pinPoint = new google.maps.Marker({position: lnglat,map: this.map,draggable:true,title:"delivery location",animation: google.maps.Animation.DROP});
    let self=this;
	 	google.maps.event.addListener(this.pinPoint, 'dragend', function() {
		    self.location=JSON.stringify(this.getPosition().toJSON());
		});

	}

}
