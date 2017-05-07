// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}

var render = function(openingHours, date) {
	var info = getInfo(openingHours, date);
	document.getElementById('open').innerHTML = info.opened ? 'otevřené' : 'zavřené';
	
	var dayNames = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];
	var monthNames = ['ledna', 'února', 'března', 'dubna', ' května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
	var dayTimes = ['v noci', 'v noci', 'v noci', 'v noci', 'ráno', 'ráno', 'ráno', 'ráno', 'dopoledne', 'dopoledne', 'dopoledne', 'dopoledne', 'odpoledne', 'odpoledne', 'odpoledne', 'odpoledne', 'odpoledne', 'odpoledne', 'odpoledne', 'odpoledne', 'večer', 'večer', 'večer', 'večer'];
	document.getElementById('date').innerHTML = 'Je ' + dayNames[date.getDay()] + ' ' + date.getDate() + '. ' + monthNames[date.getMonth()] + ', přesně ' + date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0') + ' ' + dayTimes[date.getHours()] + '.';
	
	
	
	renderMessage(info.opened, info.nextChange, info.changeComesIn);
}

var renderMessage = function(opened, nextChange, mins) {
	var message = '';
	var time = formatSimpleDate(nextChange);
	
	if (opened) {
		if (mins < 15) {
			message = 'Ale spěchejte! Otevřeno bude už jen ' + mins + ' minut (do ' + time + ')!';
		} else {
			message = 'Pokud nejste daleko, nemusíte spěchat. Otevřeno bude ještě ' + mins + ' minut (do ' + time + ').'
		}
	} else {
		if (nextChange === null) {
			message = 'Pozor! Znovu bude otevřeno až zítra!';
		} else if (mins < 10) {
			message = 'Ale dondite, otevřeno bude už za ' + mins + ' minut (od ' + time + ')!';
		} else {
			message = 'Hledejte keříky, protože otevřeno bude až za ' + mins + ' minut (od ' + time + ')!';
		}
	}
	
	document.getElementById('message').innerHTML = message;
}



var isOpen = function(simpleNow, openToday) {
	var opened = false;
	var nextChange = null;
	
	if (simpleNow < openToday[0]) {
		nextChange = openToday[0];
	} else if (simpleNow > openToday[openToday.length - 1]) {
		nextChange = null;
	} else {
		for (var i in openToday) {
			i = parseInt(i);
			
			if (simpleNow >= openToday[i] && simpleNow <= openToday[i+1]) {
				opened = i%2 === 0 ? true : false;
				nextChange = openToday[i+1];
				break;
			}
		}
	}

	return { opened: opened, nextChange: nextChange }
}

	
var getInfo = function(openingHours, date) {
	var openToday = getDaysOpeningHours(openingHours, date);
	var opened = isOpen(simplifyDate(date), openToday);
	
	return {
		date: date,
		opened: opened.opened,
		nextChange: opened.nextChange,
		changeComesIn: calcInterval(simplifyDate(date), opened.nextChange)
	}
}

var getDaysOpeningHours = function(openingHours, date) {
	return date.getDay() === 0 ? 
		openingHours['sun'] : 
		date.getDay() === 6 ?
			openingHours['sat'] :
			openingHours['weekdays'];
}


var simplifyDate = function(date) {
	return date.getHours() * 100 + date.getMinutes();
}

var formatSimpleDate = function(simpleDate) {
	return parseInt(simpleDate/100) + ':' + ('' + simpleDate%100).padStart(2, '0');
}

var dateFromSimplified = function(simpleDate) {
	return new Date(0, 0, 0, parseInt(simpleDate/100), simpleDate%100);
}

var calcInterval = function(from, to) {
	return (dateFromSimplified(to) - dateFromSimplified(from))/(1000*60);
}
