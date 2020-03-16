declare module 'googlemaps';
declare namespace MessengerExtensions{
	function getContext(appId:string,success:any, error:any):any;
	function requestCloseBrowser(success:any, error:any):any;
}