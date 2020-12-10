window.WLROOM.onPlayerChat = function (p, m) {
	console.log(p.name+" "+m);
}

window.WLROOM.onPlayerJoin = (player) => {
	if (admins.has(player.auth) ) {
		window.WLROOM.setPlayerAdmin(player.id, true);
	}
	auth.set(player.id, player.auth);
	
	announce("Welcome to the Resize test room!", player, 0xFF2222, "bold");
	announce("current map is`"+mypool[currentMap]+"` with effect `"+effectList[currentEffect]+"`", player, 0xDD2222);
    announce("This is a completely experimental room & will be online for a limited time, please enjoy", player, 0xFF22FF, "italic");
	
	announce("please join us on discord if you're not there yet! "+CONFIG.discord_invite, player, 0xDD00DD, "italic");
	if (player.auth){		
		auth.set(player.id, player.auth);
	}
}
