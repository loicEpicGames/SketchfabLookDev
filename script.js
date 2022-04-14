var uid      = "7786614de739435d8b29221628b9703b";
var orgUid   = "68d3d5b619d64fc6950fb45303afcf57";
var apiToken = "";
var currentHDRUid = "";


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
const screenshot = document.getElementById("screenshot");
const overlay       = document.getElementById("overlay");
const overlayToggle = document.getElementById("overlay-toggle");
const overlayToggleIcon = document.getElementById("overlay-toggle-icon");
const loadJSON = document.getElementById("load-json");
const saveJSON = document.getElementById("save-json");

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
        if(url.includes("?")) url = url + "#token=" + apiToken;
        else url = url + "?token=" + apiToken;
    }
    req.open("GET", url, true);
    req.send(null);
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
    API.setCameraLookAtEndAnimationCallback( onCameraEndMovement );
    updateDefaultPostProcess();
    updateAvailableEnvironments();
    API.getFov(function(err, fov){camFOV.value = fov; camFOVText.innerHTML = (fov*1.).toFixed(1) + " °"});
}

// Post process
settingsNone.addEventListener("change", function(){
    isChecked = settingsNone.checked;
    API.setPostProcessing({enable: !isChecked}, function() {});
})
settingsSSAO.addEventListener("change", function(){
    isChecked = settingsSSAO.checked;
    API.setPostProcessing({enable: true, ssaoEnable: isChecked}, function() {});
})
settingsSSR.addEventListener("change", function(){
    isChecked = settingsSSR.checked;
    API.setPostProcessing({enable: true, ssrEnable: isChecked}, function() {});
})

function updateDefaultPostProcess(){
    API.getPostProcessing(function(settings) {
        settingsNone.checked = !settings.enable;
        settingsSSAO.checked = settings.ssaoEnable;
        settingsSSR.checked = settings.ssrEnable;
        window.console.log("Post-processing", settings);
    });
}

// HDR Settings
settingsHDRId.addEventListener("change", function(){setEnvironmentSettings(); settingsHDRRotation.dispatchEvent(new Event('input'));});
settingsHDREnable.addEventListener("change", setEnvironmentSettings);
settingsHDRShadows.addEventListener("change", setEnvironmentSettings);
settingsHDRRotation.addEventListener("input", setEnvironmentSettings);
settingsHDRExposure.addEventListener("input", setEnvironmentSettings);
settingsHDRIntensity.addEventListener("input", setEnvironmentSettings);
function setEnvironmentSettings(){
    settingsHDRRotationText.innerHTML = (settingsHDRRotation.value*180/3.14159).toFixed(1) + " °";
    settingsHDRExposureText.innerHTML = settingsHDRExposure.value;
    settingsHDRIntensityText.innerHTML = settingsHDRIntensity.value;
    options = {
        enabled: settingsHDREnable.checked,
        exposure: settingsHDRExposure.value,
        lightIntensity: settingsHDRIntensity.value,
        blur: 0,
        shadowEnabled: settingsHDRShadows.checked,
        rotation: settingsHDRRotation.value,
    }
    console.log(settingsHDRId, settingsHDRId.options, settingsHDRId.selectedIndex)
    if(apiToken.length == 32 && settingsHDRId.options[settingsHDRId.selectedIndex].value != ""){
        options["uid"] = settingsHDRId.options[settingsHDRId.selectedIndex].value;
    }
    API.setEnvironment(options);
}
function updateAvailableEnvironments(){
    settingsHDRId.innerHTML = "";
    API.getEnvironment(function(err, envInfo) {
        if (!err) {
            console.log(envInfo);
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

// Camera settings
camFOV.addEventListener("input", function(){
    API.setFov(camFOV.value);
    camFOVText.innerHTML = (camFOV.value*1.).toFixed(1) + " °";
});
camX.addEventListener("change", setCameraParameters);
camY.addEventListener("change", setCameraParameters);
camZ.addEventListener("change", setCameraParameters);
lookX.addEventListener("change", setCameraParameters);
lookY.addEventListener("change", setCameraParameters);
lookZ.addEventListener("change", setCameraParameters);
function setCameraParameters(){
    position = [camX.value, camY.value, camZ.value]
    target = [lookX.value, lookY.value, lookZ.value]
    API.setCameraLookAt(position, target, 0);
}
function onCameraEndMovement(err){
    if(!err){
        API.getCameraLookAt(function(err2, camera) {
            if(!err2){
                window.console.log(camera);
                camX.value = camera.position[0];
                camY.value = camera.position[1];
                camZ.value = camera.position[2];
                lookX.value = camera.target[0];
                lookY.value = camera.target[1];
                lookZ.value = camera.target[2];
                window.console.log(camera.position); // [x, y, z]
                window.console.log(camera.target); // [x, y, z]
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

// Screenshot
screenshot.addEventListener("click", takeScreenShot);
function takeScreenShot(){
    API.getScreenShot(1920, 1200, 'image/png', function (err, result) {
        var anchor = document.createElement('a');
        anchor.href = result;
        anchor.download = "Sketchfab_" + Date.now().toFixed(0) + ".png";
        anchor.click();
        anchor.remove();
      });
}

// Various callbacks
settingsUid.addEventListener("input", function(e){
    if(settingsUid.value.length == 32){
        currentHDRUid = "";
        client.init( settingsUid.value, initOptions );
    }
})
settingsAPIToken.addEventListener("change", function(){
    val = settingsAPIToken.value;
    if(val.length == 32 && apiToken.length != 32){
        apiToken = val;
    } 
    updateAvailableEnvironments();
})
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
loadJSON.addEventListener("click", function(){
    console.log("Not implemented yet, ideally on file drop too");
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

});
saveJSON.addEventListener("click", function(){
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
});