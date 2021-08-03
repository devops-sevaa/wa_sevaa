//import SERVER_URL from "./config.js";
const SERVER_URL = "https://sevaprod.sagisu.com/v1";
//const SERVER_URL = "http://localhost:5001/v1";
const AUTH_PROD_URL = "https://authprod.sagisu.com/v1";
var contentCount = 5;
var pageNo = 1;
var bedData;
var scrollLoad = true;
var sortKey="total";
var sortOrder="-1";
var rowElements = [];
var $html;
var bookHospId =0;
var forceLoginForBooking = false;
var bookingData;

//your code here
loadHtml(false);
showLoginPage(false);
getBedStatuses();
scrollEvent();
getCovidStatistics();
sortListener();


function getBedStatuses(){
$.ajax({
    type: "GET",
    url: SERVER_URL+"/bedStatus?sortKey="+sortKey+"&sortOrder="+sortOrder,
    cache: false,
    success: function(data){
       bedData = data.data;
       displayPageData();
    }
  });
}

  function displayPageData(){
	if($html === undefined){
        loadHtml(true)
        return;
    }

   var i;
   var startIndex = (pageNo-1) * contentCount;
   var endIndex = pageNo * contentCount;
   for(i=startIndex;i<endIndex && i< bedData.length;i++){
       load_bed_status_card(bedData[i],i);
   }
   pageNo++;
  }

  function scrollEvent(){
    $(window).scroll(function() {
      if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight -2)) {
        displayPageData();
      }
  });
  }

  function loadHtml(loadData){
	$.get("bed_status_card.html",function (data) {
	  $html = $(data);
	  if(loadData) reloadPage();
	});
}

function load_bed_status_card(item,index) {
	var html = $html.clone();
    $('#hospName', html).text(item.name);
    $('#address', html).text(item.address);
	if(item.mobile!=null && item.mobile != ""){
      $('#call', html).text(item.mobile);
      $('#call',html).attr('href','tel:+'+item.mobile);
    }
    $('#bedCount', html).text('Total : '+item.total);
    $('#generalCount', html).text(item.general);
    $('#hduCount', html).text(item.hdu);
    $('#icuCount', html).text(item.icu);
    $('#icuVentCount', html).text(item.icuVentilator);

	//$('#book', html).attr('id',''+index);
	if(item.email!=null && item.email!==undefined){
		$('#book',html).show();
		$('#book',html).on('click',function(){
			bookHospId = item._id;
			//$('#bedBookingFormModal').modal('show');
			//$('#bedBookingFormModal').modal();
		});
	
		//Reset form on close
		$('#largeModal',html).on('hidden.bs.modal', function () {
			$('#largeModal form',html)[0].reset();
		});
		reservationSubmit(html);
	}else{
		$('#book',html).hide();
	}
	
      
	$("#bed_status_card").append(html);
}

//Not used
function getCovidStatistics(){
  $.ajax({
      type: "GET",
      url: SERVER_URL+"/covidStatics",
      cache: false,
      success: function(data){
        displayCovidStatistics(data);
      }
    });
  }

  //Not used
  function displayCovidStatistics(item) {
    
        $('#totalCases').text(item.totalCases);
        $('#totalDeaths').text(item.deaths);
        $('#hospitalised').text(item.activeCases);
      
}

function reloadPage(){
	$("#bed_status_card").empty();
	pageNo = 1;
	displayPageData();
  }

function refreshPage(){
  $("#bed_status_card").empty();
  pageNo = 1;
  getBedStatuses();
}

function sortListener(){
  $('#sortKey').change(function () {
    sortKey = $("#sortKey").val();
    refreshPage();
 }); 
  $('#sortOrder').change(function () {
    sortOrder = $("#sortOrder").val();
    refreshPage();
 });
} 

function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}

function reservationSubmit(html){
	$("#reservationSubmit1",html).submit(function(e) {
	  e.preventDefault(); // avoid to execute the actual submit of the form.
	  var form = $(this);
	  //var data = form.serializeObject();
	  var data = getFormData(form);
	  //data.bedStatus = _id;
	  data.testedForCovid = data.testedForCovid == "Yes" ? true : false;
	  data.onOxygenCylinder = data.onOxygenCylinder == "Yes" ? true : false;
	  data.hospitalsVisited = data.hospitalsVisited.split(',');
	  if(!data.sinceHowManyDays)data.sinceHowManyDays = 0;
	  if(!data.searchingHospitalSince)data.searchingHospitalSince = 0;

	  var reserve = {
		count : 1,
		type : $("#category",html).val()
	  }
	  data.reserve = reserve;

	  bookingData = data;
	  if(localStorage['userId']!==null && localStorage['userId'] !== undefined) {
		 $('.close',html).click();
		 postBooking(bookingData);
	  }else {
		$('.close',html).click();
		forceLoginForBooking = true;
		showLoginPage(true);
	  }
    });
}

function postBooking(data){
	data.user = localStorage['userId'];
	$.ajax({
		type: "POST",
		url: SERVER_URL+"/reserve?bedStatus="+bookHospId,
		data: data, // serializes the form's elements.
		success: function(data)
		{
		 //alert("Success");
		 //alert(data); // show response from the server.
		// $('.close').click();
		 window.location.href = "success.html";
		}
 });
}

function showLoginPage(forceLogin){
 // $(window).on('load', function(){ 
	  if(forceLogin){
		//$ ('#modal-subscribe').modal ("show")
		$ ('#modal-subscribe').modal('show')
	  }  
	  else{
		var isshow = localStorage.getItem('isshow');
     	 if (isshow== null) {
          localStorage.setItem('isshow', 1);
          $ ('#modal-subscribe').modal('show')
      	}
	  }
    
//  });

  window.cfields = [];
			/*window._show_thank_you = function(id, message, trackcmp_url, email) {
			  var form = document.getElementById('_form_' + id + '_'), thank_you = form.querySelector('._form-thank-you');
			  form.querySelector('._form-content').style.display = 'none';
			  thank_you.innerHTML = message;
			  thank_you.style.display = 'block';
			  const vgoAlias = typeof visitorGlobalObjectAlias === 'undefined' ? 'vgo' : visitorGlobalObjectAlias;
			  var visitorObject = window[vgoAlias];
			  if (email && typeof visitorObject !== 'undefined') {
				visitorObject('setEmail', email);
				visitorObject('update');
			  } else if (typeof(trackcmp_url) != 'undefined' && trackcmp_url) {
				// Site tracking URL to use after inline form submission.
				_load_script(trackcmp_url);
			  }
			  if (typeof window._form_callback !== 'undefined') window._form_callback(id);
			};*/
			window._show_error = function(id, message, html) {
			  var form = document.getElementById('_form_' + id + '_'), err = document.createElement('div'), button = form.querySelector('button'), old_error = form.querySelector('._form_error');
			  if (old_error) old_error.parentNode.removeChild(old_error);
			  err.innerHTML = message;
			  err.className = '_error-inner _form_error _no_arrow';
			  var wrapper = document.createElement('div');
			  wrapper.className = '_form-inner';
			  wrapper.appendChild(err);
			  button.parentNode.insertBefore(wrapper, button);
			  document.querySelector('[id^="_form"][id$="_submit"]').disabled = false;
			  if (html) {
				var div = document.createElement('div');
				div.className = '_error-html';
				div.innerHTML = html;
				err.appendChild(div);
			  }
			};
			window._load_script = function(url, callback) {
			  var head = document.querySelector('head'), script = document.createElement('script'), r = false;
			  script.type = 'text/javascript';
			  script.charset = 'utf-8';
			  script.src = url;
			  if (callback) {
				script.onload = script.onreadystatechange = function() {
				  if (!r && (!this.readyState || this.readyState == 'complete')) {
					r = true;
					callback();
				  }
				};
			  }
			  head.appendChild(script);
			};
			(function() {
			  if (window.location.search.search("excludeform") !== -1) return false;
			  var getCookie = function(name) {
				var match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'));
				return match ? match[2] : null;
			  }
			  var setCookie = function(name, value) {
				var now = new Date();
				var time = now.getTime();
				var expireTime = time + 1000 * 60 * 60 * 24 * 365;
				now.setTime(expireTime);
				document.cookie = name + '=' + value + '; expires=' + now + ';path=/';
			  }
				  var addEvent = function(element, event, func) {
				if (element.addEventListener) {
				  element.addEventListener(event, func);
				} else {
				  var oldFunc = element['on' + event];
				  element['on' + event] = function() {
					oldFunc.apply(this, arguments);
					func.apply(this, arguments);
				  };
				}
			  }
			  var _removed = false;
			  var form_to_submit = document.getElementById('_form_17_');
			  var allInputs = form_to_submit.querySelectorAll('input, select, textarea'), tooltips = [], submitted = false;
			
			  var getUrlParam = function(name) {
				var regexStr = '[\?&]' + name + '=([^&#]*)';
				var results = new RegExp(regexStr, 'i').exec(window.location.href);
				return results != undefined ? decodeURIComponent(results[1]) : false;
			  };
			
			  for (var i = 0; i < allInputs.length; i++) {
				var regexStr = "field\\[(\\d+)\\]";
				var results = new RegExp(regexStr).exec(allInputs[i].name);
				if (results != undefined) {
				  allInputs[i].dataset.name = window.cfields[results[1]];
				} else {
				  allInputs[i].dataset.name = allInputs[i].name;
				}
				var fieldVal = getUrlParam(allInputs[i].dataset.name);
			
				if (fieldVal) {
				  if (allInputs[i].dataset.autofill === "false") {
					continue;
				  }
				  if (allInputs[i].type == "radio" || allInputs[i].type == "checkbox") {
					if (allInputs[i].value == fieldVal) {
					  allInputs[i].checked = true;
					}
				  } else {
					allInputs[i].value = fieldVal;
				  }
				}
			  }
			
			  var remove_tooltips = function() {
				for (var i = 0; i < tooltips.length; i++) {
				  tooltips[i].tip.parentNode.removeChild(tooltips[i].tip);
				}
				tooltips = [];
			  };
			  var remove_tooltip = function(elem) {
				for (var i = 0; i < tooltips.length; i++) {
				  if (tooltips[i].elem === elem) {
					tooltips[i].tip.parentNode.removeChild(tooltips[i].tip);
					tooltips.splice(i, 1);
					return;
				  }
				}
			  };
			  var create_tooltip = function(elem, text) {
				var tooltip = document.createElement('div'), arrow = document.createElement('div'), inner = document.createElement('div'), new_tooltip = {};
				if (elem.type != 'radio' && elem.type != 'checkbox') {
				  tooltip.className = '_error';
				  arrow.className = '_error-arrow';
				  inner.className = '_error-inner';
				  inner.innerHTML = text;
				  tooltip.appendChild(arrow);
				  tooltip.appendChild(inner);
				  elem.parentNode.appendChild(tooltip);
				} else {
				  tooltip.className = '_error-inner _no_arrow';
				  tooltip.innerHTML = text;
				  elem.parentNode.insertBefore(tooltip, elem);
				  new_tooltip.no_arrow = true;
				}
				new_tooltip.tip = tooltip;
				new_tooltip.elem = elem;
				tooltips.push(new_tooltip);
				return new_tooltip;
			  };
			  var resize_tooltip = function(tooltip) {
				var rect = tooltip.elem.getBoundingClientRect();
				var doc = document.documentElement, scrollPosition = rect.top - ((window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0));
				if (scrollPosition < 40) {
				  tooltip.tip.className = tooltip.tip.className.replace(/ ?(_above|_below) ?/g, '') + ' _below';
				} else {
				  tooltip.tip.className = tooltip.tip.className.replace(/ ?(_above|_below) ?/g, '') + ' _above';
				}
			  };
			  var resize_tooltips = function() {
				if (_removed) return;
				for (var i = 0; i < tooltips.length; i++) {
				  if (!tooltips[i].no_arrow) resize_tooltip(tooltips[i]);
				}
			  };
			  var validate_field = function(elem, remove) {
				var tooltip = null, value = elem.value, no_error = true;
				remove ? remove_tooltip(elem) : false;
				if (elem.type != 'checkbox') elem.className = elem.className.replace(/ ?_has_error ?/g, '');
				if (elem.getAttribute('required') !== null) {
				  if (elem.type == 'radio' || (elem.type == 'checkbox' && /any/.test(elem.className))) {
					var elems = form_to_submit.elements[elem.name];
					if (!(elems instanceof NodeList || elems instanceof HTMLCollection) || elems.length <= 1) {
					  no_error = elem.checked;
					}
					else {
					  no_error = false;
					  for (var i = 0; i < elems.length; i++) {
						if (elems[i].checked) no_error = true;
					  }
					}
					if (!no_error) {
					  tooltip = create_tooltip(elem, "Please select an option.");
					}
				  } else if (elem.type =='checkbox') {
					var elems = form_to_submit.elements[elem.name], found = false, err = [];
					no_error = true;
					for (var i = 0; i < elems.length; i++) {
					  if (elems[i].getAttribute('required') === null) continue;
					  if (!found && elems[i] !== elem) return true;
					  found = true;
					  elems[i].className = elems[i].className.replace(/ ?_has_error ?/g, '');
					  if (!elems[i].checked) {
						no_error = false;
						elems[i].className = elems[i].className + ' _has_error';
						err.push("Checking %s is required".replace("%s", elems[i].value));
					  }
					}
					if (!no_error) {
					  tooltip = create_tooltip(elem, err.join('<br/>'));
					}
				  } else if (elem.tagName == 'SELECT') {
					var selected = true;
					if (elem.multiple) {
					  selected = false;
					  for (var i = 0; i < elem.options.length; i++) {
						if (elem.options[i].selected) {
						  selected = true;
						  break;
						}
					  }
					} else {
					  for (var i = 0; i < elem.options.length; i++) {
						if (elem.options[i].selected && !elem.options[i].value) {
						  selected = false;
						}
					  }
					}
					if (!selected) {
					  elem.className = elem.className + ' _has_error';
					  no_error = false;
					  tooltip = create_tooltip(elem, "Please select an option.");
					}
				  } else if (value === undefined || value === null || value === '') {
					elem.className = elem.className + ' _has_error';
					no_error = false;
					tooltip = create_tooltip(elem, "This field is required.");
				  }
				}
			/*	if (no_error && elem.name == 'email') {
				  if (!value.match(/^[\+_a-z0-9-'&=]+(\.[\+_a-z0-9-']+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,})$/i)) {
					elem.className = elem.className + ' _has_error';
					no_error = false;
					tooltip = create_tooltip(elem, "Enter a valid email address.");
				  }
				}*/
				if (no_error && /date_field/.test(elem.className)) {
				  if (!value.match(/^\d\d\d\d-\d\d-\d\d$/)) {
					elem.className = elem.className + ' _has_error';
					no_error = false;
					tooltip = create_tooltip(elem, "Enter a valid date.");
				  }
				}
				tooltip ? resize_tooltip(tooltip) : false;
				return no_error;
			  };
			  var needs_validate = function(el) {
					if(el.getAttribute('required') !== null){
						return true
					}
					/*if(el.name === 'email' && el.value !== ""){
						return true
					}*/
					return false
			  };
			  var validate_form = function(e) {
				var err = form_to_submit.querySelector('._form_error'), no_error = true;
				if (!submitted) {
				  submitted = true;
				  for (var i = 0, len = allInputs.length; i < len; i++) {
					var input = allInputs[i];
					if (needs_validate(input)) {
					  if (input.type == 'text') {
						addEvent(input, 'blur', function() {
						  this.value = this.value.trim();
						  validate_field(this, true);
						});
						addEvent(input, 'input', function() {
						  validate_field(this, true);
						});
					  } else if (input.type == 'radio' || input.type == 'checkbox') {
						(function(el) {
						  var radios = form_to_submit.elements[el.name];
						  for (var i = 0; i < radios.length; i++) {
							addEvent(radios[i], 'click', function() {
							  validate_field(el, true);
							});
						  }
						})(input);
					  } else if (input.tagName == 'SELECT') {
						addEvent(input, 'change', function() {
						  validate_field(this, true);
						});
					  } else if (input.type == 'textarea'){
						addEvent(input, 'input', function() {
						  validate_field(this, true);
						});
					  }
					}
				  }
				}
				remove_tooltips();
				for (var i = 0, len = allInputs.length; i < len; i++) {
				  var elem = allInputs[i];
				  if (needs_validate(elem)) {
					if (elem.tagName.toLowerCase() !== "select") {
					  elem.value = elem.value.trim();
					}
					validate_field(elem) ? true : no_error = false;
				  }
				}
				if (!no_error && e) {
				  e.preventDefault();
				}
				resize_tooltips();
				return no_error;
			  };
			  addEvent(window, 'resize', resize_tooltips);
			  addEvent(window, 'scroll', resize_tooltips);
			  window._old_serialize = null;
			  if (typeof serialize !== 'undefined') window._old_serialize = window.serialize;
			  _load_script("//d3rxaij56vjege.cloudfront.net/form-serialize/0.3/serialize.min.js", function() {
				window._form_serialize = window.serialize;
				if (window._old_serialize) window.serialize = window._old_serialize;
			  });
			  var form_submit = function(e) {
				e.preventDefault();
				if (validate_form()) {
				  // use this trick to get the submit button & disable it using plain javascript
				  document.querySelector('#_form_17_submit').disabled = true;
				  var serialized = _form_serialize(document.getElementById('_form_17_'));
				  var err = form_to_submit.querySelector('._form_error');
				  err ? err.parentNode.removeChild(err) : false;
				  _load_script('https://sagisu.activehosted.com/proc.php?' + serialized + '&jsonp=true');
                  //addCrmDataToDb(serialized)
				  generateOtp($(this));
				}
				return false;
			  };
			  addEvent(form_to_submit, 'submit', form_submit);
			})();
			

  /*$("#loginSubmit").submit(function(e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.
    var form = $(this);
    
    $.ajax({
           type: "POST",
           url: SERVER_URL+"/user",
           data: form.serialize(), // serializes the form's elements.
           success: function(data)
           {
            //alert("Success"); // show response from the php script.
            $('.close').click();
               
           }
    });

    
});*/
}

function generateOtp($form){
	let data = getFormData($form);
	let otpUserData = {
		phone : data.phone,
		name : data.fullname,
		event : "VERIFY_MOBILE",
		countryCode : "+91",
		actorType:"sevaUser"
	}
	$.ajax({
		type: "POST",
		url: AUTH_PROD_URL+"/otps/generate",
		data: otpUserData, // serializes the form's elements.
		success: function(data)
		{
		 //alert("Success"); // show response from the php script.
		 $('.close').click();
		 showOtpScreen(otpUserData.phone,$form.serialize());
			
		},
		error: function(xhr, textStatus, errorThrown) {
		 var err = JSON.parse(xhr.responseText);
		 alert(err.message);
	   }
 });
}

function showOtpScreen(phone,serialized){
	$ ('#message').text('An OTP has been sent to XXX XXX '+phone.substring(6));
	$ ('#loginotp').modal('show');
	validateOtp(phone,serialized);
}

function validateOtp(phone,serialized){
	$("#loginOtpSubmit").submit(function(e) {

		e.preventDefault(); // avoid to execute the actual submit of the form.
		var form = $(this);
		var data = getFormData(form);
		$.ajax({
			   type: "GET",
			   url: AUTH_PROD_URL+"/otps/validate?phone="+phone+"&otpNumber="+data.otpNumber+"&event=VERIFY_MOBILE&actorType=sevaUser",
			   success: function(data)
			   {
				//alert("Success"); // show response from the php script.
				$('.closeOtp').click();
				addCrmDataToDb(serialized)
				   
			   },
			   error: function(xhr, textStatus, errorThrown) {
				var err = JSON.parse(xhr.responseText);
				alert(err.message);
			  }
		});
	
		
	});
}

function addCrmDataToDb(data){
  $.ajax({
    type: "POST",
    url: SERVER_URL+"/user",
    data: data, // serializes the form's elements.
    success: function(data)
    {
	 if(localStorage['loggedIn']) return;
     //alert("Success"); // show response from the php script.
	 localStorage['loggedIn'] = true
	 localStorage['userId'] = data.id;
     $('.close').click();
	 if(forceLoginForBooking){
		forceLoginForBooking = false
		postBooking(bookingData);
	 }else{
		location.reload();
	 }
        
    }
});
}
