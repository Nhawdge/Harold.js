const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const response = require("./responses.json");
const https = require('https');
var wowRaces = require("./races.json");
var wowClasses = require("./classes.json");

// How to add bot
console.log("https://discordapp.com/oauth2/authorize?client_id=" + config.clientId +"&scope=bot");
client.on("message", msg => {
	args = msg.content.split(" ");
	if (args[0].toLowerCase() != config.prefix) {
		return;
	}

	// Gear check
	if (args[1].toLowerCase() == "check") {
		if (args.length < 3) {
			msg.channel.sendMessage("I don't know who that is");
			return;
		}
		
		var character = args[2].toLowerCase();
		var realm = args[3] ?  args[3].toLowerCase() : config.realm;
		var url = encodeURI("https://us.api.battle.net/wow/character/" + realm + "/" + character + "?fields=items&locale=en_US&apikey="+ config.wowKey);
		console.log("Checking " + character + " from realm " + realm);

		https.get(url, (res) => {
			if (res.statusCode != 200) {
				console.warn("Failed to retrieve character: " + character + " from " + realm);
			}

			res.on('data', (d) => {
				charData = JSON.parse(d);			
				if (!charData.name) return;

				// Check Character race
				for (r in wowRaces.races) {
					if (wowRaces.races[r].id == charData.race) {
						charRace = wowRaces.races[r].name;
					}
				}
				// Check Character Class 
				for (c in wowClasses.classes) {
					if (wowClasses.classes[c].id == charData.class) {
						charClass = wowClasses.classes[c].name;
					}
				}

				// Check for legendaries
				var legendary1 = null;
				var legendary2 = null;
				var legendaries = "";

				for (item in charData.items) {
					if (charData.items[item].quality == 5 && legendary1 == null) {
						legendary1 = charData.items[item].name + " (" +charData.items[item].itemLevel +")";
					}
					else if (charData.items[item].quality == 5) {
						legendary2 = charData.items[item].name + " (" +charData.items[item].itemLevel +")";
					}
				}
				legendaries = legendary1 ? legendary1 : " no legendaries";
				legendaries += legendary2 ? " and " + legendary2 : "";

				output = charData.name + " from " + charData.realm 
					+ " is a level "+ charData.level + " " + charRace + " "+ charClass
					+ " has an average item level of " + charData.items.averageItemLevel
					+ " and equipped item level of " + charData.items.averageItemLevelEquipped + ". ";

				if (charData.level == 110) {
					output += "\n" + charData.name + " is wearing " + legendaries + ". ";
					output += charData.items.mainHand.name + " is " + charData.items.mainHand.itemLevel;
					var traits = charData.items.mainHand.artifactTraits;
					var traitTotal = 0;
					if (traits.length == 0) traits = charData.items.offHand.artifactTraits;
					for (trait in traits) {
						traitTotal += traits[trait].rank;
					}
					output += " with " + traitTotal + " points."
				}
			
				msg.channel.sendMessage(output);
			});
			res.on('error', (e) => {
				console.error(e);
			});
		});		
	}
	
	else if ((args[1].toLowerCase() == "item")) {
		var itemId = args[2];
		var url = encodeURI("https://us.api.battle.net/wow/item/" + itemId + "?locale=en_US&apikey="+ config.wowKey);
	
		console.log("Checking item " + itemId);

		https.get(url, (res) => { 
			if (res.statusCode != 200) {
				console.warn("Failed to retrieve item: " + itemId);
			}

			res.on('data', (d) => {
				//console.log(res.statusCode);
				itemData = JSON.parse(d);
				if (itemData.name) {
					msg.channel.sendMessage("Item: " + itemData.name 
						+ "\nQuality: " + itemData.quality);
				}
			});
			res.on('error', (e) => {
				console.error(e.message);
			});
		});	
	}

	else if (args[1].toLowerCase() == "nightbane" ) {
		var realm = arg[3] ? arg[3] : config.realm;
		var characterName = arg[2];
		var url = encodeURI("https://us.api.battle.net/wow/character/" +  realm + "/" + characterName + "?fields=mounts&locale=en_US&apikey="+ config.wowKey);
							 //https://us.api.battle.net/wow/character/hyjal/ashmae?fields=mounts&locale=en_US&apikey=u4gz9th8qpb52qsjw8abzj9zpqbse8jt
		console.log("Checking for nightbane: " + characterName + realm);

		https.get(url, (res) => { 
			if (res.statusCode != 200) {
				console.warn("Failed to retrieve data: " + characterName + realm);
			}

			res.on('data', (d) => {
				characterData = JSON.parse(d);
				if (CharacterData.name) {
					if (CharacterData.mounts.collected.indexOf("Smoldering Ember Wyrm") >= 0 ) {
						msg.channel.sendMessage(CharacterData.name + " on " + CharacterData.realm + " already has nightbane mount.");
					}
					msg.channel.sendMessage(CharacterData.name + " on " + CharacterData.realm + " does not have nightbane");
				}

			});
			res.on('error', (e) => {
				console.error(e.message);
			});
		});	
	}
	
	else if (args.indexOf("joke") >= 0) {
		i = Math.floor(Math.random() * response.jokes.length);
		msg.channel.sendMessage(response.jokes[i]);
		
	}
	else if (response[args[1]]) {
		msg.channel.sendMessage(response[message]);
	}
	else if (args[1].toLowerCase() == "say") {
		var output = "";
		for (i = 2; i < args.length; i++ ) {
			output += args[i] + " ";
		}
		msg.channel.sendMessage(output);
	}
	else {
		i = Math.floor(Math.random() * response.misc.length);
		msg.channel.sendMessage(response.misc[i])
	}
});

client.on('ready', () => {
  console.log('I am ready!');
});

client.login(config.token);
