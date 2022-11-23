var lstSiteDetailsWeekly = [];
var lstToday = [];
var lstWeekly = [];
var lstPeriodsToday = [];
var lstPeriodsWeekly = [];
var todayDataFiltered = [];
var weeklyDataFiltered = [];
var markersDataFiltered = [];
var markersResponseData = [];
var tdCellColorToday = [];
var lastUpdate = '';
var nextUpdate = '';
var globalSiteId = 0;
var mapApiError = false;
var initialLocation;
var mapZoom = 8;
var map;
var markers = [];
var ddlSiteNameOption = '';
var ddlAssociatedSiteNameOption = '';
var allAssociatedSites = [];
var historicSpillDetails = [];
var historicUrl = '';
var pageNo = "1";

const APIURL = '/gateway/Beachbuoy/1.0/api/v1.0/';
const CAPTCHAKEY = "6LeDO28cAAAAAINp3QTpdXtMscJf3H_PxIwBAQxV";
const APIGWKEY = 'd25662b7-9fd3-4e19-a68b-0c581ec229d0';
const blueIcon = 'https://www.southernwater.co.uk/media/4718/5432_Beachbuoy_icons_blue.png';
const yellowIcon = 'https://www.southernwater.co.uk/media/4722/5432_Beachbuoy_icons_yellow.png';
const redIcon = 'https://www.southernwater.co.uk/media/4721/5432_Beachbuoy_icons_red.png';
const unverifiedIcon = 'https://www.southernwater.co.uk/media/5387/5432_beachbuoy_icons_unreviewed.png';
const maintenanceIcon = 'https://www.southernwater.co.uk/media/5386/5432_beachbuoy_icons_maintenance.png';
const outfall1_Icon = 'https://www.southernwater.co.uk/media/4719/5432_Beachbuoy_icons_cso_opt3-01.png';
const outfall2_Icon = 'https://www.southernwater.co.uk/media/4723/5432_Beachbuoy_icons_cso_opt3-02.png';
const outfall3_Icon = 'https://www.southernwater.co.uk/media/4720/5432_Beachbuoy_icons_cso_opt3-03.png';
const outfall4_Icon = 'https://www.southernwater.co.uk/media/5384/5432_beachbuoy_icons_cso_opt3-04.png';
const outfall5_Icon = 'https://www.southernwater.co.uk/media/5385/5432_beachbuoy_icons_cso_opt3-05.png';
const TIMEZONE = 'Europe/London';
const DATEFORMAT = 'DD';
const TIMEFORMAT = "HH";
const HOURSTOCHECKSPILLTODAY = 24;
const HOURSTOCHECKSPILL = 72;
const EMAIL_SUCCESS = 'You have successfully been added to the mailing list';
const EMAIL_FAILURE = 'An error occurred adding you to the mailing list, please try again later.';
const UNSUBSCRIBE_SUCCESS = 'You have been successfully unsubscribed for this site';
const UNSUBSCRIBEALL_SUCCESS = 'You have been successfully unsubscribed for all sites';
const UNSUBSCRIBEALL_FAILURE = 'An error occurred unsubscribing you, please try again later.';
const SPILLCOLOR = 'beachbuoy_td-bg-color-orange';
const NOSPILLCOLOR = 'beachbuoy_td-bg-color-blue';
const UNKNOWNSPILLCOLOR = 'beachbuoy_td-bg-color-unknown';
const infowindow = new google.maps.InfoWindow();
const SPILL = 'yes';
const NOSPILL = 'no';
const head = ["Event ID", "Site Number", "Bathing Site", "Outfall", "Last Activation Start", "Last Activation End", "Duration (hrs)", "Activity"];

var daysofweek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var timingsofday = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
var twentyFourHoursBackDate = moment().tz(TIMEZONE).subtract(HOURSTOCHECKSPILLTODAY, 'h').startOf('day');
var seventyTwoHoursBackDate = moment().tz(TIMEZONE).subtract(HOURSTOCHECKSPILL, 'h').startOf('day');
var twentyFourHoursBackTime = moment().tz(TIMEZONE).subtract(HOURSTOCHECKSPILLTODAY, 'h');
var seventyTwoHoursBackTime = moment().tz(TIMEZONE).subtract(HOURSTOCHECKSPILL, 'h');
var startFirstPeriod = moment.tz(TIMEZONE).startOf('day');
var endFirstPeriod = moment.tz(TIMEZONE).startOf('day').add(4, 'h');
var endSecondPeriod = moment.tz(TIMEZONE).startOf('day').add(8, 'h');
var endThirdPeriod = moment.tz(TIMEZONE).startOf('day').add(12, 'h');
var endForthPeriod = moment.tz(TIMEZONE).startOf('day').add(16, 'h');
var endFifthPeriod = moment.tz(TIMEZONE).startOf('day').add(20, 'h');
var endSixthPeriod = moment.tz(TIMEZONE).startOf('day').add(24, 'h');
var objDdlSiteName = document.getElementById('ddlSiteName');
var objDdlActivity = document.getElementById('ddlActivity');
var objDdlAssociatedSiteName = document.getElementById('ddlAssociatedSiteName');
var objTblSpillsHistory = document.getElementById('beachbuoy_table-spills-history');
var mapReloaded = false;

// check DOM Ready & get spills data
$(document).ready(function () {
    var unsubscribeId = '';
    const urlParams = new URLSearchParams(location.search);
    setInterval(autoRefresh, 1800000);

    if (urlParams.has('unsubscribe')) {
        unsubscribeId = urlParams.getAll('unsubscribe');
        unsubscribeSite(unsubscribeId);
    }
    if (urlParams.has('unsubscribeall')) {
        unsubscribeId = urlParams.getAll('unsubscribeall');
        unsubscribeAllSite(unsubscribeId);
    }
    initMap();
});

function autoRefresh() {
    window.location = window.location.href;
}

function isMobileDevice() {
    if (navigator.userAgentData) {
        if(navigator.userAgentData.mobile)
        {
            return true;
        }
    }

    var isMobile = navigator.userAgent.toLowerCase().match(/mobile/i);
    var isTablet = navigator.userAgent.toLowerCase().match(/tablet/i);
    var isAndroid = navigator.userAgent.toLowerCase().match(/android/i);
    var isiPhone = navigator.userAgent.toLowerCase().match(/iphone/i);
    var isiPad = navigator.userAgent.toLowerCase().match(/ipad/i);

    if (isMobile || isTablet || isAndroid || isiPhone || isiPad) {
        return true;
    }
    return false;
}

function initMap() {

    if (navigator.geolocation && isMobileDevice()) {
        navigator.geolocation.getCurrentPosition(
            (success) = function (position) {
                initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                mapZoom = 11;
                renderMap();
            },
            (failed) = function (position) {
                initialLocation = new google.maps.LatLng(50.836926, 0.476907);
                renderMap();
            }
        );
    }
    else {
        initialLocation = new google.maps.LatLng(50.836926, 0.476907);
        renderMap();
    }
}

function renderMap() {
    var options = {
        zoom: mapZoom,
        center: initialLocation,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.HYBRID
    };

    // init the map
    map = new google.maps.Map(document.getElementById('beachbuoy_map_canvas'), options);

    // insert floating map key with icons
    const centerControlDiv = document.getElementById("beachbuoy_div-floating-map-key");
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(centerControlDiv);
    document.getElementById("beachbuoy_iconRedSpill").innerHTML = "<img src='" + redIcon + "' class='beachbuoy_floating-map-key-image'>";
    document.getElementById("beachbuoy_iconYellowSpill").innerHTML = "<img src='" + yellowIcon + "' class='beachbuoy_floating-map-key-image'>";
    document.getElementById("beachbuoy_iconBlueSpill").innerHTML = "<img src='" + blueIcon + "' class='beachbuoy_floating-map-key-image'>";
    document.getElementById("beachbuoy_iconUnverifiedSpill").innerHTML = "<img src='" + unverifiedIcon + "' class='beachbuoy_floating-map-key-image'>";
    document.getElementById("beachbuoy_iconMaintenance").innerHTML = "<img src='" + maintenanceIcon + "' class='beachbuoy_floating-map-key-image'>";
    document.getElementById("beachbuoy_iconRedAssociated").innerHTML = "<img src='" + outfall3_Icon + "' class='beachbuoy_floating-map-key-image'>";
    document.getElementById("beachbuoy_iconYellowAssociated").innerHTML = "<img src='" + outfall2_Icon + "' class='beachbuoy_floating-map-key-image'>";
    document.getElementById("beachbuoy_iconBlueAssociated").innerHTML = "<img src='" + outfall1_Icon + "' class='beachbuoy_floating-map-key-image'>";
    document.getElementById("beachbuoy_iconUnverifiedAssociated").innerHTML = "<img src='" + outfall4_Icon + "' class='beachbuoy_floating-map-key-image'>";
    document.getElementById("beachbuoy_iconMaintenanceAssociated").innerHTML = "<img src='" + outfall5_Icon + "' class='beachbuoy_floating-map-key-image'>";


    google.maps.event.addListenerOnce(map, 'idle', function () {
        getSpillsAPIData();
    });
}

function getSpillsAPIData() {
    showLoader("#loader");

    // Gets the data for daily/weekly table
    var spillsUrl = APIURL + "Spills";
    getApiResults(spillsUrl, getSpillsSuccess, getSpillsError, 'GET');

    // Gets all Genuine Historic Spills
    historicUrl = APIURL + "Spills/GetHistoricSpills?activity=Genuine";
    getApiResults(historicUrl, getHistoricSpillsSuccess, getError, 'GET');

    // Gets all Areas
    var AreasURL = APIURL + "Spills/GetAllAreas";
    getApiResults(AreasURL, getAreasSuccess, getError, 'GET');

    // Gets all Associated Areas
    var AssociatedAreasURL = APIURL + "Spills/GetAllAssociatedAreas";
    getApiResults(AssociatedAreasURL, getAssociatedAreasSuccess, getError, 'GET');

    var mapElement = document.getElementById('beachbuoy_map_canvas')
    if (mapElement && mapReloaded) {
        // if already focused - remove focus 
        if (document.activeElement == mapElement) {
            mapElement.blur();
        }
        mapElement.focus();
    }
    mapReloaded = true;
}

function getAllHistoricSpills() {
    // Gets all Historic Spills
    historicUrl = APIURL + "Spills/GetHistoricSpills";
    getApiResults(historicUrl, getHistoricSpillsSuccess, getError, 'GET');
}

function filterSpillData(markerId) {
    var startFullDate = moment.tz(TIMEZONE).subtract(6, 'd').startOf('day');
    var endFullDate = moment().tz(TIMEZONE).startOf('day');

    todayDataFiltered = markersResponseData.sitePeriods.filter(item => item.site.id == markerId).map(function (item) {
        return {
            site: item.site, periods: item.periods.filter(function (objFilterToday) {
                return moment(objFilterToday.start).tz(TIMEZONE).format(DATEFORMAT) === moment().tz(TIMEZONE).format(DATEFORMAT);
            })
        };
    });
    populateTodayList();

    weeklyDataFiltered = markersResponseData.sitePeriods.filter(item => item.site.id == markerId).map(function (item) {
        return {
            site: item.site, periods: item.periods.filter(function (objFilterWeekly) {
                return moment(objFilterWeekly.start).tz(TIMEZONE).isAfter(startFullDate)
                    && moment(objFilterWeekly.start).tz(TIMEZONE).isBefore(endFullDate);
            })
        };
    });
    populateWeeklyList();

    lastUpdate = moment(markersResponseData.lastUpdated.split("+")[0]).tz(TIMEZONE).format('DD-MMM-YYYY HH:mm A');
    nextUpdate = moment(markersResponseData.nextUpdate.split("+")[0]).tz(TIMEZONE).format('DD-MMM-YYYY HH:mm A');
}

function populateTodayList() {
    todayDataFiltered.map(function (item) {
        lstPeriodsToday = [];
        var now = new Date().getHours();
        var cellColor = '';
        for (var i = 0; i < item.periods.length; i++) {
            if (parseInt(moment(item.periods[i].start).tz(TIMEZONE).format('HH')) <= now) {
                if (item.periods[i].events.length > 0) {
                    cellColor = SPILL;
                }
                else {
                    cellColor = NOSPILL;
                }
                lstPeriodsToday.push({
                    start: item.periods[i].start,
                    end: item.periods[i].end,
                    spillcolor: cellColor
                });
            }
        }
        lstToday.push({
            site: item.site,
            periods: lstPeriodsToday
        });
    });
}

function populateWeeklyList() {
    lstWeekly = [];
    weeklyDataFiltered.map(function (itemWeekly) {
        lstPeriodsWeekly = [];
        var cellColorWeek = NOSPILL;
        for (var i = 0; i < itemWeekly.periods.length; i++) {
            var startDay = '';
            var endDay = '';
            startDay = moment(itemWeekly.periods[i].start).tz(TIMEZONE).format(DATEFORMAT);
            endDay = moment(itemWeekly.periods[i].end).tz(TIMEZONE).format(DATEFORMAT);
            if (itemWeekly.periods[i].events.length > 0) { cellColorWeek = SPILL }
            if (startDay != endDay) {
                lstPeriodsWeekly.push({
                    start: itemWeekly.periods[i].start,
                    end: itemWeekly.periods[i].end,
                    spillcolor: cellColorWeek
                });
                cellColorWeek = NOSPILL;
            }
        }
        lstWeekly.push({
            site: itemWeekly.site,
            periods: lstPeriodsWeekly
        });
    })
    //------------------------ SIX DAY DATA LOGIC ------------------------------------------
    lstWeekly.map(function (objDataWeekly) {
        var dayOfWeek = [];
        var currentDay = '';
        var allSitesWeekly = objDataWeekly.site;
        var allPeriodsWeekly = objDataWeekly.periods;
        var dayOfWeekColor = '';

        for (var i = 0; i < allPeriodsWeekly.length; i++) {
            dayOfWeek[i] = allPeriodsWeekly[i].start;
            currentDay = moment(dayOfWeek[i]).tz(TIMEZONE).format('DD-MMM');
            dayOfWeekColor = allPeriodsWeekly[i].spillcolor;
            if (dayOfWeekColor == SPILL) {
                lstSiteDetailsWeekly.push({
                    siteId: allSitesWeekly.id,
                    day: { currentDay: currentDay },
                    cellColor: SPILLCOLOR
                })
            }
            else if (dayOfWeekColor == NOSPILL) {
                lstSiteDetailsWeekly.push({
                    siteId: allSitesWeekly.id,
                    day: { currentDay: currentDay },
                    cellColor: NOSPILLCOLOR
                })
            }
            else {
                lstSiteDetailsWeekly.push({
                    siteId: allSitesWeekly.id,
                    day: { currentDay: currentDay },
                    cellColor: UNKNOWNSPILLCOLOR
                })
            }
        }
    });
    // ---------------------- END OF SIX DATA LOGIC ----------------------------------------
}

function addEmailSubscription() {
    var email = document.getElementById("beachbuoy_email-input").value;
    if (validateEmail(email)) {
        var response = grecaptcha.getResponse();
        if (response.length == 0) {
            document.getElementsByClassName("g-recaptcha")[0].className = 'captcha-error';
        }
        else {
            showLoader("#loader");
            var emailUrl = APIURL + 'Notifications/Subscribe/' + email + '/' + globalSiteId
            getApiResults(emailUrl, getSubscriptionSuccess, getSubscriptionError, 'POST')
            grecaptcha.reset();
        }
    }
    else {
        document.getElementById("beachbuoy_email-input").className = 'beachbuoy_error-email-input';
    }
}

function unsubscribeSite(unsubscribeId) {
    //Production
    var unsubscribeUrl = APIURL + 'Notifications/Unsubscribe/' + unsubscribeId;
    //Development
    //var unsubscribeUrl = 'https://localhost:44358/api/v1.0/Notifications/Unsubscribe/' + unsubscribeId;
    getApiResults(unsubscribeUrl, getUnsubscribeSuccess, getUnsubscribeError, 'POST');
}

function unsubscribeAllSite(unsubscribeId) {
    var unsubscribeAllUrl = APIURL + 'Notifications/UnsubscribeAll/' + unsubscribeId;
    getApiResults(unsubscribeAllUrl, getUnsubscribeAllSuccess, getUnsubscribeAllError, 'POST')
}

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function handleChange() {
    document.getElementById("beachbuoy_email-input").className = 'beachbuoy_default-email-input';
}

function fillTodayIntervalsColor(allPeriods, start, end, counter) {
    var todayTimeIntervalColor = '';
    var lstCurrentInterval = [];

    for (var m = 0; m < allPeriods.length; m++) {
        if (moment(allPeriods[m].start).tz(TIMEZONE) >= start && moment(allPeriods[m].start).tz(TIMEZONE) < end) {
            todayTimeIntervalColor = allPeriods[m].spillcolor;
            if (todayTimeIntervalColor == SPILL) {
                lstCurrentInterval.push({
                    cellCheck: SPILL,
                    cellColor: SPILLCOLOR
                });
                break;
            }
            else if (todayTimeIntervalColor == NOSPILL) {
                lstCurrentInterval.push({
                    cellCheck: NOSPILL,
                    cellColor: NOSPILLCOLOR
                });
            }
        }
    }
    if (lstCurrentInterval.length == 0) {
        lstCurrentInterval.push({
            cellCheck: 'unknown',
            cellColor: UNKNOWNSPILLCOLOR
        });
    }

    for (var n = 0; n < lstCurrentInterval.length; n++) {
        if (lstCurrentInterval[n].cellCheck == SPILL) {
            tdCellColorToday[counter] = lstCurrentInterval[n];
            break;
        }
        else if (lstCurrentInterval[n].cellCheck == NOSPILL) {
            tdCellColorToday[counter] = lstCurrentInterval[n];
        }
        else {
            tdCellColorToday[counter] = lstCurrentInterval[n]
        }
    }
}

function onMarkerClick(marker) {
    document.getElementById("beachbuoy_div-email-success").className = "beachbuoy_div-feedback-box-hide";
    document.getElementById("beachbuoy_div-email-failure").className = "beachbuoy_div-feedback-box-hide";

    var objTblMarkersData = document.getElementById('beachbuoy_table-markers-data');
    objTblMarkersData.className = "beachbuoy_table-markers-data-show";

    for (i = 0; i < markers.length; i++) {
        markers[i].setVisible(false);
    }
    markers.length = 0;

    filterSpillData(marker.id);
    displayAssociatedMarkers(marker)

    lstToday.map(function (objDataToday) {
        var allSites = objDataToday.site;
        var allPeriods = objDataToday.periods;
        var siteId = allSites.id;
        var siteName = allSites.name;
        var currentSiteName = marker.title;
        var periodCounter = 0;
        tdCellColorToday = [];

        globalSiteId = marker.id;
        //------------------------ TODAY DATA LOGIC ------------------------------------------
        if (siteName === currentSiteName) {
            fillTodayIntervalsColor(allPeriods, startFirstPeriod, endFirstPeriod, periodCounter);
            periodCounter = periodCounter + 1;
            fillTodayIntervalsColor(allPeriods, endFirstPeriod, endSecondPeriod, periodCounter);
            periodCounter = periodCounter + 1;
            fillTodayIntervalsColor(allPeriods, endSecondPeriod, endThirdPeriod, periodCounter);
            periodCounter = periodCounter + 1;
            fillTodayIntervalsColor(allPeriods, endThirdPeriod, endForthPeriod, periodCounter);
            periodCounter = periodCounter + 1;
            fillTodayIntervalsColor(allPeriods, endForthPeriod, endFifthPeriod, periodCounter);
            periodCounter = periodCounter + 1;
            fillTodayIntervalsColor(allPeriods, endFifthPeriod, endSixthPeriod, periodCounter);
        }
        //------------------------ END OF TODAY DATA LOGIC ------------------------------------
        //------------------------ WEEKLY DATA LOGIC ------------------------------------------
        var tdCellColorWeekly = [];
        var tdCellDayWeekly = [];
        var currentId = '';
        var currentMarkerId = '';
        lstSiteDetailsWeekly.map(function (itemWeekly) {
            currentMarkerId = marker.id;
            currentId = itemWeekly.siteId;
            if (currentId === currentMarkerId) {
                tdCellColorWeekly.push(itemWeekly.cellColor);
                tdCellDayWeekly.push(itemWeekly.day);
                for (var i = 0; i <= (itemWeekly.length) / 6; i++) {
                    if (tdCellColorWeekly[i] === '' || tdCellColorWeekly[i] === 'undefined') {
                        tdCellColorWeekly[i] = UNKNOWNSPILLCOLOR;
                    }
                }
            }
        })
        //------------------------ END OF WEEKLY DATA LOGIC ---------------------------------
        // ------------------------DAYS OF WEEK HEADER CODE ---------------------------------
        var today = new Date();
        var currDay = parseInt(today.getDay());
        var sixDaysOfWeekHeader = [];
        for (var a = 0; a < daysofweek.length; a++) {
            if (currDay == 7) {
                currDay = 0;
            }
            sixDaysOfWeekHeader[a] = daysofweek[currDay];
            currDay += 1;
        }
        $('#lblFirstDayHeader').html(sixDaysOfWeekHeader[1]);
        $('#lblSecondDayHeader').html(sixDaysOfWeekHeader[2]);
        $('#lblThirdDayHeader').html(sixDaysOfWeekHeader[3]);
        $('#lblFourthDayHeader').html(sixDaysOfWeekHeader[4]);
        $('#lblFifthDayHeader').html(sixDaysOfWeekHeader[5]);
        $('#lblSixthDayHeader').html(sixDaysOfWeekHeader[6]);
        // -------------- END OF DAYS OF WEEK HEADER CODE -------------------------------
        // -------------- MARKER HEADER CODE --------------------------------------------
        $('#lblSiteName').html(marker.name).addClass('beachbuoy_information-panel-marker-heading');
        $('#lblToday').html('Today');
        // -------------- END OF MARKER HEADER CODE -------------------------------------
        // -------------- TIME INTERVALS HEADER TEXT CODE -------------------------------
        $('#lblFirstIntervalCheck').html(timingsofday[0]);
        $('#lblSecondIntervalCheck').html(timingsofday[1]);
        $('#lblThirdIntervalCheck').html(timingsofday[2]);
        $('#lblFourthIntervalCheck').html(timingsofday[3]);
        $('#lblFifthIntervalCheck').html(timingsofday[4]);
        $('#lblSixthIntervalCheck').html(timingsofday[5]);
        // -------------- END OF TIME INTERVALS HEADER TEXT CODE ------------------------
        // -------------- TIME INTERVALS COLOR CODE -------------------------------------
        if (tdCellColorToday[0] != null || tdCellColorToday[0] != undefined) {
            $('#tdFirstIntervalCheck').removeClass().addClass(tdCellColorToday[0].cellColor);
        }
        if (tdCellColorToday[1] != null || tdCellColorToday[1] != undefined) {
            $('#tdSecondIntervalCheck').removeClass().addClass(tdCellColorToday[1].cellColor);
        }
        if (tdCellColorToday[2] != null || tdCellColorToday[2] != undefined) {
            $('#tdThirdIntervalCheck').removeClass().addClass(tdCellColorToday[2].cellColor);
        }

        if (tdCellColorToday[3] != null || tdCellColorToday[3] != undefined) {
            $('#tdFourthIntervalCheck').removeClass().addClass(tdCellColorToday[3].cellColor);
        }
        if (tdCellColorToday[4] != null || tdCellColorToday[4] != undefined) {
            $('#tdFifthIntervalCheck').removeClass().addClass(tdCellColorToday[4].cellColor);
        }
        if (tdCellColorToday[5] != null || tdCellColorToday[5] != undefined) {
            $('#tdSixthIntervalCheck').removeClass().addClass(tdCellColorToday[5].cellColor);
        }
        // -------------- END OF TIME INTERVALS COLOR CODE -----------------------------
        // -------------- SIX DAYS HEADER TEXT CODE ------------------------------------
        $('#lblFirstDayWeekly').html(tdCellDayWeekly[0].currentDay);
        $('#lblSecondDayWeekly').html(tdCellDayWeekly[1].currentDay);
        $('#lblThirdDayWeekly').html(tdCellDayWeekly[2].currentDay);
        $('#lblFourthDayWeekly').html(tdCellDayWeekly[3].currentDay);
        $('#lblFifthDayWeekly').html(tdCellDayWeekly[4].currentDay);
        $('#lblSixthDayWeekly').html(tdCellDayWeekly[5].currentDay);
        // -------------- END OF SIX DAYS HEADER TEXT CODE -----------------------------
        // -------------- SIX DAYS HEADER CLASS CODE ------------------------------------
        $("tr.beachbuoy_information-panel-today").each(function () {
            $(this).addClass('beachbuoy_td-header-padding');
        });
        // -------------- END OF SIX DAYS HEADER CLASS CODE ----------------------------
        // -------------- SIX DAYS DATA COLOR CODE -------------------------------------
        if (tdCellColorWeekly[0] == null) { tdCellColorWeekly[0] = UNKNOWNSPILLCOLOR }
        $('#tdFirstDayColor').removeClass().addClass(tdCellColorWeekly[0]);
        if (tdCellColorWeekly[1] == null) { tdCellColorWeekly[1] = UNKNOWNSPILLCOLOR }
        $('#tdSecondDayColor').removeClass().addClass(tdCellColorWeekly[1]);
        if (tdCellColorWeekly[2] == null) { tdCellColorWeekly[2] = UNKNOWNSPILLCOLOR }
        $('#tdThirdDayColor').removeClass().addClass(tdCellColorWeekly[2]);
        if (tdCellColorWeekly[3] == null) { tdCellColorWeekly[3] = UNKNOWNSPILLCOLOR }
        $('#tdFourthDayColor').removeClass().addClass(tdCellColorWeekly[3]);
        if (tdCellColorWeekly[4] == null) { tdCellColorWeekly[4] = UNKNOWNSPILLCOLOR }
        $('#tdFifthDayColor').removeClass().addClass(tdCellColorWeekly[4]);
        if (tdCellColorWeekly[5] == null) { tdCellColorWeekly[5] = UNKNOWNSPILLCOLOR }
        $('#tdSixthDayColor').removeClass().addClass(tdCellColorWeekly[5]);
        //-------------- END OF SIX DAYS DATA COLOR CODE -------------------------------
        // -------------- NEXT RUN/LAST RUN CODE ---------------------------------------
        $('#lblLastUpdated').html('Last Updated On : ' + lastUpdate);
        $('#lblNextUpdate').html('Next Update Due : ' + nextUpdate);
        // -------------- END OF NEXT RUN/LAST RUN CODE ---------------------------------
    })
}

function displayMarkers() {
    markersDataFiltered.map(function (objData) {
        var siteReleaseMsg = objData.site.spillMessage;
        var siteIndex = 1;
        var imgIcon = blueIcon;
        // ---------------------- MAP SPILL ICON LOGIC ---------------------------------------------------------------------
        if (objData.site.siteIcon == "unverified") {
            siteIndex = 2;
            imgIcon = unverifiedIcon;
        }
        if (objData.site.siteIcon == "72") {
            siteIndex = 3;
            imgIcon = yellowIcon;
        }
        if (objData.site.siteIcon == "24") {
            siteIndex = 4;
            imgIcon = redIcon;
        }
        // ---------------------- END OF MAP SPILL ICON LOGIC --------------------------------------------------------------
       
        // init markers & set multiple marker
        var marker = new google.maps.Marker({
            key: objData.site.id,
            id: objData.site.id,
            position: new google.maps.LatLng(objData.site.latitude, objData.site.longitude),
            map: map,
            name: objData.site.name,
            title: objData.site.name,
            globalSiteId: objData.site.siteId,
            spillmsg: siteReleaseMsg,
            icon: imgIcon,
            reviewStatus: objData.site.reviewStatus,
            associatedSites: objData.associatedSites,
            zIndex: siteIndex
        });
        // process multiple info windows
        google.maps.event.addListener(marker, 'click', function () {

            // Notificaitons disabled 
            //infowindow.setContent('<div><h2>' + objData.site.name + '</h2><b>' + siteReleaseMsg + '</b></div >')

            // New Notification enabled
            infowindow.setContent('<div class="beachbuoy_marker-popup-header-style"><div>'
                + '<div><img src="' + imgIcon + '" ><h2 class="beachbuoy_heading_popup_style">' + objData.site.name + '</h2></div></div>'
                + '<div id="beachbuoy_marker-releasemsg" class="beachbuoy_marker-popup-releasemsg-style">' + siteReleaseMsg
                + ', ' + '<button id="SeeHistory" class="beachbuoy_map-popup-link-seeHistory" onClick="preFilterHistoryTable(\'' + objData.site.id + '\')">see history</button>.<br></div>'
                + '<button class="beachbuoy_btn btn-default beachbuoy_btn-add beachbuoy_marker-popup-button-style"'
                + 'onClick="openSignUpPopup(\'' + objData.site.name + '\')">Sign up for updates</button>'           //Old notification enabled
                + '</div >')

            infowindow.open(map, marker);
            onMarkerClick(marker);

        });
    });

    google.maps.event.addListener(infowindow, 'domready', function () {
        setInfoWindowBorderColor();
        grecaptcha.render('recaptcha', { 'sitekey': CAPTCHAKEY });
    });
}

function openSignUpPopup(siteName) {
    // Old Notification enabled
    infowindow.setContent('<div><h2 class="beachbuoy_heading_popup_style">' + siteName + '</h2><b>'
        + '</b><div class="beachbuoy_div-interested">Interested in this location?<br>'
        + 'Enter your email below to receive update alerts<br>'
        + 'Please refer to the section "Your Privacy" to understand how we handle your data</div>'
        + '<input class="beachbuoy_default-email-input" id="beachbuoy_email-input" onFocus=handleChange() type="email" placeholder=" example@domain.com" />'
        + '<div class= "g-recaptcha" data-sitekey="' + CAPTCHAKEY + '" id ="recaptcha"></div>'
        + '<button class="beachbuoy_btn btn-default beachbuoy_btn-add" onClick=addEmailSubscription()>Subscribe</button>'
        + '</div >')
}

function preFilterHistoryTable(areaid) {
    var filteredAssociatedSites = [];
    objDdlSiteName.value = areaid;
    objDdlActivity.value = "Header";

    filteredAssociatedSites = allAssociatedSites.filter(function (site) { return (site.refId == objDdlSiteName.value); });
    fillAssociatedSites(filteredAssociatedSites);

    var elementToView = document.getElementById("divSpillsPanelHeader");
    elementToView.scrollIntoView({ behavior: "smooth" });
    showFilteredHistoricSpills();
}

function setInfoWindowBorderColor() {
    if (infowindow.anchor.icon == blueIcon) {
        //Blue icon
        $('[role=dialog]').addClass('beachbuoy_marker-border-color-blue');
        $('[role=dialog]').removeClass('gm-style');
        $('[role=dialog]').removeClass('gm-style-iw');
    }
    else if (infowindow.anchor.icon == unverifiedIcon) {
        //Unverified
        $('[role=dialog]').addClass('beachbuoy_marker-border-color-grey');
        $('[role=dialog]').removeClass('gm-style');
        $('[role=dialog]').removeClass('gm-style-iw');
    }
    else if (infowindow.anchor.icon == redIcon) {
        //24 hours
        $('[role=dialog]').addClass('beachbuoy_marker-border-color-red');
        $('[role=dialog]').removeClass('gm-style');
        $('[role=dialog]').removeClass('gm-style-iw');
    }
    else if (infowindow.anchor.icon == yellowIcon) {
        //72 hours
        $('[role=dialog]').addClass('beachbuoy_marker-border-color-yellow');
        $('[role=dialog]').removeClass('gm-style');
        $('[role=dialog]').removeClass('gm-style-iw');
    }
}

function displayAssociatedMarkers(marker) {
    marker.associatedSites.map(function (objData) {
        var associatedIcon = outfall1_Icon;
        var aSiteIndex = 9995;
        if(objData.siteIcon == "unverified") {
            associatedIcon = outfall4_Icon;
            aSiteIndex = 9996;
        };
        if (objData.siteIcon == "72") {
            associatedIcon = outfall2_Icon;
            aSiteIndex =  9997;
        };
        if (objData.siteIcon == "24") {
            associatedIcon = outfall3_Icon;
            aSiteIndex = 9998;
        };
        if (objData.siteIcon == "undermaintenance") {
            associatedIcon = outfall5_Icon;
            aSiteIndex = 9999;
        };

        var associatedmarker = new google.maps.Marker({
            key: objData.associatedSiteID,
            id: objData.associatedSiteID,
            position: new google.maps.LatLng(objData.latitude, objData.longitude),
            map: map,
            name: objData.associatedSiteName,
            title: objData.associatedSiteName,
            icon: associatedIcon,
            zIndex: aSiteIndex
        });
        associatedmarker.siteId = objData.siteId;
        associatedmarker.setVisible(false);
        markers.push(associatedmarker);
    });
    for (i = 0; i < markers.length; i++) {
        markers[i].setVisible(true);
    }
}

function fillAllAreas(areasData) {
    ddlSiteNameOption = document.createElement("option");
    ddlSiteNameOption.text = "Select a bathing site";
    ddlSiteNameOption.value = "Header";
    objDdlSiteName.add(ddlSiteNameOption);

    for (var i = 0; i < areasData.length; i++) {
        ddlSiteNameOption = document.createElement("option");
        ddlSiteNameOption.text = areasData[i].name;
        ddlSiteNameOption.value = areasData[i].id;
        objDdlSiteName.add(ddlSiteNameOption);
    }
}

function fillAssociatedSites(associatedData) {
    objDdlAssociatedSiteName.innerHTML = "";
    ddlAssociatedSiteNameOption = document.createElement("option");

    ddlAssociatedSiteNameOption.text = "Select an outfall";
    ddlAssociatedSiteNameOption.value = "Header";
    objDdlAssociatedSiteName.add(ddlAssociatedSiteNameOption);

    for (var i = 0; i < associatedData.length; i++) {
        ddlAssociatedSiteNameOption = document.createElement("option");
        ddlAssociatedSiteNameOption.text = associatedData[i].name;
        ddlAssociatedSiteNameOption.value = associatedData[i].id;
        ddlAssociatedSiteNameOption.setAttribute("areaId", associatedData[i].refId);
        objDdlAssociatedSiteName.add(ddlAssociatedSiteNameOption);
    }
}

function showFilteredHistoricSpills() {
    $('#beachbuoy_table_box_native').empty();

    showLoader("#historicSpillsLoader");

    if (objDdlSiteName.value != "Header" && objDdlAssociatedSiteName.value == "Header" && objDdlActivity.value == "Header") {
        historicUrl = APIURL + "Spills/GetHistoricSpills?areaid=" + objDdlSiteName.value;
    }
    if ((objDdlSiteName.value == "Header" && objDdlAssociatedSiteName.value == "Header" && objDdlActivity.value == "Header")) {
        historicUrl = APIURL + "Spills/GetHistoricSpills";
    }
    if ((objDdlSiteName.value == "Header" && objDdlAssociatedSiteName.value != "Header" && objDdlActivity.value == "Header")) {
        historicUrl = APIURL + "Spills/GetHistoricSpills?associatedSiteId=" + objDdlAssociatedSiteName.value;
    }
    if ((objDdlSiteName.value == "Header" && objDdlAssociatedSiteName.value == "Header" && objDdlActivity.value != "Header")) {
        historicUrl = APIURL + "Spills/GetHistoricSpills?activity=" + objDdlActivity.value;
    }
    if ((objDdlSiteName.value != "Header" && objDdlAssociatedSiteName.value == "Header" && objDdlActivity.value != "Header")) {
        historicUrl = APIURL + "Spills/GetHistoricSpills?areaid=" + objDdlSiteName.value + "&activity=" + objDdlActivity.value;
    }
    if ((objDdlSiteName.value == "Header" && objDdlAssociatedSiteName.value != "Header" && objDdlActivity.value != "Header")) {
        historicUrl = APIURL + "Spills/GetHistoricSpills?associatedSiteId=" + objDdlAssociatedSiteName.value + "&activity=" + objDdlActivity.value;
    }
    if ((objDdlSiteName.value != "Header" && objDdlAssociatedSiteName.value != "Header" && objDdlActivity.value == "Header")) {
        historicUrl = APIURL + "Spills/GetHistoricSpills?areaid=" + objDdlSiteName.value + "&associatedSiteId=" + objDdlAssociatedSiteName.value;
    }
    if ((objDdlSiteName.value != "Header" && objDdlAssociatedSiteName.value != "Header" && objDdlActivity.value != "Header")) {
        historicUrl = APIURL + "Spills/GetHistoricSpills?areaid=" + objDdlSiteName.value + "&associatedSiteId=" + objDdlAssociatedSiteName.value + "&activity=" + objDdlActivity.value;
    }
    getApiResults(historicUrl, getFilteredHistoricSpillsSuccess, getHistoricError, 'GET');

    $('#beachbuoy_table_box_native').show();
    $('#beachbuoy_index_native').show();
}

function createPagingLinks(lstHistoricRecords) {
    var objdivTfoot = document.getElementById("beachbuoy_index_native");
    var pageCount = 0, currentPage = 0;

    pageCount = lstHistoricRecords.totalPages;
    currentPage = lstHistoricRecords.currentPage;

    $("#beachbuoy_index_native").empty();

    if (pageCount > 1) {
        var btnFirst = document.createElement('button');
        btnFirst.id = "btnFirst";
        btnFirst.innerHTML = "<i class='fas fa-angle-double-left'></i>";
        btnFirst.className = "btn btn-brand-light";
        btnFirst.addEventListener("click", function (event) { loadHistoricTableData("1"); });
        objdivTfoot.appendChild(btnFirst);

        var btnPrev = document.createElement('button');
        btnPrev.id = "btnPrev";
        btnPrev.innerHTML = "<i class='fas fa-angle-left'></i>";
        btnPrev.className = "btn btn-brand-light";
        btnPrev.addEventListener("click", function (event) { loadHistoricTableData((currentPage == 1 ? 1 : (currentPage - 1))); });
        objdivTfoot.appendChild(btnPrev);

        for (j = pageCount > 5 ? (currentPage == 1 || currentPage == 2) ? 1 : currentPage == pageCount ? (currentPage - 4) : currentPage == pageCount - 1 ? (currentPage - 3) : (currentPage - 2) : 1; j <= ((pageCount <= 5) ? pageCount : (currentPage == 1 || currentPage == 2) ? 5 : currentPage == pageCount ? pageCount : currentPage == pageCount - 1 ? (currentPage + 1) : (currentPage + 2)); j++) {
            var btnPageNumber = document.createElement("button");
            btnPageNumber.id = "button" + j;
            btnPageNumber.className = "btn btn-brand-light";
            btnPageNumber.innerHTML = j;
            btnPageNumber.addEventListener("click", function (event) {
                loadHistoricTableData(this.innerHTML);
            });
            objdivTfoot.appendChild(btnPageNumber);
        }

        var btnNext = document.createElement('button');
        btnNext.id = "btnNext";
        btnNext.innerHTML = "<i class='fas fa-angle-right'></i>";
        btnNext.className = "btn btn-brand-light";
        btnNext.addEventListener("click", function (event) { loadHistoricTableData((currentPage == pageCount ? pageCount : (currentPage + 1))); });
        objdivTfoot.appendChild(btnNext);

        var btnLast = document.createElement('button');
        btnLast.id = "btnLast";
        btnLast.innerHTML = "<i class='fas fa-angle-double-right'></i>";
        btnLast.className = "btn btn-brand-light";
        btnLast.addEventListener("click", function (event) { loadHistoricTableData(pageCount); });
        objdivTfoot.appendChild(btnLast);
    }

    if (btnFirst != null && btnPrev != null && btnNext != null && btnLast != null) {
        hideShowPagingLinks(currentPage, pageCount);
    }
}

function hideShowPagingLinks(currentPage, pageCount) {
    var firstPageBtn = document.getElementById("button1");
    if (firstPageBtn != null) {
        firstPageBtn.classList.add("beachbuoy_index_native-style-btn-active");
    }
    if (pageCount > 1 && currentPage == 1) {
        $('#btnFirst').hide();
        $('#btnPrev').hide();
    }
    else {
        $('#btnFirst').show();
        $('#btnPrev').show();
    }
    if (pageCount > 1 && currentPage == pageCount) {
        $('#btnNext').hide();
        $('#btnLast').hide();
    }
    else {
        $('#btnNext').show();
        $('#btnLast').show();
    }
}

function loadHistoricTableData(currentPageNo) {
    pageNo = currentPageNo;
    showLoader("#historicSpillsLoader");
    var filteredUrl = '';

    filteredUrl = historicUrl + "?page=" + pageNo;
    if (historicUrl.includes("?")) {
        filteredUrl = historicUrl + "&page=" + pageNo;
    }

    getApiResults(filteredUrl, getHistoricTableSuccess, getHistoricError, 'GET');
}

function clearHistoricSpillsFilter() {
    objDdlSiteName.selectedIndex = 0;
    fillAssociatedSites(getUniqueHistoricValues(allAssociatedSites));
    objDdlActivity.value = "Header";
    getAllHistoricSpills();
}

function getUniqueHistoricValues(data) {
    var result = [];
    var tempElement = '';
    for (var item = 0; item < data.length; item++) {
        if (data[item].id !== tempElement) {
            result.push({
                id: data[item].id,
                name: data[item].name
            });
            tempElement = data[item].id;
        }
    }
    return result;
}

objDdlSiteName.onchange = function () {
    var filteredAssociatedSites = [];
    if (objDdlSiteName.value == "Header") {
        filteredAssociatedSites = getUniqueHistoricValues(allAssociatedSites);
    }
    else {
        filteredAssociatedSites = allAssociatedSites.filter(function (site) { return (site.refId == objDdlSiteName.value); });
    }
    fillAssociatedSites(filteredAssociatedSites);
}

function reSubscribeUser(subscribeEmail, siteId) {
    $('#beachbuoy_div-email-failure').hide();
    showLoader("#loader");
    var reSubscribeurl = APIURL + 'Notifications/Subscribe/' + subscribeEmail + '/' + siteId
    getApiResults(reSubscribeurl, reSubscribeSuccess, reSubscribeError, 'POST');
}

// GENERIC API CALL  ----------------------------------------------
function getApiResults(apiUrl, successCallBack, errorCallBack, callType) {
    $.ajax({
        type: callType,
        url: apiUrl,
        headers: {
            'x-Gateway-APIKey': APIGWKEY
        },
        success: successCallBack,
        error: errorCallBack
    });
}

// API SUCCESS CALLBACKS  -----------------------------------------
function getSpillsSuccess(response) {
    markersDataFiltered = response.sitePeriods.map(function (item) {
        return {
            site: item.site, associatedSites: item.associatedSites
        };
    });

    markersResponseData = response;
    displayMarkers();

    hideLoader("#loader");
    hideLoader("#historicSpillsLoader");
    var objMapKey = document.getElementById('beachbuoy_div-floating-map-key');
    objMapKey.className = "beachbuoy_floating-map-key-style";
}

function getAssociatedAreasSuccess(response) {
    allAssociatedSites = response;
    fillAssociatedSites(getUniqueHistoricValues(response));
}

function getAreasSuccess(response) {
    fillAllAreas(response);
}

function getHistoricSpillsSuccess(response) {
    data = {
        "head": head,
        "body": response.items
    }
    create_historicspills_table(document.getElementById("beachbuoy_table_box_native"), data);
    createPagingLinks(response);
}

function reSubscribeSuccess(response) {
    $('#beachbuoy_div-email-failure').hide();
    hideLoader("#loader");
    var objSubscribeSuccess = document.getElementById('beachbuoy_div-email-success');
    objSubscribeSuccess.className = "beachbuoy_div-feedback-box-show";
    document.getElementById("beachbuoy_feedback-success-text").innerHTML = EMAIL_SUCCESS;

    objSubscribeSuccess.focus();
}

function getSubscriptionSuccess(response) {
    hideLoader("#loader");
    var objSubscribeSuccess = document.getElementById('beachbuoy_div-email-success');
    objSubscribeSuccess.className = "beachbuoy_div-feedback-box-show";
    document.getElementById("beachbuoy_feedback-success-text").innerHTML = EMAIL_SUCCESS;
    infowindow.close();

    objSubscribeSuccess.focus();
}

function getUnsubscribeSuccess(response) {
    var objUnsubscribeSuccess = document.getElementById('beachbuoy_div-email-success');
    objUnsubscribeSuccess.className = "beachbuoy_div-feedback-box-show";
    document.getElementById("beachbuoy_feedback-success-text").innerHTML = UNSUBSCRIBE_SUCCESS;
    infowindow.close();

    objUnsubscribeSuccess.focus();
}

function getUnsubscribeAllSuccess(response) {
    var objUnsubscribeSuccess = document.getElementById('beachbuoy_div-email-success');
    objUnsubscribeSuccess.className = "beachbuoy_div-feedback-box-show";
    document.getElementById("beachbuoy_feedback-success-text").innerHTML = UNSUBSCRIBEALL_SUCCESS;
    infowindow.close();

    objUnsubscribeSuccess.focus();
}

function getHistoricTableSuccess(response) {
    data = {
        "head": head,
        "body": response.items
    }
    create_historicspills_table(document.getElementById("beachbuoy_table_box_native"), data);
    createPagingLinks(response);

    var clickedBtn = "button" + pageNo;
    var objclickedBtn = document.getElementById(clickedBtn);
    if (objclickedBtn != null && pageNo != 1) {
        objclickedBtn.classList.add("beachbuoy_index_native-style-btn-active");
        $('#button1').removeClass("beachbuoy_index_native-style-btn-active");
    };

    hideLoader("#historicSpillsLoader");
}

function getFilteredHistoricSpillsSuccess(response) {
    data = {
        "head": head,
        "body": response.items
    }
    create_historicspills_table(document.getElementById("beachbuoy_table_box_native"), data);
    createPagingLinks(response);

    hideLoader("#historicSpillsLoader");
}

// API ERROR CALLBACKS --------------------------------------------
function getError(error) {
    console.log(error);
}

function getSpillsError(error) {
    console.log(error);
    hideLoader("#loader");
    hideLoader("#historicSpillsLoader");
}

function getSubscriptionError(error) {
    var objSubscribeFailure = document.getElementById('beachbuoy_div-email-failure');
    objSubscribeFailure.className = "beachbuoy_div-feedback-box-show";
    document.getElementById("beachbuoy_feedback-failure-text").innerHTML = EMAIL_FAILURE;
    infowindow.close();
    objSubscribeFailure.focus();
}

function getUnsubscribeError(error) {
    var objUnsubscribeFailure = document.getElementById('beachbuoy_div-email-failure');
    objUnsubscribeFailure.className = "beachbuoy_div-feedback-box-show";
    document.getElementById("beachbuoy_feedback-failure-text").innerHTML = error.responseJSON.error.message;
    infowindow.close();
    objUnsubscribeFailure.focus();
}

function getUnsubscribeAllError(error) {
    var objUnsubscribeFailure = document.getElementById('beachbuoy_div-email-failure');
    objUnsubscribeFailure.className = "beachbuoy_div-feedback-box-show";
    document.getElementById("beachbuoy_feedback-failure-text").innerHTML = UNSUBSCRIBEALL_FAILURE;
    infowindow.close();
    objUnsubscribeFailure.focus();
}

function reSubscribeError(error) {
    var objUnsubscribeFailure = document.getElementById('beachbuoy_div-email-failure');
    objUnsubscribeFailure.className = "beachbuoy_div-feedback-box-show";
    document.getElementById("beachbuoy_feedback-failure-text").innerHTML = error.responseJSON.error.message;
    infowindow.close();
    objUnsubscribeFailure.focus();
}

function getHistoricError(error) {
    $("#beachbuoy_index_native").empty();
    console.log(error);
    hideLoader("#historicSpillsLoader");
}

// LOADER FUNCTIONS -----------------------------------------------
function showLoader(elementId) {
    document.querySelector(elementId).style.display = "flex";
}

function hideLoader(elementId) {
    document.querySelector(elementId).style.display = "none";
}

