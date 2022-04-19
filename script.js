/*
DONE
X EndAnimationCallback qui ne marche pas
X Trigger redraw while resizing: done with a delay ?
X Automatiser pour tourner sur tous lesm odèles d'une org
X Garder les paramètres de caméra depuis un modèle à l'autre
X Uniformiser les post processing settings
TODO
* Utiliser un cookie pour le API token ?
* Better trigger redraw lors du change d'HDR
* Passer les paramètres de caméra via url

file:///C:/Users/loicn/Desktop/SketchfabLookDevApp/index.html?uid=7786614de739435d8b29221628b9703b&camfov=55&campos=0,1,3.545&camlook=0,0,0&screenshot&screenshotx=1280&screenshoty=720&hdr=1&hdrshadows=1&hdrexposure=2&hdrlightintensity=3&hdrrotation=90&hdruid=toto&pp=1&ssr=1&ssao=1

file:///C:/Users/loicn/Desktop/SketchfabLookDevApp/index.html?uid=7786614de739435d8b29221628b9703b&camfov=55&campos=-7,-17,4&camlook=-12,-3,0&screenshot&screenshotx=1280&screenshoty=720&hdr=1&hdrshadows=1&hdrexposure=2&hdrlightintensity=3&hdrrotation=90&hdruid=toto&pp=1&ssr=1&ssao=1

*/

var uid      = "7786614de739435d8b29221628b9703b";
var orgUid   = "68d3d5b619d64fc6950fb45303afcf57";
var projectUid = "311876f74d844395b348818cd43905ce";
var apiToken = ""; // FEEL FREE TO PUT YOURS HERE TO AVOIR ITERATING, better with a cookie ideally
var currentHDRUid = "";
var automated = false;
var uidsToProcess = []
var postProcessingSettings = {}

// Sketchfab API settings
var iframe = document.getElementById( 'api-frame' );
var client = new Sketchfab( iframe );
var API = undefined;

// HTML elements
const settingsUid      = document.getElementById("settings-uid");
const settingsAPIToken = document.getElementById("settings-token");
const settingsNone     = document.getElementById("settings-none");
const settingsSSAO     = document.getElementById("settings-ssao");
const settingsSSR      = document.getElementById("settings-ssr");
const settingsHDREnable    = document.getElementById("settings-hdr-enable");
const settingsHDRId        = document.getElementById("settings-hdr-id");
const settingsHDRRotation  = document.getElementById("settings-hdr-rotation");
const settingsHDRExposure  = document.getElementById("settings-hdr-exposure");
const settingsHDRShadows   = document.getElementById("settings-hdr-enable-shadows");
const settingsHDRIntensity = document.getElementById("settings-hdr-intensity");
const settingsHDRRotationText  = document.getElementById("settings-hdr-rotation-text");
const settingsHDRExposureText  = document.getElementById("settings-hdr-exposure-text");
const settingsHDRIntensityText = document.getElementById("settings-hdr-intensity-text");
const camFOV     = document.getElementById("camera-fov");
const camFOVText = document.getElementById("camera-fov-text");
const camX       = document.getElementById("camera-x");
const camY       = document.getElementById("camera-y");
const camZ       = document.getElementById("camera-z");
const lookX      = document.getElementById("look-x");
const lookY      = document.getElementById("look-y");
const lookZ      = document.getElementById("look-z");

const overlay                = document.getElementById("overlay");
const overlayToggle          = document.getElementById("overlay-toggle");
const overlayToggleIcon      = document.getElementById("overlay-toggle-icon");
const overlaySettingsContent = document.getElementById("overlay-settings-content");
const overlaySettingsTitle   = document.getElementById("overlay-settings-title");
const overlayScreenshotContent    = document.getElementById("overlay-screenshot-content");
const overlayScreenshotTitle      = document.getElementById("overlay-screenshot-title");
const overlayBatchContent    = document.getElementById("overlay-batch-content");
const overlayBatchTitle      = document.getElementById("overlay-batch-title");

const loadJSON = document.getElementById("load-json");
const saveJSON = document.getElementById("save-json");

const screenshot              = document.getElementById("screenshot");
const screenshotAll           = document.getElementById("screenshot-all");
const screenshotX             = document.getElementById("screenshot-resolution-x");
const screenshotY             = document.getElementById("screenshot-resolution-y");
const screenshotPostProcess   = document.getElementById("screenshot-postprocess");
const screenshotCamera        = document.getElementById("screenshot-camera");
const screenshotHDR           = document.getElementById("screenshot-hdr");
const screenshotModelSelector = document.getElementById("screenshot-models");
const screenshotPrefix        = document.getElementById("screenshot-prefix");
const screenshotNaming        = document.getElementById("screenshot-naming-method");
const modelsList              = document.getElementById("models-list");




// APP settings to sync from and to
BackendSettings = {
    "apitoken": "",
    "modeluid": "",
    "pp": {
        "none": true,
        "ssao": true,
        "ssr": true,
    },
    "hdr":{
        "enabled": true,
        "uid": "",
        "rotation": 0,
        "exposure": 1,
        "shadows": true,
        "intensity": 1,
    },
    "cam":{
        "fov": 45,
        "pos": [10,10,10],
        "look": [0,0,0]
    },
    "screenshot":{
        "x": 1920,
        "y": 1200,
    },
    "batch":{
        "usepp": true,
        "usecam": true,
        "usehdr": true,
        "prefix": "Sketchfab",
        "format": "epoch",
    }
}

function parseJSONintoBackendSettings(){}

function updateUIFromBackendSettings(_settings = []){
    if(_settings.length == 0){
        _settings = ["apitoken", "modeluid", "hdr", "pp", "cam", "screenshot", "batch"];
    }
    _settings.forEach(function(_elt){
        if(_elt in BackendSettings){
            
        }
    });
}



/*
function passwordInput(){};
function textInput(){};
function collapsible(){};
function subTitle(){};
function checkbox(){};
function select(){};

var UI = [
    {"class": passwordInput, "name" : "API Token", },
    {"class": textInput,     "name" : "Model UID", },
    {"class": collapsible,   "name" : "View settings", "items": [
        {"class": subTitle,  "name" : "Post-process", },
        {"class": checkbox,  "name" : "None", },
        {"class": checkbox,  "name" : "SSAO", },
        {"class": checkbox,  "name" : "SSR", },
        {"class": subTitle,  "name" : "HDRi", },
        {"class": checkbox,  "name" : "Enabled", },
        {"class": select,    "name" : "Enabled", },

    ]},
    
]
*/




// Wrappers around some Skeftchfab functions
function API_Screenshot(_args = {}, _callback=undefined){
    /* args = {
        "delay": 2000,
        "width": 1920,
        "height": 1200,
        "name": "ANiceScreen",
        "prefix": "ComesBefore",
        "suffix": "epoch",
        "format": "image/png",

    }*/

    console.log(_args)

    // Create a timeout wrapper if needed
    _delayWrapper = ("delay" in _args && _args["delay"] != 0) ? (f) => { setTimeout(f, _args["delay"]); } : (f) => {f};
    // Parse the other arguments
    _width  = ("width" in _args) ? _args["width"]  : 1920;
    _height = ("height" in _args) ? _args["height"] : 1200;
    _name   = ("name" in _args) ? _args["name"]   : "Screenshot";
    if("prefix" in _args && "suffix" in _args){
        _name   = _args["prefix"] != "" ? _args["prefix"] : "Screenshot";
        _suffix = _args["suffix"] == "epoch" ? Date.now().toFixed(0) : _args["suffix"];
        _name   = _name + "_" + _suffix;
    }
    _format = ("format" in _args) ? _args["format"] : "image/png";
    _ext = _format.includes("png") ? ".png" : ".jpg";
    _path = _name + _ext;

    _delayWrapper(function(){
        API.getScreenShot(_width, _height, _format, function (err, result) {
            if(_callback == undefined || _callback.length == 0){
                var _anchor = document.createElement('a');
                _anchor.href = result;
                _anchor.download = _path;
                _anchor.click();
                _anchor.remove();
            }
            // Launch the callback
            if(_callback != undefined) _callback(result);
        });
    });
}



// HTTP request
function request(url, callback)
{
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() { 
        if (req.readyState == 4){
            if(req.status == 200) callback(JSON.parse(req.responseText));
            else console.log("Request failed", req);
        }
    }
    if(apiToken!=""){
        if(url.includes("?")) url = url + "&token=" + apiToken;
        else url = url + "?token=" + apiToken;
    }
    req.open("GET", url, true);
    req.send(null);
}
// URL parameters parsing
function getAllUrlParams(url) {

    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
  
    // we'll store the parameters here
    var obj = {};
  
    // if query string exists
    if (queryString) {
  
      // stuff after # is not part of query string, so get rid of it
      queryString = queryString.split('#')[0];
  
      // split our query string into its component parts
      var arr = queryString.split('&');
  
      for (var i = 0; i < arr.length; i++) {
        // separate the keys and the values
        var a = arr[i].split('=');
  
        // set parameter name and value (use 'true' if empty)
        var paramName = a[0];
        var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
  
        // (optional) keep case consistent
        paramName = paramName.toLowerCase();
        if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
  
        // if the paramName ends with square brackets, e.g. colors[] or colors[2]
        if (paramName.match(/\[(\d+)?\]$/)) {
  
          // create key if it doesn't exist
          var key = paramName.replace(/\[(\d+)?\]/, '');
          if (!obj[key]) obj[key] = [];
  
          // if it's an indexed array e.g. colors[2]
          if (paramName.match(/\[\d+\]$/)) {
            // get the index value and add the entry at the appropriate position
            var index = /\[(\d+)\]/.exec(paramName)[1];
            obj[key][index] = paramValue;
          } else {
            // otherwise add the value to the end of the array
            obj[key].push(paramValue);
          }
        } else {
          // we're dealing with a string
          if (!obj[paramName]) {
            // if it doesn't exist, create property
            obj[paramName] = paramValue;
          } else if (obj[paramName] && typeof obj[paramName] === 'string'){
            // if property does exist and it's a string, convert it to an array
            obj[paramName] = [obj[paramName]];
            obj[paramName].push(paramValue);
          } else {
            // otherwise add the property
            obj[paramName].push(paramValue);
          }
        }
      }
    }
  
    return obj;
}

// Sketchfab API
var initOptions = {
    success: initSuccess,
    error: initError,
    autostart : 1,
    camera: 0,
    ui_stop: 0,
    ui_animations:0,
    ui_fullscreen:1,
    ui_help:0,
    ui_hint:0,
    ui_infos:0,
    ui_settings:0,
    ui_start:0,
    ui_ar:0,
    ui_vr:0,
}

// Parse the API parameters
function parseUrlOptions(opts){

    newOpts = {}

    // Are there any options ?
    newOpts["parsed"] = window.location.href.includes("?");

    function param(p, type="str", rm=true){

        var R = undefined;

        if(type == "str"){
            R = opts[p];
        }
        else if(type == "bool"){
            R = ((opts[p] == "") || (opts[p] == "1") || (opts[p] == "true"));
        }
        else if(type == "int"){
            R = parseInt(opts[p]);
        }
        else if(type == "float"){
            R = parseFloat(opts[p]);
        }
        else if(type.includes("array")){
            var arr = opts[p].split(",");
            R = [];
            if(type == "intarray") arr.forEach((elt) => { R.push(parseInt(elt)); });
            if(type == "floatarray") arr.forEach((elt) => { R.push(parseFloat(elt)); });
            if(type == "strarray") arr.forEach((elt) => { R.push(elt); });
        }

        if(rm) delete opts[p];

        return R;
    }

    // uid and apitoken
    if("uid" in opts){uid = param("uid", "str"); newOpts["uid"] = uid}
    if("token" in opts){ tk = param("token", "str"); if(tk.length == 32) apiToken = tk; }

    // Camera settings
    camOpts = {}
    if("campos" in opts && "camlook" in opts){
        camOpts["pos"] = param("campos", "floatarray");
        camOpts["look"] = param("camlook", "floatarray");
    }
    if("camfov" in opts){
        camOpts["fov"] = param("camfov", "float");
    }
    newOpts["cam"] = camOpts;

    // Screenshot options
    screenshotOpts = {}
    if("screenshot" in opts){
        screenshotOpts["do"] = true;
        if("screenshotx" in opts && "screenshoty" in opts){
            screenshotOpts["x"] = param("screenshotx", "int");
            screenshotOpts["y"] = param("screenshoty", "int");
        }
    }
    newOpts["screenshot"] = screenshotOpts;

    // HDR options
    hdrOpts = {}
    if("hdr" in opts){
        hdrOpts["enable"] = param("hdr", "bool");
        if("hdrshadows" in opts){ hdrOpts["shadowEnabled"] = param('hdrshadows', "bool"); }
        if("hdrexposure" in opts){ hdrOpts["exposure"] = param('hdrexposure', "float"); }
        if("hdrlightintensity" in opts){ hdrOpts["lightIntensity"] = param('hdrlightintensity', "float"); }
        if("hdrrotation" in opts){ hdrOpts["rotation"] = param("hdrrotation", "float") }
        if("hdruid" in opts){ hdrOpts["uid"] = param("hdruid"); }
    }
    newOpts["hdr"] = hdrOpts;

    // Post Process options
    ppOpts = {}
    if("pp" in opts) ppOpts["enable"] = param("pp", "bool");
    if("ssr" in opts) ppOpts["ssrEnable"] = param("ssr", "bool");
    if("ssao" in opts) ppOpts["ssaoEnable"] = param("ssao", "bool");
    newOpts["pp"] = ppOpts;

    return newOpts;
}

urlOptions = parseUrlOptions(getAllUrlParams());
console.log("url options:", urlOptions);

client.init( uid, initOptions );

function initSuccess(api){
    API = api;
    api.start();
    api.addEventListener( 'viewerready', onViewerReady);
}
function initError() {
    console.log( 'Viewer error' );
}






function onViewerReady(){

    API.addEventListener('camerastop', onCameraEndMovement );

    if(apiToken != ""){settingsAPIToken.value = apiToken;}
    if(uid != ""){settingsUid.value = uid;}

    function doScreenShotAndMoveOn(){
        
        setTimeout(function(){
            API_Screenshot(
                {width: screenshotX.value, height: screenshotY.value, delay: 2000, prefix: "Screenshot", suffix: uid},
                () => {
                    if(automated){
                        document.getElementById("status-"+uid).className = "fa fa-check";
                        document.getElementById("status-"+uid).style.color = "greenyellow";
                        processNextModel();
                    }
                }
            );
            settingsHDRRotation.dispatchEvent(new Event('input'));
        }, 500)
    }

    if(!automated){
        var hasUrlOptions = urlOptions["parsed"];
        if(hasUrlOptions){

            var postProcessingOptions = urlOptions["pp"];
            var HDROptions = urlOptions["hdr"];
            var screenshotOptions = urlOptions["screenshot"];
            var camOptions = urlOptions["cam"];
            
            console.log("pp", postProcessingOptions);
            console.log("hdr", HDROptions);
            console.log("screen", screenshotOptions);
            console.log("cam", camOptions);

            API.setPostProcessing(
                postProcessingOptions,
                function(){
                    console.log("Setting hdr options after parsing url options", HDROptions);
                    API.setEnvironment(HDROptions, function(){
                        if(("look" in camOptions) && ("pos" in camOptions)){
                            API.setCameraLookAt(camOptions["pos"], camOptions["look"], 0, function(){
                                if("fov" in camOptions) API.setFov(camOptions["fov"]);
                                doScreenShotAndMoveOn();
                            });
                        }
                        else{
                            if("fov" in camOptions) API.setFov(camOptions["fov"]);
                            doScreenShotAndMoveOn();
                        }
                    });
                }
            );
        }
        else{
            updateDefaultPostProcess();
            updateAvailableEnvironments();
            API.getFov(function(err, fov){camFOV.value = fov; camFOVText.innerHTML = (fov*1.).toFixed(1) + " °"});
        }
    }
    else{
        var postProcessingOptions = screenshotPostProcess.checked ? {
            enable: !settingsNone.checked,
            ssaoEnable: settingsSSAO.checked,
            ssrEnable: settingsSSR.checked
        } : {};
        if(screenshotPostProcess.checked){
            postProcessingOptions = postProcessingSettings;
        }

        var HDROptions = screenshotHDR.checked ? {
            enabled: settingsHDREnable.checked,
            exposure: settingsHDRExposure.value,
            lightIntensity: settingsHDRIntensity.value,
            //blur: 0,
            shadowEnabled: settingsHDRShadows.checked,
            rotation: settingsHDRRotation.value,
        } : {};
        var selectedUidIfAny = settingsHDRId.options[settingsHDRId.selectedIndex];
        if(screenshotHDR.checked && selectedUidIfAny!=undefined && selectedUidIfAny.value != ""){
            console.log("Doing a uid set")
            HDROptions.uid = selectedUidIfAny.value;
        }
        
        API.setPostProcessing(
            postProcessingOptions,
            function(){
                API.setEnvironment(HDROptions, function(){
                    if(screenshotCamera.checked){
                        position = [camX.value, camY.value, camZ.value]
                        target = [lookX.value, lookY.value, lookZ.value]
                        API.setCameraLookAt(position, target, 0, function(){
                            API.setFov(camFOV.value);
                            doScreenShotAndMoveOn();
                        });
                    }
                    else{
                        doScreenShotAndMoveOn();
                    }
                });
            }
        );

    }
}


// *************************************************
// FUNCTIONS
// *************************************************

function updateDefaultPostProcess(){
    API.getPostProcessing(function(settings) {
        settingsNone.checked = !settings.enable;
        settingsSSAO.checked = settings.ssaoEnable;
        settingsSSR.checked = settings.ssrEnable;
        window.console.log("Default post-processing:", settings);
    });
}
function setEnvironmentSettings(){
    settingsHDRRotationText.innerHTML = (settingsHDRRotation.value*180/3.14159).toFixed(1) + " °";
    settingsHDRExposureText.innerHTML = settingsHDRExposure.value;
    settingsHDRIntensityText.innerHTML = settingsHDRIntensity.value;
    options = {
        enabled: settingsHDREnable.checked,
        exposure: settingsHDRExposure.value,
        lightIntensity: settingsHDRIntensity.value,
        //blur: 0,
        shadowEnabled: settingsHDRShadows.checked,
        rotation: settingsHDRRotation.value,
    }

    var selectedUidIfAny = settingsHDRId.options[settingsHDRId.selectedIndex];
    if(apiToken.length == 32 && selectedUidIfAny!=undefined && selectedUidIfAny.value != ""){
        options["uid"] = selectedUidIfAny.value;
    }

    API.setEnvironment(options);
}
function updateAvailableEnvironments(){
    settingsHDRId.innerHTML = "";
    API.getEnvironment(function(err, envInfo) {
        if (!err) {
            console.log("Current environment:", envInfo);
            settingsHDREnable.checked = envInfo.enabled;
            settingsHDRRotation.value = envInfo.rotation;
            settingsHDRExposure.value = envInfo.exposure;
            settingsHDRShadows.checked = envInfo.shadowEnabled;
            settingsHDRIntensity.value = envInfo.lightIntensity;
            settingsHDRRotationText.innerHTML = (settingsHDRRotation.value*180/3.14159).toFixed(1) + " °";
            settingsHDRExposureText.innerHTML = settingsHDRExposure.value;
            settingsHDRIntensityText.innerHTML = settingsHDRIntensity.value;
        }
    });
    request("https://sketchfab.com/v3/orgs/" + orgUid + "/environments", function(r){ 
        let defaultEnv = new Option("", "", true, true);
        settingsHDRId.appendChild(defaultEnv);
        r["results"].forEach(elt => {

            isAlreadySelected = (currentHDRUid.length == 32) && (elt["uid"] == currentHDRUid);

            let currentEnv = new Option(elt["name"], elt["uid"], isAlreadySelected, isAlreadySelected);
            settingsHDRId.appendChild(currentEnv);
        });
    })
}
function setCameraParameters(){
    position = [camX.value, camY.value, camZ.value]
    target = [lookX.value, lookY.value, lookZ.value]
    API.setCameraLookAt(position, target, 0);
}
function onCameraEndMovement(err){
    if(!automated){
        if(!err){
            API.getCameraLookAt(function(err2, camera) {
                if(!err2){
                    camX.value = camera.position[0];
                    camY.value = camera.position[1];
                    camZ.value = camera.position[2];
                    lookX.value = camera.target[0];
                    lookY.value = camera.target[1];
                    lookZ.value = camera.target[2];
                }
                else{
                    console.log(err2);
                }
            });
        }
        else{
            console.log(err);
        }
    }
}
function loadParametersFromJSON(){
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => { 
        var file = e.target.files[0]; 
        var reader = new FileReader();
        reader.readAsText(file,'UTF-8');
        reader.onload = readerEvent => {
            var data = JSON.parse(readerEvent.target.result);
            
            // Parse the data into the UI values
            settingsUid.value = data.uid
            settingsNone.checked = data.postprocessNone;
            settingsSSAO.checked = data.postprocessSSAO;
            settingsSSR.checked = data.postprocessSSR;
            settingsHDREnable.checked = data.hdrEnabled;
            settingsHDRRotation.value = data.hdrRotation;
            settingsHDRExposure.value = data.hdrExposure;
            settingsHDRShadows.checked = data.hdrShadowsEnabled;
            settingsHDRIntensity.value = data.hdrIntensity;
            camFOV.value = data.cameraFOV;
            camX.value = data.cameraPosition[0];
            camY.value = data.cameraPosition[1];
            camZ.value = data.cameraPosition[2];
            lookX.value = data.cameraTarget[0];
            lookY.value = data.cameraTarget[1];
            lookZ.value = data.cameraTarget[2];
            settingsHDRId.value = data.hdrSelectedUid; // Special case for the uid (needs to be laoded first)

            // call the API to make the appropriate changes on settings, camera...
            settingsUid.dispatchEvent(new Event('input', {}));
            setCameraParameters();
            setTimeout(
                function(){
                    settingsHDRRotation.dispatchEvent(new Event('input')); // Force update of the env
                    setTimeout(
                        function(){
                            settingsHDRRotation.dispatchEvent(new Event('input')); // Force update of the env
                        }, 100);
                },
                100
            );
            API.setFov(camFOV.value);
            camFOVText.innerHTML = (camFOV.value*1.).toFixed(1) + " °";
        }
    }
    input.click();
}
function saveParametersToJSON(){
    settings = {
        "uid": settingsUid.value,
        "postprocessNone": settingsNone.checked,
        "postprocessSSAO": settingsSSAO.checked,
        "postprocessSSR": settingsSSR.checked,
        "hdrEnabled": settingsHDREnable.checked,
        "hdrSelectedUid": settingsHDRId.options[settingsHDRId.selectedIndex].value,
        "hdrRotation": settingsHDRRotation.value,
        "hdrExposure": settingsHDRExposure.value,
        "hdrShadowsEnabled": settingsHDRShadows.checked,
        "hdrIntensity": settingsHDRIntensity.value,
        "cameraFOV": camFOV.value,
        "cameraPosition": [camX.value, camY.value, camZ.value],
        "cameraTarget": [lookX.value, lookY.value, lookZ.value],
    }
    var anchor = document.createElement('a');
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings));
    anchor.href = dataStr;
    anchor.download = "Sketchfab_" + Date.now().toFixed(0) + ".json";
    anchor.click();
    anchor.remove();
}
function processNextModel(){
    keys = Object.keys(uidsToProcess)
    if(keys.length == 0){
        console.log("Done processing models");
        automated = false;
    }
    else{
        automated=true;
        uid = keys[0];
        console.log("Processing model " + uid);
        client = new Sketchfab( iframe )
        client.init(uid, initOptions);
        document.getElementById("status-"+uid).className = "fa fa-spinner fa-spin";
        document.getElementById("status-"+uid).style.color = "white";
        delete uidsToProcess[uid];
    }
}

// *************************************************
// CALLBACKS
// *************************************************

// Settings callbacks
// Post processes
settingsNone.addEventListener("change", function(){ API.setPostProcessing({enable: !settingsNone.checked}, function() {}); });
settingsSSAO.addEventListener("change", function(){ API.setPostProcessing({enable: true, ssaoEnable: settingsSSAO.checked}, function() {}); });
settingsSSR.addEventListener( "change", function(){ API.setPostProcessing({enable: true, ssrEnable: settingsSSR.checked}, function() {}); });
// HDR
settingsHDRId.addEventListener("change", function(){setEnvironmentSettings(); settingsHDRRotation.dispatchEvent(new Event('input'));});
settingsHDREnable.addEventListener("change", setEnvironmentSettings);
settingsHDRShadows.addEventListener("change", setEnvironmentSettings);
settingsHDRRotation.addEventListener("input", setEnvironmentSettings);
settingsHDRExposure.addEventListener("input", setEnvironmentSettings);
settingsHDRIntensity.addEventListener("input", setEnvironmentSettings);
// Camera
camFOV.addEventListener("input", function(){ API.setFov(camFOV.value); camFOVText.innerHTML = (camFOV.value*1.).toFixed(1) + " °"; });
camX.addEventListener("change", setCameraParameters);
camY.addEventListener("change", setCameraParameters);
camZ.addEventListener("change", setCameraParameters);
lookX.addEventListener("change", setCameraParameters);
lookY.addEventListener("change", setCameraParameters);
lookZ.addEventListener("change", setCameraParameters);

// Screenshot
screenshot.addEventListener("click", () => { API_Screenshot({delay:200, width: screenshotX.value, height: screenshotY.value}) });
screenshotAll.addEventListener("click", function(){
    screenshotModelSelector.dispatchEvent(new Event('change'));
    if(screenshotModelSelector.selectedIndex!=0){
        setTimeout(function(){
            API.getPostProcessing(function(_settings) {
                postProcessingSettings = _settings;
                processNextModel();
            });
        }, 500);
    }
    else{
        console.log("Select models to screenshot first");
    }
});

// Parameters
loadJSON.addEventListener("click", loadParametersFromJSON);
saveJSON.addEventListener("click", saveParametersToJSON);

// Model UID
settingsUid.addEventListener("input", function(e){
    if(settingsUid.value.length == 32){
        currentHDRUid = "";
        client.init( settingsUid.value, initOptions );
    }
})

// API token
settingsAPIToken.addEventListener("change", function(){
    val = settingsAPIToken.value;
    if(val.length == 32 && apiToken.length != 32){
        apiToken = val;
    } 
    updateAvailableEnvironments();
})

// Pure UI callbacks
overlayToggle.addEventListener("click", function(){
    if(overlayToggle.className == "open"){
        overlayToggle.className = "closed";
        overlay.style.opacity = 0;
        overlayToggleIcon.className = "fa fa-bars";
        setTimeout(function(){overlay.style.display = "none";}, 200);
    }
    else{
        overlay.style.display = "inline";
        overlayToggle.className = "open";
        overlay.style.opacity = 1;
        overlayToggleIcon.className = "fa fa-times";
    }
});

overlaySettingsTitle.addEventListener("click", function(){
    if(overlaySettingsContent.style.display != "none"){
        overlaySettingsContent.style.display = "none";
        overlaySettingsTitle.getElementsByClassName("fa")[0].className = "fa fa-chevron-down";
    }
    else{
        overlaySettingsContent.style.display = "inline";
        overlaySettingsTitle.getElementsByClassName("fa")[0].className = "fa fa-chevron-up";
    }
});
overlayBatchTitle.addEventListener("click", function(){
    if(overlayBatchContent.style.display != "none"){
        overlayBatchContent.style.display = "none";
        overlayBatchTitle.getElementsByClassName("fa")[0].className = "fa fa-chevron-down";
    }
    else{
        overlayBatchContent.style.display = "inline";
        overlayBatchTitle.getElementsByClassName("fa")[0].className = "fa fa-chevron-up";
    }
});
overlayScreenshotTitle.addEventListener("click", function(){
    if(overlayScreenshotContent.style.display != "none"){
        overlayScreenshotContent.style.display = "none";
        overlayScreenshotTitle.getElementsByClassName("fa")[0].className = "fa fa-chevron-down";
    }
    else{
        overlayScreenshotContent.style.display = "inline";
        overlayScreenshotTitle.getElementsByClassName("fa")[0].className = "fa fa-chevron-up";
    }
});

function addUidToList(uid){
    var modelLine = document.createElement("div");
    var modelUid = document.createElement("span");
    modelUid.className = "model-uid";
    modelUid.innerHTML = uid;
    var modelIcon = document.createElement("i");
    modelIcon.className = "fa fa-times";
    modelIcon.style.color = "red";
    modelIcon.id = "status-"+uid;
    modelLine.appendChild(modelUid);
    modelLine.appendChild(modelIcon);
    return modelLine;
}

screenshotModelSelector.addEventListener("change", function(){

    index = screenshotModelSelector.selectedIndex;
    value = screenshotModelSelector.options[index].value;
    
    screenshotAll.setAttribute("disabled", false);
    //automated = true;
    uidsToProcess = []
    modelsList.innerHTML = "";

    if(value == "org"){
        request("https://sketchfab.com/v3/orgs/" + orgUid + "/models", function(r){
            r["results"].forEach(function(model){
                _uid = model["uid"];
                uidsToProcess[_uid] = model;
                modelsList.appendChild(addUidToList(_uid));
            });
            screenshotAll.removeAttribute("disabled");
        });
    }
    else if(value == "project"){
        request("https://sketchfab.com/v3/orgs/" + orgUid + "/models?projects=" + projectUid, function(r){
            r["results"].forEach(function(model){
                _uid = model["uid"];
                uidsToProcess[_uid] = model;
                modelsList.appendChild(addUidToList(_uid));
            });
            screenshotAll.removeAttribute("disabled");
        });
    }
    else if(value == "csv"){
        var input = document.createElement('input');
        input.type = 'file';
        input.onchange = e => { 
            var file = e.target.files[0]; 
            var reader = new FileReader();
            reader.readAsText(file,'UTF-8');
            reader.onload = readerEvent => {

                var data = readerEvent.target.result;
                data = data.replaceAll("\n","").replaceAll("\r","").replaceAll(" ","");
                parsedUids = data.split(",");
                console.log("Parsed csv", parsedUids);

                screenshotAll.removeAttribute("disabled");
                uidsToProcess = []
                modelsList.innerHTML = "";

                parsedUids.forEach(function(_uid){
                    _uid = _uid.replaceAll(" ","");
                    if(_uid.length == 32){
                        uidsToProcess[_uid] = {};
                        modelsList.appendChild(addUidToList(_uid));
                    }
                });
            }
        }
        input.click();
    }
});