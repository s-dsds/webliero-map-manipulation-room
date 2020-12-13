var mapCache = new Map();
var baseURL = "https://webliero.gitlab.io/webliero-maps";
var mypool = [];
loadPool("pools/default/arenasBest.json");
var currentMap = 0;
var currentEffect = 0;
var effectList=Object.keys(effects);

function loadPool(name) {
	(async () => {
	mypool = await (await fetch(baseURL + '/' +  name)).json();
	})();
}

async function getMapData(name) {
    let data = mapCache.get(name)
    if (data) {
      return data;
    }
    data = await (await fetch(baseURL + '/' +  name)).arrayBuffer();
   
    let arr = Array.from(new Uint8Array(data));
    mapCache.set(name, arr)
    return arr;
}






COMMAND_REGISTRY.add("fx", [()=>"!fx "+JSON.stringify(effectList)+": adds fx to the current map, applying a random effect or the effect provided"], (player, ...fx) => {
    let fxs = [];
    if (typeof fx=='object') {
        fxs = fx.map(
            function(e) {	
                let trimmed=e.trim();
                if (effectList.indexOf(trimmed) >= 0) {
                    return trimmed;
              }
            }
        );
    }
    if (fxs.length==0) {
        fxs.push(Math.floor(Math.random() * effectList.length));
    }
    loadEffects(fxs, currentMap);
    return false;
}, true);

function loadMap(name, data) {
    console.log(data.data.length);
    console.log(data.data[2]);
    let buff=new Uint8Array(data.data).buffer;
    window.WLROOM.loadRawLevel(name,buff, data.x, data.y);
}

function next() {
    currentMap=currentMap+1<mypool.length?currentMap+1:0;
    currentEffect=currentEffect+1<effectList.length?currentEffect+1:0;
    loadEffect(currentEffect, currentMap)
}

function loadEffects(fxs, mapidx) {
    let name = mypool[mapidx];
    console.log(name, JSON.stringify(fxs));
    (async () => {
        let data = await getMapData(name);
        console.log(typeof data);
        for (var idx in fxs) {
            data = effects[fxs[idx]]({x:504,y:350,data:data});
        }
	    loadMap(name, data);
    })();
}

function loadEffect(effectidx, mapidx) {
    let name = mypool[mapidx];
    console.log(name, effectList[effectidx]);
    (async () => {
        let data = await getMapData(name);
        console.log(typeof data);
	    loadMap(name, effects[effectList[effectidx]]({x:504,y:350,data:data}));
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

function loadMapByName(effectidx, name) {
    console.log(name, effectList[effectidx]);
    (async () => {
        let data = await getMapData(name);
        console.log(typeof data);
	    loadMap(name, effects[effectList[effectidx]](data));
    })();
}

COMMAND_REGISTRY.add("map", ["!map #mapname#: load lev map from gitlab webliero.gitlab.io, applying a random effect"], (player, ...name) => {
    let fxidx = Math.floor(Math.random() * effectList.length);
    loadMapByName(fxidx, name.join(" "))
    return false;
}, true);