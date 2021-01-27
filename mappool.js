var mapCache = new Map();
var baseURL = "https://webliero.gitlab.io/webliero-maps";
var mypool = [];
loadPool("pools/default/arenasBest.json");
var currentMap = 0;
var currentMapName = "";
var currentEffect = 0;
var effectList=Object.keys(effects);

function loadPool(name) {
	(async () => {
	mypool = await (await fetch(baseURL + '/' +  name)).json();
	})();
}

async function getMapData(name) {
    let x = 504;
    let y = 350;

    let obj = mapCache.get(name)
    if (obj) {
   //   return obj;
    }
    if (name.split('.').pop()=="png") {    
       obj = await getPngMapData(name);
    } else {
        let buff = await (await fetch(baseURL + '/' +  name)).arrayBuffer();
        let arr = Array.from(new Uint8Array(buff));
        obj = {x:x,y:y,data:arr};
    }
    
    mapCache.set(name, obj)
    return obj;
}

var pixConvFailures = 0;
	
function getbestpixelValue(red,green,blue) {
    let colorVal = Array.prototype.slice.call(arguments).join("_");;
    if (invPal.get(colorVal)==undefined) {
            pixConvFailures++;		
            return 1;
            
        } 
        return invPal.get(colorVal);		
}

async function getPngMapData(name) {
    pixConvFailures = 0;
    let blob = await (await fetch(baseURL + '/' +  name)).blob();
    let img = new Image();
    const imageLoadPromise = new Promise(resolve => {        
      img.onload = resolve;
      img.src = URL.createObjectURL(blob);
    });
    await imageLoadPromise;

    let ret = {x:img.width, y: img.height, data:[]};
    let canvas = document.createElement("canvas");
    canvas.width  = ret.x;
    canvas.height = ret.y;
    let ctx = canvas.getContext("2d", {alpha: false});
    ctx.drawImage(img, 0, 0, ret.x, ret.y);
    
    let imgData = ctx.getImageData(0, 0, ret.x, ret.y);
    console.log("data len x y", imgData.data.length, ret.x, ret.y , ret.x * ret.y, imgData.data.length/4);
    for (let i = 0; i < imgData.data.length; i += 4) {
      ret.data.push(getbestpixelValue(imgData.data[i],imgData.data[i + 1],imgData.data[i + 2]));
    }
    console.log("pix failures", pixConvFailures);
    return ret;
}

COMMAND_REGISTRY.add("fx", [()=>"!fx "+JSON.stringify(effectList)+": adds fx to the current map, applying a random effect or the effect provided"], (player, ...fx) => {
    let fxs = [];
    if (typeof fx=='object') {
        let big=false;
        fxs = fx.map(
            function(e) {	
                let trimmed=e.trim();
                if (effectList.indexOf(trimmed) >= 0 && (trimmed!="bigger" || big==false)) { // filtering bigger since it actually breaks when chained
                    if (trimmed == "bigger") {
                        big=true;
                    }
                    return trimmed;
              }
            }
        ).filter(x => x).slice(0, 5);
    }
    if (fxs.length==0) {
        fxs.push(Math.floor(Math.random() * effectList.length));
    }
    if (currentMapName=="") {
        resolveNextMap();
    }
    loadEffects(fxs, currentMapName);
    return false;
}, true);

function loadMap(name, data) {
    console.log(data.data.length);
    console.log(data.data[2]);
    let buff=new Uint8Array(data.data).buffer;
    window.WLROOM.loadRawLevel(name,buff, data.x, data.y);
}

function resolveNextMap() {
    currentMap=currentMap+1<mypool.length?currentMap+1:0;
    currentMapName = mypool[currentMap];
}

function next() {
    resolveNextMap();
    currentEffect=currentEffect+1<effectList.length?currentEffect+1:0;
    loadEffect(currentEffect, currentMapName);
}

function loadEffects(fxs, name) {
    console.log(name, JSON.stringify(fxs));
    (async () => {
        let data = await getMapData(name);
        console.log(typeof data);
        for (var idx in fxs) {
            console.log(fxs[idx]);
            data = effects[fxs[idx]](data);
        }
	    loadMap(name, data);
    })();
}

function loadEffect(effectidx, name) {
    console.log(name, effectList[effectidx]);
    (async () => {
        let data = await getMapData(name);
        console.log(typeof data);
	    loadMap(name, effects[effectList[effectidx]](data));
    })();
}

function _base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}


COMMAND_REGISTRY.add("map", ["!map #mapname#: load lev map from gitlab webliero.gitlab.io, applying a random effect"], (player, ...name) => {
    let fxidx = Math.floor(Math.random() * effectList.length);
    currentMapName = name.join(" ");
    loadEffect(fxidx, currentMapName);
    return false;
}, true);