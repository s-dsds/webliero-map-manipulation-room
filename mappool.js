var mapCache = new Map();
var baseURL = "https://webliero.gitlab.io/webliero-maps";
var mypool = [];
loadPool("pools/default/arenasBest.json");
var currentMap = 0;
var currentEffect = 0;

var basex = 504;
var basey = 350;

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

var effects = {
    stretch: function (data) {
        let ret = [];
        const ln =  basex*basey;
        for (let i = 0; i < ln; i++) {
            ret.push(data[i]);
            ret.push(data[i]);
        }
        return { 
            x:basex*2,
            y:basey,
            data:ret
        }
    },
    stretchy: function (data) {
        let ret = [];
        let line = 0;
        const ln =  basex*basey;
        for (let i = 0; i < ln; i++) {
            if (typeof ret[line]=="undefined") {
                ret.push([])
                ret.push([])
            }
            let currpix =data[i];
            ret[line].push(currpix)
            ret[line+1].push(currpix)
            if (i%basex==0) {
                line+=2;
            }          
        }
        return { 
            x:basex,
            y:basey*2,
            data:ret.reduce((a, b) => a.concat(b),  [])
        }
    },
    rotate: function (data) {
        let ret = [];

        for (let j =0; j<basex; j++) {
            for (let i=basey-1; i>=0; i--) {        
                ret.push(data[ (basex*i)+  j]);
            }
        }
         
        return { 
            x:basey,
            y:basex,
            data:ret
        }
    },
    bigger: function(data) {
        let ret = [];
        let line = 0;
        const ln =  basex*basey;
        for (let i = 0; i < ln; i++) {
            if (typeof ret[line]=="undefined") {
                ret.push([])
                ret.push([])
            }
            let currpix =data[i];
            ret[line].push(currpix)
            ret[line].push(currpix)
            ret[line+1].push(currpix)
            ret[line+1].push(currpix)
            if (i%basex==0) {
                line+=2;
            }          
        }
        return { 
            x:basex*2,
            y:basey*2,
            data:ret.reduce((a, b) => a.concat(b),  [])
        }
    },
    reverse: function (data) {
        let ret = [];
        const ln =  (basex*basey)-1;
        for (let i = ln; i >= 0; i--) {
            ret.push(data[i]);
        }
        return { 
            x:basex,
            y:basey,
            data:ret
        }
    },
    mirror: function (data) {
        let ret = [];
        for (let j = 0; j < basey; j++ ) {
            for (let i = basex-1; i >= 0; i--) {
                
                    ret.push(data[(j*basex)+i]);
                        
            }
        }  
        return { 
            x:basex,
            y:basey,
            data:ret
        }
    },        
    expand: function (data) {
        let ret = [];
        for (let j = 0; j < basey; j++ ) {
            for (let i = 0; i<basex; i++) {
                
                ret.push(data[(j*basex)+i]);
                    
            }
            for (let i = basex-1; i >= 0; i--) {
                
                    ret.push(data[(j*basex)+i]);
                        
            }
        }  
        return { 
            x:basex*2,
            y:basey,
            data:ret
        }
    },
}

var effectList=Object.keys(effects);


COMMAND_REGISTRY.add("fx", [()=>"!fx "+JSON.stringify(effectList)+" [mapname]: adds fx to the current map or the map provided, applying a random effect or the effect provided"], (player, fx, ...map) => {
    let fxidx = effectList.indexOf(fx)
    if (fxidx<0) {
        fxidx = Math.floor(Math.random() * effectList.length);
    }
    if (typeof map !="undefined") {
        loadMapByName(fxidx, map.join(" "))
    }
    loadEffect(fxidx, currentMap)
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

function loadEffect(effectidx, mapidx) {
    let name = mypool[mapidx];
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