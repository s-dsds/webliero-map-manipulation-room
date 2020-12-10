COMMAND_REGISTRY.init(window.WLROOM, {});

COMMAND_REGISTRY.add("fx", ["!fx "+JSON.stringify(effectList)+": adds fx to the current map, applying a random effect or the effect provided"], (player, fx) => {
    let fxidx = effectList.indexOf(fx)
    if (fxidx<0) {
        fxidx = Math.floor(Math.random() * effectList.length);
    }
    loadEffect(fxidx, currentMap)
    return false;
}, true);
