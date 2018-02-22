var config = {
    apiKey: "AIzaSyCC5idbKBo59mPZMxKBhrj_HTGlUqUjxxk",
    authDomain: "blog-66ae8.firebaseapp.com",
    databaseURL: "https://blog-66ae8.firebaseio.com",
    projectId: "blog-66ae8",
    storageBucket: "blog-66ae8.appspot.com",
    messagingSenderId: "627249249118"
  };
var bookmarks = {};
    if(document.cookie){
        var value = ";" + document.cookie;
        if(value.split("; bookmarks=")[1].slice(1,-1)){
            bookmarks = JSON.parse(value.split("; bookmarks=")[1]);
            console.log("doc-cookie",JSON.parse(value.split("; bookmarks=")[1]));
        }
    }
    $(".maps-addon").each(
        function(){
            console.log($(this).children('.property-addon').text().split(",")[0],bookmarks,bookmarks[$(this).children('.property-addon').text().split(",")[0]]);
            if(bookmarks[$(this).children('.property-addon').text().split(",")[0]]){
                $(this).css("color","#F62459");
        } 
    });  
document.cookie = "bookmarks="+ JSON.stringify(bookmarks) +"; expires=Sun, 9 Dec 2018 12:00:00 UTC;";
function setcookie(bookmarks,initMap){
    document.cookie = "bookmarks="+ JSON.stringify(bookmarks) +"; expires=Sun, 9 Dec 2018 12:00:00 UTC;";
  // console.log("cook",document.cookie);
    $.getScript("http://maps.google.com/maps/api/js?callback=initMap", function () {});
}






function initMap() {
  var origin = [{lat:28.444250,lng:77.043240}];
  var destination = [];
  console.log("bookmarks=",bookmarks);
  for(let prop in bookmarks){
    if(bookmarks[prop][bookmarks[prop].length -1] == "yes" || bookmarks[prop][bookmarks[prop].length -1] == "pending")
      destination.push({lat:parseFloat(bookmarks[prop][1]),lng:parseFloat(bookmarks[prop][2])});
  }
  console.log("des =============",destination);
  var bounds = new google.maps.LatLngBounds;
  var markersArray = [];
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 55.53, lng: 9.4},
    zoom: 10
  });
  var geocoder = new google.maps.Geocoder;

  var service = new google.maps.DistanceMatrixService;
  var des = destination;
  var src = origin;
  service.getDistanceMatrix({
    origins: src,
    destinations: des,
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false
  }, function(response, status) {
    if (status !== 'OK') {
      // alert('Error was: ' + status);
    } else {
      var originList = response.originAddresses;
      var destinationList = response.destinationAddresses;
      deleteMarkers(markersArray);
      console.log("response",response);
      var showGeocodedAddressOnMap = function(asDestination) {
        var icon = asDestination ? destinationIcon : originIcon;
        return function(results, status) {
          if (status === 'OK') {
            map.fitBounds(bounds.extend(results[0].geometry.location));
            markersArray.push(new google.maps.Marker({
              map: map,
              position: results[0].geometry.location,
              icon: icon
            }));
          } else {
            alert('Geocode was not successful due to: ' + status);
          }
        };
      };

var maxi = 0;
var ind =0;
for(let i=0;i<response.rows[0].elements.length;i++ ){
console.log(response.rows[0].elements[i].distance.value);
  if(response.rows[0].elements[i].distance.value>maxi){
  maxi = response.rows[0].elements[i].distance.value;
  ind =i;
  }
}     
console.log(response.rows);
console.log("des=",des[ind]);
console.log(destinationList);
var waypoints=[];
waypoints = des.filter(val => val!=des[ind]);
console.log("WAYPOINTS",waypoints);
wayMap(src,des[ind],waypoints);
}
  });
}

function wayMap(src,des,waypoints) {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: {lat: 41.85, lng: -87.65}
  });
  directionsDisplay.setMap(map);

    calculateAndDisplayRoute(directionsService, directionsDisplay,src[0],des,waypoints);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay,src,des,waypoints) {
 var geocoder = new google.maps.Geocoder;
  for(let i=0;i<waypoints.length;i++){
   waypoints[i] = {location:waypoints[i],
    stopover: true};         
  }
  console.log("way",waypoints);
  console.log("waypoints...",waypoints);

  directionsService.route({
    origin: src,
    destination: des,
    waypoints: waypoints,
    optimizeWaypoints: true,
    travelMode: 'DRIVING'
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
      var route = response.routes[0];
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

function deleteMarkers(markersArray) {
  for (var i = 0; i < markersArray.length; i++) {
    markersArray[i].setMap(null);
  }
  markersArray = [];
}


// firebase start //
firebase.initializeApp(config);
var database = firebase.database();
function writeUserData(temp_arr,bookmarks,user_id = 1,meet_time = "10:32",user_location = {lat:1,lng:1},property_address= {lat:1,lng:1}) {
if(typeof temp_arr == "string"){
  firebase.database().ref('prop/' + temp_arr+ "/" + user_id).set(null);  
}
else{
  firebase.database().ref('prop/' + temp_arr[0]+ "/" + user_id).set({
    propId:temp_arr[0],
    propName:temp_arr[1],
    broker_id: temp_arr[4],
    broker_name: temp_arr[5],
    meet_time,
    user_location,
    property_address
    });
    firebase.database().ref('prop/' + temp_arr[0]+ "/" + user_id).on('value',function(snapshot) {
      if(snapshot.val() == null){
        console.log("off");
      } 
      else if(snapshot.val().status == "no"){
        bookmarks[temp_arr[0]][bookmarks[temp_arr[0]].length-1] = "no";
        // console.log(bookmarks);
        setcookie(bookmarks,initMap);
        console.log("no");
      } 
      else if(snapshot.val().status == "yes"){
        bookmarks[temp_arr[0]][bookmarks[temp_arr[0]].length-1] = "yes";
        // console.log(bookmarks);
        setcookie(bookmarks,initMap);
        console.log("yes");
      }
      else{
        console.log("invalid results",snapshot.val());
      }
      console.log("koi chala?");
    }); 
  }
}

// firebase end //

$(document).ready(function(){
    console.log("cookie",document.cookie);
    $('.maps-addon').click(function(){
        if($(this).css('color') == "rgb(0, 0, 0)")
        { 
            console.log($(this).css("color"));
            console.log($(this).children('.property-addon').text());
            let temp_arr = $(this).children('.property-addon').text().split(",");
            console.log("temp_arr=",temp_arr);
            bookmarks[temp_arr[0]] = temp_arr.slice(1,6);
            bookmarks[temp_arr[0]].push("pending");
            console.log(bookmarks);
            $(this).css("color", "#F62459");
            console.log("key",'prop/' + temp_arr[0]);
            writeUserData(temp_arr,bookmarks);
        }
        else{
            console.log($(this).css("color"));
            delete bookmarks[$(this).children('.property-addon').text().split(",")[0]];
            console.log(bookmarks);
            $(this).css("color", "rgb(0, 0, 0)");  
            writeUserData($(this).children('.property-addon').text().split(",")[0]);    
        }
        setcookie(bookmarks);
        console.log("cookie",document.cookie);
    });

});



$('.filter').width($('.result-content').width()-1);

$('.accordion').width($(window).width() - $('.result-content').width()-60);

$('#map').width($('.accordion').width());
$(window).resize(function(){
    $('.filter').width($('.result-content').width()-1);
});

$('.buy-filter').click(function(){
    $('.dropdown').toggleClass('visible');
});

$('.search').focus(function(){
    $('.fa-search').addClass('selected');
    $('.fa-search').animate({'transform':'translate(650, 0)'}, 500);
})

$('.search').blur(function(){
    $('.fa-search').removeClass('selected');
})

$('.bedroom-filter').click(function(){
    let position = $('.bedroom-filter').position();
$('.dropdown-bedroom-filter').css('top', 49);
$('.dropdown-bedroom-filter').css('left', position.left);

    $('.dropdown-bedroom-filter').toggleClass('visible');
});

$('.sort').click(function(){
    position = $('.sort').position();
    $('.dropdown-sort-filter').css('position', 'absolute');
    $('.dropdown-sort-filter').css('top', 49);
    $('.dropdown-sort-filter').css('left', position.left);

    $('.dropdown-sort-filter').toggleClass('visible');
});

$('.budget').click(function(){
    position = $('.budget').position();
    $('.dropdown-budget-filter').css('position', 'absolute');
    $('.dropdown-budget-filter').css('top', 49);
    $('.dropdown-budget-filter').css('left', position.left);

    $('.dropdown-budget-filter').toggleClass('visible');
});

$('.results').click(function(){
    $('.dropdown').addClass('visible');
    $('.dropdown-bedroom-filter').addClass('visible');
    $('.dropdown-sort-filter').addClass('visible');
})



function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var sortCat = document.getElementById('sort-cat');
if(getParameterByName('sorted') == "ASC"){
    sortCat.innerHTML = "Price: Low to High";
}else if(getParameterByName('sorted') == "DESC"){
    sortCat.innerHTML = "Price: High to Low";
}else if(getParameterByName('sorted') == "POP"){
    sortCat.innerHTML = "Popularity";
}else if(getParameterByName('sorted') == "RAT"){
    sortCat.innerHTML = "Seller Rating";
}else{
    sortCat.innerHTML = "Relevance";
}

if(getParameterByName('rental')){
    document.getElementsByClassName('content')[0].innerHTML = "Rent";
    $('.buy').removeClass('selected');
    $('.rent').addClass('selected');
}else{
    document.getElementsByClassName('content')[0].innerHTML = "Buy";
    $('.buy').addClass('selected');
    $('.rent').removeClass('selected');
}

body = '';
    
    if(getParameterByName('city')){
        id = {
            11: "Gurgaon",
            18: "Mumbai",
            16: "Kolkata"
        }
        body += '<span class = "filter-item">' + 'City' + ': '+ id[getParameterByName('city')] + '</span>';
    }

    if(getParameterByName('bhk')){
        body += '<span class = "filter-item">' + 'BHKs' + ': '+ getParameterByName('bhk') + '<a href = "/filter?remove=bhks"><i class="fa fa-times" aria-hidden="true"></i></a></span>';    
    }

    if(getParameterByName('toPrice')){
        body += '<span class = "filter-item">' + 'Budget: Maximum' + ': '+ getParameterByName('toPrice') + '<a href = "/filter?remove=toPrice"><i class="fa fa-times" aria-hidden="true"></i></a></span>';    
    }

    if(getParameterByName('fromPrice')){
        body += '<span class = "filter-item">' + 'Budget: Minimum' + ': '+ getParameterByName('fromPrice') + '<a href = "/filter?remove=fromPrice"><i class="fa fa-times" aria-hidden="true"></i></a></span>';    
    }

    document.getElementById('main').innerHTML = body;

    

// Get the button that opens the modal


function openModal(id){
    document.getElementById('modal'+id).style.display = 'block';
}

function closeModal(id){
    document.getElementById('modal'+id).style.display = 'none';
}

let modal = document.getElementsByClassName('modal')[0];

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
} 


