var map.x = 504;
var map.y = 350;

var effects = {
    stretch: function (map) {
        let ret = [];
        const ln =  map.x*map.y;
        for (let i = 0; i < ln; i++) {
            ret.push(map.data[i]);
            ret.push(map.data[i]);
        }
        return { 
            x:map.x*2,
            y:map.y,
            data:ret
        }
    },
    stretchy: function (map) {
        let ret = [];
        let line = 0;
        const ln =  map.x*map.y;
        for (let i = 0; i < ln; i++) {
            if (typeof ret[line]=="undefined") {
                ret.push([])
                ret.push([])
            }
            let currpix =map.data[i];
            ret[line].push(currpix)
            ret[line+1].push(currpix)
            if (i%map.x==0) {
                line+=2;
            }          
        }
        return { 
            x:map.x,
            y:map.y*2,
            data:ret.reduce((a, b) => a.concat(b),  [])
        }
    },
    rotate: function (map) {
        let ret = [];

        for (let j =0; j<map.x; j++) {
            for (let i=map.y-1; i>=0; i--) {        
                ret.push(map.data[ (map.x*i)+  j]);
            }
        }
         
        return { 
            x:map.y,
            y:map.x,
            data:ret
        }
    },
    bigger: function(map) {
        let ret = [];
        let line = 0;
        const ln =  map.x*map.y;
        for (let i = 0; i < ln; i++) {
            if (typeof ret[line]=="undefined") {
                ret.push([])
                ret.push([])
            }
            let currpix =map.data[i];
            ret[line].push(currpix)
            ret[line].push(currpix)
            ret[line+1].push(currpix)
            ret[line+1].push(currpix)
            if (i%map.x==0) {
                line+=2;
            }          
        }
        return { 
            x:map.x*2,
            y:map.y*2,
            data:ret.reduce((a, b) => a.concat(b),  [])
        }
    },
    reverse: function (map) {
        let ret = [];
        const ln =  (map.x*map.y)-1;
        for (let i = ln; i >= 0; i--) {
            ret.push(map.data[i]);
        }
        return { 
            x:map.x,
            y:map.y,
            data:ret
        }
    },
    mirror: function (map) {
        let ret = [];
        for (let j = 0; j < map.y; j++ ) {
            for (let i = map.x-1; i >= 0; i--) {
                
                    ret.push(map.data[(j*map.x)+i]);
                        
            }
        }  
        return { 
            x:map.x,
            y:map.y,
            data:ret
        }
    },        
    expand: function (map) {
        let ret = [];
        for (let j = 0; j < map.y; j++ ) {
            for (let i = 0; i<map.x; i++) {
                
                ret.push(map.data[(j*map.x)+i]);
                    
            }
            for (let i = map.x-1; i >= 0; i--) {
                
                    ret.push(map.data[(j*map.x)+i]);
                        
            }
        }  
        return { 
            x:map.x*2,
            y:map.y,
            data:ret
        }
    },
}