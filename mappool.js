var mapCache = new Map();
var baseURL = "https://webliero.gitlab.io/webliero-maps";
var mypool = fetch("https://webliero.gitlab.io/webliero-maps/pools/default/arenasBest.json").json();
var currentMap = 0;
var currentEffect = 0;

var basex = 504;
var basey = 350;

async function getMapData(name) {
    let data = mapCache.get(name)
    if (data) {
      return data;
    }
    data = await (await fetch(baseURL + '/' +  name)).arrayBuffer();
    mapCache.set(name, data)
    return data;
}

var effects = {
    stretch: function (data) {
        let ret = [];
        for (let i = 0; i < data.length; i++) {
            ret.push(data[i]);
            ret.push(data[i]);
        }
        return { 
            x:basex*2,
            y:basey,
            data:ret
        }
    },
    bigger: function(data) {
        let ret = [];
        let line = 0;
        for (let i = 0; i < data.length; i++) {
            if (typeof ret[line]!="undefined") {
                ret.push([])
                ret.push([])
            }
            ret[line].push(data[i])
            ret[line].push(data[i])
            ret[line+1].push(data[i])
            ret[line+1].push(data[i])
            if (i%basex==0) {
                line++
            }
        }
        return { 
            x:basex*2,
            y:basey*2,
            data:ret.reduce((a, b) => a.concat(b),  [])
        }
    }
}

var effectList=Object.keys(effects);


COMMAND_REGISTRY.add("fx", ["!fx "+JSON.stringify(effectList)+": adds fx to the current map, applying a random effect or the effect provided"], (player, fx) => {
    let fxidx = effectList.indexOf(fx)
    if (fxidx<0) {
        fxidx = Math.floor(Math.random() * effectList.length);
    }
    loadEffect(fxidx, currentMap)
    return false;
}, true);

function loadMap(name, data) {
    let buff=new Uint8Array(data).buffer;
    window.WLROOM.loadLev(name,buff);
}

function next() {
    currentMap=currentMap+1<mypool.length?currentMap+1:0;
    currentEffect=currentEffect+1<effectList.length?currentEffect+1:0;
    loadEffect(currentEffect, currentMap)
}

function loadEffect(effectidx, mapidx) {
    let name = mypool[mapidx];
    let data = await getMapData(name)
    loadMap(name, effects[effectList[effectidx]](data))
}