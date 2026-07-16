if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement, fromIndex) { // eslint-disable-line no-extend-native
		var k;
		if (this == null) {
			throw new TypeError('"this" equals null or n is undefined');
		}
		var O = Object(this);
		var len = O.length >>> 0;
		if (len === 0) {
			return -1;
		}
		var n = +fromIndex || 0;
		if (Math.abs(n) === Infinity) {
			n = 0;
		}
		if (n >= len) {
			return -1;
		}
		k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
		while (k < len) {
			if (k in O && O[k] === searchElement) {
				return k;
			}
			k++;
		}
		return -1;
	};
}

function startsWith(string, target) {
	return (string || '').slice(0, target.length) === target;
}

function endsWith(string, target) {
	return (string || '').slice(-target.length) === target;
}

var LEGACY_STATS_RBY = ["hp", "at", "df", "sl", "sp"];
var LEGACY_STATS_GSC = ["hp", "at", "df", "sa", "sd", "sp"];
var LEGACY_STATS = [LEGACY_STATS_GSC, LEGACY_STATS_RBY, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC]; // NewGenChange
var HIDDEN_POWER_REGEX = /Hidden Power (\w*)/;

var CALC_STATUS = {
	'Healthy': '',
	'Paralyzed': 'par',
	'Poisoned': 'psn',
	'Badly Poisoned': 'tox',
	'Burned': 'brn',
	'Asleep': 'slp',
	'Frozen': 'frz',
	'Dragonblighted': 'dgb',
	'Drowsy': 'drs',
	'Frostbitten': 'frb',
	'Baseball': 'bsb'
};

var statusType;
if (gen === 13) {
	statusType = ".status2";
} else if (gen === 23) {
	statusType = ".status3";
} else {
	statusType = ".status";
}

var gravityType;
if (gen === 13) {
	gravityType = "#gravity2";
} else {
	gravityType = "#gravity";
}

var terrainType;
var terrains = {};
if (gen === 23) {
	terrainType = "'terrain2'";
	terrains.electric = "#electric2";
	terrains.fishing = "#fishing2";
	terrains.frigid = "#frigid2";
	terrains.grassy = "#grassy2";
	terrains.misty = "#misty2";
	terrains.psychic = "#psychic2";
} else {
	terrainType = "'terrain'";
	terrains.electric = "#electric";
	terrains.grassy = "#grassy";
	terrains.misty = "#misty";
	terrains.psychic = "#psychic";
}

var snowGens = [9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 24]; // Rain, Sand, Snow, Sun
var hailGens = [3, 4, 5, 6, 7, 8, 22]; // Hail, Rain, Sand, Sun
var weatherType;
var weatherType2;
var weathers = {
	clear: "",
	sun: "",
	rain: "",
	sand: "",
	cold: "",
	grave: "",
	acid: "",
	strongsun: "",
	strongrain: "",
	strongwinds: "",
	strongsand: "",
	strongcold: "",
};
var weatherNames = {
	clear: "",
	sun: "",
	rain: "",
	sand: "",
	cold: "",
	grave: "",
	acid: "",
	strongsun: "",
	strongrain: "",
	strongwinds: "",
	strongsand: "",
	strongcold: "",
};
if (gen === 23) {
	weatherType = "'weather-if'";
	weatherType2 = "'.weather-if'";
	weathers.clear = "#clear-if"; weatherNames.clear = "Clear";
	weathers.sun = "#sun-if"; weatherNames.sun = "Sun";
	weathers.rain = "#rain-if"; weatherNames.rain = "Rain";
	weathers.sand = "#sand-if"; weatherNames.sand = "Sand";
	weathers.cold = "#snow-if"; weatherNames.cold = "Snow";
	weathers.grave = "#grave-if"; weatherNames.grave = "Grave";
	weathers.acid = "#acid-if"; weatherNames.acid = "Acid";
} else if (gen === 14) {
	weatherType = "'weather-sbs'";
	weatherType2 = "'.weather-sbs'";
	weathers.clear = "#clear-sbs"; weatherNames.clear = "Clear";
	weathers.sun = "#sun-sbs"; weatherNames.sun = "Sun";
	weathers.rain = "#rain-sbs"; weatherNames.rain = "Rain";
	weathers.sand = "#sand-sbs"; weatherNames.sand = "Sand";
	weathers.cold = "#snow-sbs"; weatherNames.cold = "Snow";
	weathers.strongwinds = "#strong-winds-sbs"; weatherNames.strongwinds = "Strong Winds";
} else if (gen === 13) {
	weatherType = "'weather-mh'";
	weatherType2 = "'.weather-mh'";
	weathers.clear = "#clear-mh"; weatherNames.clear = "Clear";
	weathers.sun = "#sun-mh"; weatherNames.sun = "Sun";
	weathers.rain = "#rain-mh"; weatherNames.rain = "Rain";
	weathers.sand = "#sand-mh"; weatherNames.sand = "Sand";
	weathers.cold = "#snow-mh"; weatherNames.cold = "Snow";
	weathers.strongsun = "#harsh-sunshine-mh"; weatherNames.strongsun = "Harsh Sunshine";
	weathers.strongrain = "#heavy-rain-mh"; weatherNames.strongrain = "Heavy Rain";
	weathers.strongwinds = "#strong-winds-mh"; weatherNames.strongwinds = "Strong Winds";
	weathers.strongsand = "#dust-devil-mh"; weatherNames.strongsand = "Dust Devil";
	weathers.strongcold = "#absolute-zero-mh"; weatherNames.strongcold = "Absolute Zero";
} else if (gen in snowGens) {
	weatherType = "'weather'";
	weatherType2 = "'.weather'";
	weathers.clear = "#clear"; weatherNames.clear = "Clear";
	weathers.sun = "#sun"; weatherNames.sun = "Sun";
	weathers.rain = "#rain"; weatherNames.rain = "Rain";
	weathers.sand = "#sand"; weatherNames.sand = "Sand";
	weathers.cold = "#snow"; weatherNames.cold = "Snow";
	weathers.strongsun = "#harsh-sunshine"; weatherNames.strongsun = "Harsh Sunshine";
	weathers.strongrain = "#heavy-rain"; weatherNames.strongsun = "Heavy Rain";
	weathers.strongwinds = "#strong-winds"; weatherNames.strongsun = "Strong Winds";
} else if (gen in hailGens) {
	weatherType = "'weather-hail'";
	weatherType2 = "'.weather-hail'";
	weathers.clear = "#clear-hail"; weatherNames.clear = "Clear";
	weathers.sun = "#sun-hail"; weatherNames.sun = "Sun";
	weathers.rain = "#rain-hail"; weatherNames.rain = "Rain";
	weathers.sand = "#sand-hail"; weatherNames.sand = "Sand";
	weathers.cold = "#hail-hail"; weatherNames.cold = "Hail";
	weathers.strongsun = "#harsh-sunshine-hail"; weatherNames.strongsun = "Harsh Sunshine";
	weathers.strongrain = "#heavy-rain-hail"; weatherNames.strongsun = "Heavy Rain";
	weathers.strongwinds = "#strong-winds-hail"; weatherNames.strongsun = "Strong Winds";
} else {
	weatherType = "'weather-nocold'";
	weatherType2 = "'.weather-nocold'";
	weathers.clear = "#clear-nocold"; weatherNames.clear = "Clear";
	weathers.sun = "#sun-nocold"; weatherNames.sun = "Sun";
	weathers.rain = "#rain-nocold"; weatherNames.rain = "Rain";
	weathers.sand = "#sand-nocold"; weatherNames.sand = "Sand";
}

function legacyStatToStat(st) {
	switch (st) {
	case 'hp':
		return "hp";
	case 'at':
		return "atk";
	case 'df':
		return "def";
	case 'sa':
		return "spa";
	case 'sd':
		return "spd";
	case 'sp':
		return "spe";
	case 'sl':
		return "spc";
	}
}

// input field validation
var bounds = {
	"level": [0, 100],
	"base": [1, 255],
	"evs": [0, 252],
	"ivs": [0, 31],
	"dvs": [0, 15],
	"sps": [0, 32],
	"move-bp": [0, 65535]
};
for (var bounded in bounds) {
	attachValidation(bounded, bounds[bounded][0], bounds[bounded][1]);
}
function attachValidation(clazz, min, max) {
	$("." + clazz).keyup(function () {
		validate($(this), min, max);
	});
}
function validate(obj, min, max) {
	obj.val(Math.max(min, Math.min(max, ~~obj.val())));
}

$("input:radio[name='format']").change(function () {
	var gameType = $("input:radio[name='format']:checked").val();
	if (gameType === 'Singles') {
		$("input:checkbox[name='ruin']:checked").prop("checked", false);
	}
	$(".format-specific." + gameType.toLowerCase()).each(function () {
		if ($(this).hasClass("gen-specific") && !$(this).hasClass("g" + gen)) {
			return;
		}
		$(this).show();
	});
	$(".format-specific").not("." + gameType.toLowerCase()).hide();
});

var defaultLevel = 100;
$("input:radio[name='defaultLevel']").change(function () {
	defaultLevel = $("input:radio[name='defaultLevel']:checked").val();
	$("#levelL1").val(defaultLevel);
	$("#levelR1").val(defaultLevel);
	$("#levelL1").trigger("change");
	$("#levelR1").trigger("change");
});

// auto-calc stats and current HP on change
$(".level").bind("keyup change", function () {
	var poke = $(this).closest(".poke-info");
	calcHP(poke);
	calcStats(poke);
});
$(".nature").bind("keyup change", function () {
	calcStats($(this).closest(".poke-info"));
});
$(".hp .base, .hp .evs, .hp .ivs, .hp .sps").bind("keyup change", function () {
	calcHP($(this).closest(".poke-info"));
});
$(".at .base, .at .evs, .at .ivs, .at .sps").bind("keyup change", function () {
	calcStat($(this).closest(".poke-info"), 'at');
});
$(".df .base, .df .evs, .df .ivs , .df .sps").bind("keyup change", function () {
	calcStat($(this).closest(".poke-info"), 'df');
});
$(".sa .base, .sa .evs, .sa .ivs, .sa .sps").bind("keyup change", function () {
	calcStat($(this).closest(".poke-info"), 'sa');
});
$(".sd .base, .sd .evs, .sd .ivs, .sd .sps").bind("keyup change", function () {
	calcStat($(this).closest(".poke-info"), 'sd');
});
$(".sp .base, .sp .evs, .sp .ivs, .sp .sps").bind("keyup change", function () {
	calcStat($(this).closest(".poke-info"), 'sp');
});
$(".evs, .sps").bind('keyup change', function () {
	totalEVs($(this).closest(".poke-info"));
});
$(".sl .base, .sl .evs").bind("keyup change", function () {
	calcStat($(this).closest(".poke-info"), 'sl');
});
$(".at .dvs").keyup(function () {
	var poke = $(this).closest(".poke-info");
	calcStat(poke, 'at');
	poke.find(".hp .dvs").val(getHPDVs(poke));
	calcHP(poke);
});
$(".df .dvs").keyup(function () {
	var poke = $(this).closest(".poke-info");
	calcStat(poke, 'df');
	poke.find(".hp .dvs").val(getHPDVs(poke));
	calcHP(poke);
});
$(".sa .dvs").keyup(function () {
	var poke = $(this).closest(".poke-info");
	calcStat(poke, 'sa');
	poke.find(".sd .dvs").val($(this).val());
	calcStat(poke, 'sd');
	poke.find(".hp .dvs").val(getHPDVs(poke));
	calcHP(poke);
});
$(".sp .dvs").keyup(function () {
	var poke = $(this).closest(".poke-info");
	calcStat(poke, 'sp');
	poke.find(".hp .dvs").val(getHPDVs(poke));
	calcHP(poke);
});
$(".sl .dvs").keyup(function () {
	var poke = $(this).closest(".poke-info");
	calcStat(poke, 'sl');
	poke.find(".hp .dvs").val(getHPDVs(poke));
	calcHP(poke);
});

function getForcedTeraType(pokemonName, pokemonAbility) {
	if (startsWith(pokemonName, "Ogerpon-Cornerstone")) {
		return "Rock";
	} else if (startsWith(pokemonName, "Ogerpon-Hearthflame")) {
		return "Fire";
	} else if (pokemonName === "Ogerpon" || startsWith(pokemonName, "Ogerpon-Teal")) {
		return "Grass";
	} else if (startsWith(pokemonName, "Ogerpon-Wellspring")) {
		return "Water";
	} else if (startsWith(pokemonName, "Terapagos")) {
		return "Stellar";
	} else if (startsWith(pokemonName, "Ogereena-Cornerstone")) {
		return "Rock";
	} else if (startsWith(pokemonName, "Ogereena-Hearthflame")) {
		return "Fire";
	} else if (pokemonName === "Ogereena" || startsWith(pokemonName, "Ogereena-Teal")) {
		return "Grass";
	} else if (startsWith(pokemonName, "Ogereena-Wellspring")) {
		return "Water";
	} else if (pokemonAbility === "I Love Fishing") {
		return "Water";
	} else if (pokemonAbility === "Racer's Spirit") {
		return "Steel";
	}
	return null;
}

function getHPDVs(poke) {
	return (~~poke.find(".at .dvs").val() % 2) * 8 +
(~~poke.find(".df .dvs").val() % 2) * 4 +
(~~poke.find(".sp .dvs").val() % 2) * 2 +
(~~poke.find(gen === 1 ? ".sl .dvs" : ".sa .dvs").val() % 2);
}

function calcStats(poke) {
	for (var i = 0; i < LEGACY_STATS[gen].length; i++) {
		calcStat(poke, LEGACY_STATS[gen][i]);
	}
}

function calcCurrentHP(poke, max, percent, skipDraw) {
	var current = Math.round(Number(percent) * Number(max) / 100);
	poke.find(".current-hp").val(current);
	if (!skipDraw) drawHealthBar(poke, max, current);
	return current;
}
function calcPercentHP(poke, max, current, skipDraw) {
	var percent = Math.round(100 * Number(current) / Number(max));
	if (percent === 0 && current > 0) {
		percent = 1;
	} else if (percent === 100 && current < max) {
		percent = 99;
	}

	poke.find(".percent-hp").val(percent);
	if (!skipDraw) drawHealthBar(poke, max, current);
	return percent;
}
function drawHealthBar(poke, max, current) {
	var fillPercent = 100 * current / max;
	var fillColor = fillPercent > 50 ? "green" : fillPercent > 20 ? "yellow" : "red";

	var healthbar = poke.find(".hpbar");
	healthbar.addClass("hp-" + fillColor);
	var unwantedColors = ["green", "yellow", "red"];
	unwantedColors.splice(unwantedColors.indexOf(fillColor), 1);
	for (var i = 0; i < unwantedColors.length; i++) {
		healthbar.removeClass("hp-" + unwantedColors[i]);
	}
	healthbar.css("background", "linear-gradient(to right, " + fillColor + " " + fillPercent + "%, white 0%");
}
// TODO: these HP inputs should really be input type=number with min=0, step=1, constrained by max=maxHP or 100
$(".current-hp").keyup(function () {
	var max = $(this).parent().children(".max-hp").text();
	validate($(this), 0, max);
	var current = $(this).val();
	calcPercentHP($(this).parent(), max, current);
});
$(".percent-hp").keyup(function () {
	var max = $(this).parent().children(".max-hp").text();
	validate($(this), 0, 100);
	var percent = $(this).val();
	calcCurrentHP($(this).parent(), max, percent);
});

$(".ability").bind("keyup change", function () {
	var pokemonName = $(this).closest(".poke-info").find("input.set-selector").val();
	var ability = $(this).closest(".poke-info").find(".ability").val();

	if (gen === 23) {
		var forcedTeraType = getForcedTeraType(pokemonName, ability);
		if (forcedTeraType) {
			$(this).closest(".poke-info").find(".bigToggle").prev("label").hide();
			$(this).closest(".poke-info").find(".bigToggle").hide();
			$(this).closest(".poke-info").find(".bigToggle").prop("checked", false);
			$(this).closest(".poke-info").find(".teraType").prev("label").show();
			$(this).closest(".poke-info").find(".teraType").show();
			$(this).closest(".poke-info").find(".teraType").val(forcedTeraType);
			$(this).closest(".poke-info").find(".teraToggle").show();
		} else {
			$(this).closest(".poke-info").find(".bigToggle").prev("label").show();
			$(this).closest(".poke-info").find(".bigToggle").show();
			$(this).closest(".poke-info").find(".teraType").prev("label").hide();
			$(this).closest(".poke-info").find(".teraType").hide();
			$(this).closest(".poke-info").find(".teraType").val($(this).closest(".poke-info").find(".type1").val());
			$(this).closest(".poke-info").find(".teraToggle").hide();
			$(this).closest(".poke-info").find(".teraToggle").prop("checked", false);
		}
	}

	for (var i = 1; i <= 4; i++) {
		var moveSelector = ".move" + i;
		var moveHits = 3;

		var moveName = $(this).closest(".poke-info").find(moveSelector).find(".select2-chosen").text();
		var move = moves[moveName] || moves['(No Move)'];
		if (move.multiaccuracy) {
			moveHits = move.multihit;
		} else if (['Skill Link', 'Toxic Links'].includes(ability)) {
			moveHits = 5;
		} else if ($(this).closest(".poke-info").find(".item").val() === 'Loaded Dice') {
			moveHits = 4;
		}
		if ($(this).closest(".poke-info").find(statusType).val() === 'Drowsy') {
			moveHits = 1;
		}
	}

	var TOGGLE_ABILITIES = {
		on: [
			'Dominate',
			'Eliminate',
			'First Flight',
			'Hunger Fate',
			'Incorporate',
			'Inflame',
			'Intimidate',
			'Migrate',
			'Obliterate',
			'Pristine Dessert',
			'Quickstart',
			'Sea Monster',
			'Slow Start',
			'Surprise',
			'Supersour Syrup',
			'Teraform Zero',
			'Underestimate',
			'Venom Glare',
		],
		off: [
			'Aerial Force',
			'Analytic',
			'Berry Diet',
			'Berry Feast',
			'Eerie Flames',
			'Feeding Frenzy',
			'Flash Fire',
			'Germinate',
			'Litnitwit',
			'Malfunction',
			'Minus',
			'Negative Awareness',
			'Plus',
			'Pyrotechnic',
			'Smelting',
			'Stakeout',
			'Sturdy Fire',
			'Unburden',
			'Wicked Power'
		],
	};

	if (gen !== 8) {
		TOGGLE_ABILITIES.on.push('Intrepid Sword', 'Dauntless Shield');
	}

	if (TOGGLE_ABILITIES.on.indexOf(ability) >= 0) {
		$(this).closest(".poke-info").find(".abilityToggle").show();
		$(this).closest(".poke-info").find(".abilityToggle").prop("checked", true);
	} else if (TOGGLE_ABILITIES.off.indexOf(ability) >= 0) {
		$(this).closest(".poke-info").find(".abilityToggle").show();
		$(this).closest(".poke-info").find(".abilityToggle").prop("checked", false);
	} else {
		$(this).closest(".poke-info").find(".abilityToggle").hide();
	}

	checkRivalry(ability);

	var boostedStat = $(this).closest(".poke-info").find(".boostedStat");
	if (['Air Drive', 'Ancient Marble', 'Cactus Drive', 'Heavy Drive', 'Jade Drive', 'Jelly-Filled Drive', 'Magic Drive', 'Phantom Drive', 'Protoavian', 'Protolithos', 'Protoneuron', 'Protopyre', 'Protorefraction', 'Protosynthesis', 'Prototoxin', 'Quark Drive', 'Toxic Drive', 'Wind Drive', 'Protostasis'].includes(ability)) {
		boostedStat.show();
		autosetQP($(this).closest(".poke-info"));
	} else {
		boostedStat.val("");
		boostedStat.hide();
	}

	if (ability === "Biosynthesis") {
		autosetBiosynthesis($(this).closest(".poke-info"));
	}

	if (ability === "Reactive Core") {
		$(this).closest(".poke-info").find(".reactiveCore").show();
	} else {
		$(this).closest(".poke-info").find(".reactiveCore").val("none");
		$(this).closest(".poke-info").find(".reactiveCore").hide();
	}

	if (['Sinister Grudge', 'Supreme Overlord', 'Iron Lady'].includes(ability)) {
		$(this).closest(".poke-info").find(".alliesFainted").show();
	} else {
		$(this).closest(".poke-info").find(".alliesFainted").val('0');
		$(this).closest(".poke-info").find(".alliesFainted").hide();
	}

	if (ability === "Frozen Calamity") {
		$(this).closest(".poke-info").find(".foesFainted").show();
	} else {
		$(this).closest(".poke-info").find(".foesFainted").val('0');
		$(this).closest(".poke-info").find(".foesFainted").hide();
	}

	if (ability === "Relentless" || ability === "Pristine Beat") {
		$(this).closest('.poke-info').find('.metronome').show();
	} else {
		$(this).closest('.poke-info').find('.metronome').hide();
	}

});

function autosetQP(pokemon) {
	var currentWeather = $("input:radio[name=" + weatherType + "]:checked").val();
	var currentTerrain = $("input:checkbox[name=" + terrainType + "]:checked").val() || "No terrain";

	var item = pokemon.find(".item").val();
	var ability = pokemon.find(".ability").val();
	var boostedStat = pokemon.find(".boostedStat").val();
	var status = pokemon.find(statusType).val();
	var tailwind = pokemon.find(".tailwind").val();

	if (!boostedStat || boostedStat === "auto") {
		if (
			(item === "Booster Energy") ||
			(['Ancient Marble', 'Protoavian', 'Protolithos', 'Protoneuron', 'Protopyre', 'Protorefraction', 'Protosynthesis', 'Prototoxin'].includes(ability) && currentWeather === "Sun") ||
			(['Air Drive', 'Heavy Drive', 'Jade Drive', 'Jelly-Filled Drive', 'Magic Drive', 'Phantom Drive', 'Quark Drive', 'Toxic Drive', 'Wind Drive'].includes(ability) && currentTerrain === "Electric") ||
			(['Protostasis'].includes(ability) && currentWeather === "Snow") ||
			(ability === "Cactus Drive" && currentTerrain === "Grassy") ||
			(ability === "Prototoxin" && ["Poisoned", "Badly Poisoned"].includes(status)) ||
			(ability === "Wind Drive" && tailwind)
		) {
			pokemon.find(".boostedStat").val("auto");
		} else {
			pokemon.find(".boostedStat").val("");
		}
	}
}

function autosetBiosynthesis(pokemon) {
	var currentTerrain = $("input:checkbox[name=" + terrainType + "]:checked").val() || "No terrain";
	var ability = pokemon.find(".ability").val();

	if (ability === 'Biosynthesis') {
		switch (currentTerrain) {
		case "Grassy":
			pokemon.find(".type2").val("Grass");
			break;
		case "Psychic":
			pokemon.find(".type2").val("Psychic");
			break;
		case "Misty":
			pokemon.find(".type2").val("Fairy");
			break;
		case "Electric":
			pokemon.find(".type2").val("Electric");
			break;
		default:
			pokemon.find(".type2").val("(none)");
			break;
		}
	}
}

$("#p1 .ability").bind("keyup change", function () {
	autosetWeather($(this).val(), 0);
	autosetTerrain($(this).val(), 0);
	autosetGravity($(this).val(), 0);
	autosetRuststorm($(this).val(), 0);
	autosetQP($(this).closest(".poke-info"));
	autosetBiosynthesis($(this).closest(".poke-info"));
});

$("input[name=" + weatherType + "]").change(function () {
	var allPokemon = $('.poke-info');
	allPokemon.each(function () {
		autosetQP($(this));
	});
});

var lastManualWeather = "";
var lastAutoWeather = ["", ""];
function autosetWeather(ability, i) {

	if ($('.locked-weather').length) {
		return;
	}

	var currentWeather = $("input:radio[name=" + weatherType + "]:checked").val();
	if (lastAutoWeather.indexOf(currentWeather) === -1) {
		lastManualWeather = currentWeather;
		lastAutoWeather[1 - i] = "";
	}
	switch (ability) {
	case "Drought":
	case "Orichalcum Pulse":
	case "Solar Radiation":
		lastAutoWeather[i] = weatherNames.sun;
		$(weathers.sun).prop("checked", true);
		break;
	case "Drizzle":
	case "Stormy Sight":
	case "Original Sea":
		lastAutoWeather[i] = weatherNames.rain;
		$(weathers.rain).prop("checked", true);
		break;
	case "Sandproof":
	case "Sand Stream":
		lastAutoWeather[i] = weatherNames.sand;
		$(weathers.sand).prop("checked", true);
		break;
	case "Cryowarning":
	case "Snow Warning":
		lastAutoWeather[i] = weatherNames.cold;
		$(weathers.cold).prop("checked", true);
		break;
	case "Desolate Land":
		lastAutoWeather[i] = weatherNames.strongsun;
		$(weathers.strongsun).prop("checked", true);
		break;
	case "Primordial Sea":
		lastAutoWeather[i] = weatherNames.strongrain;
		$(weathers.strongrain).prop("checked", true);
		break;
	case "Delta Stream":
	case "Dragon's Gale":
		lastAutoWeather[i] = weatherNames.strongwinds;
		$(weathers.strongwinds).prop("checked", true);
		break;
	case "Absolute Zero":
		lastAutoWeather[i] = weatherNames.strongcold;
		$(weathers.strongcold).prop("checked", true);
		break;
	case "Dust Devil":
		lastAutoWeather[i] = weatherNames.strongsand;
		$(weathers.strongsand).prop("checked", true);
		break;
	case "Acidic Drizzle":
		lastAutoWeather[i] = weatherNames.acid;
		$(weathers.acid).prop("checked", true);
		break;
	case "Macabre Mourner":
	case "Zombies on Your Lawn":
		lastAutoWeather[i] = weatherNames.grave;
		$(weathers.grave).prop("checked", true);
		break;
	default:
		lastAutoWeather[i] = "";
		var newWeather = lastAutoWeather[1 - i] !== "" ? lastAutoWeather[1 - i] : "";
		$("input:radio[name=" + weatherType + "][value='" + newWeather + "']").prop("checked", true);
		break;
	}
}

$("input[name=" + terrainType + "]").change(function () {
	var allPokemon = $('.poke-info');
	allPokemon.each(function () {
		autosetQP($(this));
		autosetBiosynthesis($(this));
	});
});

var lastManualTerrain = "";
var lastAutoTerrain = ["", ""];
function autosetTerrain(ability, i) {
	var currentTerrain = $("input:checkbox[name=" + terrainType + "]:checked").val() || "No terrain";
	if (lastAutoTerrain.indexOf(currentTerrain) === -1) {
		lastManualTerrain = currentTerrain;
		lastAutoTerrain[1 - i] = "";
	}
	// terrain input uses checkbox instead of radio, need to uncheck all first
	$("input:checkbox[name=" + terrainType + "]:checked").prop("checked", false);
	switch (ability) {
	case "Electric Surge":
	case "Hadron Engine":
	case "Jolt Spores":
	case "Electric Overload":
		lastAutoTerrain[i] = "Electric";
		$(terrains.electric).prop("checked", true);
		break;
	case "Grassy Surge":
		lastAutoTerrain[i] = "Grassy";
		$(terrains.grassy).prop("checked", true);
		break;
	case "Magic Surge":
	case "Misty Surge":
		lastAutoTerrain[i] = "Misty";
		$(terrains.misty).prop("checked", true);
		break;
	case "Armor Surge":
	case "Psychic Surge":
		lastAutoTerrain[i] = "Psychic";
		$(terrains.psychic).prop("checked", true);
		break;
	case "Fishy Surge":
		lastAutoTerrain[i] = "Fishing";
		$(terrains.fishing).prop("checked", true);
		break;
	case "Frozen Landscape":
		lastAutoTerrain[i] = "Frigid";
		$(terrains.frigid).prop("checked", true);
		break;
	default:
		lastAutoTerrain[i] = "";
		var newTerrain = lastAutoTerrain[1 - i] !== "" ? lastAutoTerrain[1 - i] : lastManualTerrain;
		if ("No terrain" !== newTerrain) {
			$("input:checkbox[name=" + terrainType + "][value='" + newTerrain + "']").prop("checked", true);
		}
		break;
	}
}

function autosetGravity(ability, i) {
	switch (ability) {
	case "Heavy Stone":
		$(gravityType).prop("checked", true);
		break;
	default:
		$(gravityType).prop("checked", false);
	}
}

function autosetRuststorm(ability, i) {
	switch (ability) {
	case "Rusted Gale":
		$("#ruststorm").prop("checked", true);
		break;
	default:
		$("#ruststorm").prop("checked", false);
	}
}

$("#p1 .item").bind("keyup change", function () {
	autosetStatus("#p1", $(this).val());
});

var lastManualStatus = {"#p1": "Healthy"};
var lastAutoStatus = {"#p1": "Healthy"};
function autosetStatus(p, item) {
	var currentStatus = $(p + " .status").val();
	if (currentStatus !== lastAutoStatus[p]) {
		lastManualStatus[p] = currentStatus;
	}
	if (item === "Flame Orb") {
		lastAutoStatus[p] = "Burned";
		$(p + " .status").val("Burned");
		$(p + " .status").change();
	} else if (item === "Toxic Orb") {
		lastAutoStatus[p] = "Badly Poisoned";
		$(p + " .status").val("Badly Poisoned");
		$(p + " .status").change();
	} else {
		lastAutoStatus[p] = "Healthy";
		if (currentStatus !== lastManualStatus[p]) {
			$(p + " .status").val(lastManualStatus[p]);
			$(p + " .status").change();
		}
	}
}

$(statusType).bind("keyup change", function () {
	if ($(this).val() === 'Badly Poisoned') {
		$(this).parent().children(".toxic-counter").show();
	} else {
		$(this).parent().children(".toxic-counter").hide();
	}
});

$(".teraType").change(function () {
	var pokeObj = $(this).closest(".poke-info");
	var checked = pokeObj.find(".teraToggle").prop("checked");
	stellarButtonsVisibility(pokeObj, $(this).val() === "Stellar" && checked);
});

var lockerMove = "";
// auto-update move details on select
$(".move-selector").change(function () {
	var moveName = $(this).val();
	var move = moves[moveName] || moves['(No Move)'];
	var moveGroupObj = $(this).parent();
	moveGroupObj.children(".move-bp").val(moveName === 'Present' ? 40 : move.bp);
	var m = moveName.match(HIDDEN_POWER_REGEX);
	if (m) {
		var pokeObj = $(this).closest(".poke-info");
		var pokemon = createPokemon(pokeObj);
		var actual = calc.Stats.getHiddenPower(GENERATION, pokemon.ivs);
		if (actual.type !== m[1]) {
			var hpIVs = calc.Stats.getHiddenPowerIVs(GENERATION, m[1]);
			if (hpIVs && gen < 7) {
				for (var i = 0; i < LEGACY_STATS[gen].length; i++) {
					var legacyStat = LEGACY_STATS[gen][i];
					var stat = legacyStatToStat(legacyStat);
					pokeObj.find("." + legacyStat + " .ivs").val(hpIVs[stat] !== undefined ? hpIVs[stat] : 31);
					pokeObj.find("." + legacyStat + " .dvs").val(hpIVs[stat] !== undefined ? calc.Stats.IVToDV(hpIVs[stat]) : 15);
				}
				if (gen < 3) {
					var hpDV = calc.Stats.getHPDV({
						atk: pokeObj.find(".at .ivs").val(),
						def: pokeObj.find(".df .ivs").val(),
						spe: pokeObj.find(".sp .ivs").val(),
						spc: pokeObj.find(".sa .ivs").val()
					});
					pokeObj.find(".hp .ivs").val(calc.Stats.DVToIV(hpDV));
					pokeObj.find(".hp .dvs").val(hpDV);
				}
				pokeObj.change();
				moveGroupObj.children(".move-bp").val(gen >= 6 ? 60 : 70);
			}
		} else {
			moveGroupObj.children(".move-bp").val(actual.power);
		}
	} else if (gen >= 2 && gen <= 6 && HIDDEN_POWER_REGEX.test($(this).attr('data-prev'))) {
		// If this selector was previously Hidden Power but now isn't, reset all IVs/DVs to max.
		var pokeObj = $(this).closest(".poke-info");
		for (var i = 0; i < LEGACY_STATS[gen].length; i++) {
			var legacyStat = LEGACY_STATS[gen][i];
			pokeObj.find("." + legacyStat + " .ivs").val(31);
			pokeObj.find("." + legacyStat + " .dvs").val(15);
		}
	}
	$(this).attr('data-prev', moveName);
	moveGroupObj.children(".move-type").val(move.type);
	moveGroupObj.children(".move-cat").val(move.category);
	var isDynamaxed = $(this).closest(".poke-info").find(".max").prop("checked");
	moveGroupObj.children(".move-crit").prop("checked", !isDynamaxed && move.willCrit === true);

	var stat = move.category === 'Special' ? 'spa' : 'atk';
	if (Array.isArray(move.multihit) || (!isNaN(move.multihit) && move.multiaccuracy)) {
		moveGroupObj.children(".move-times").hide();
		moveGroupObj.children(".move-times").val(1);
		moveGroupObj.children(".move-hits").empty();
		if (!isNaN(move.multihit)) {
			for (var i = 1; i <= move.multihit; i++) {
				moveGroupObj.children(".move-hits").append("<option value=" + i + ">" + i + " hits</option>");
			}
		} else {
			for (var i = 1; i <= move.multihit[1]; i++) {
				moveGroupObj.children(".move-hits").append("<option value=" + i + ">" + i + " hits</option>");
			}
		}
		moveGroupObj.children(".move-hits").show();
		var pokemon = $(this).closest(".poke-info");

		var moveHits = 3;
		if (move.multiaccuracy) {
			moveHits = move.multihit;
		} else if (['Skill Link', 'Toxic Links'].includes(pokemon.find('.ability').val())) {
			moveHits = 5;
		} else if (pokemon.find(".item").val() === 'Loaded Dice') {
			moveHits = 4;
		}
		if (pokemon.find(statusType).val() === 'Drowsy') {
			moveHits = 1;
		}

		moveGroupObj.children(".move-hits").val(moveHits);
	} else if (!isNaN(move.multihit)) {
		moveGroupObj.children(".move-hits").val(1);
		moveGroupObj.children(".move-hits").hide();
		moveGroupObj.children(".move-times").val(1);
		moveGroupObj.children(".move-times").hide();
	} else {
		moveGroupObj.children(".move-hits").val(1);
		moveGroupObj.children(".move-hits").hide();
		moveGroupObj.children(".move-times").show();
	}
	if (moveName === 'Mald Fist' && gen === 23) {
		moveGroupObj.children(".pp-counter").val(16);
		moveGroupObj.children(".pp-counter").show();
	} else if (moveName === 'Trump Card' && gen === 23) {
		moveGroupObj.children(".pp-counter").val(5);
		moveGroupObj.children(".pp-counter").show();
	} else {
		moveGroupObj.children(".pp-counter").val(0);
		moveGroupObj.children(".pp-counter").hide();
	}
	if (moveName === 'Necromancy' && gen === 23) {
		moveGroupObj.children(".moveAlliesFainted").show();
	} else {
		moveGroupObj.children(".moveAlliesFainted").val(0);
		moveGroupObj.children(".moveAlliesFainted").hide();
	}
	if (moveName === 'Balatro Blast' && gen === 23) {
		moveGroupObj.children(".num-trumps").show();
	} else {
		moveGroupObj.children(".num-trumps").val(0);
		moveGroupObj.children(".num-trumps").hide();
	}
	moveGroupObj.children(".move-z").prop("checked", false);
});

$(".item").change(function () {
	var itemName = $(this).val();
	var pokeObj = $(this).closest('.poke-info');

	var $metronomeControl = pokeObj.find('.metronome');
	if (itemName === "Metronome") {
		$metronomeControl.show();
	} else {
		$metronomeControl.hide();
	}

	if (itemName === "Flame Orb") {
		pokeObj.find(".status").val("Burned");
		pokeObj.find(".status").change();
	} else if (itemName === "Toxic Orb") {
		pokeObj.find(".status").val("Badly Poisoned");
		pokeObj.find(".status").change();
	} else if (($(this).attr('data-prev') === "Flame Orb" && pokeObj.find(".status").val() === "Burned") ||
			($(this).attr('data-prev') === "Toxic Orb" && pokeObj.find(".status").val() === "Badly Poisoned")) {
		pokeObj.find(".status").val("Healthy");
		pokeObj.find(".status").change();
	}

	for (var i = 1; i <= 4; i++) {
		var moveSelector = ".move" + i;
		var moveHits = 3;

		var moveName = pokeObj.find(moveSelector).find(".select2-chosen").text();
		var move = moves[moveName] || moves['(No Move)'];
		if (move.multiaccuracy) {
			moveHits = move.multihit;
		} else if (['Skill Link', 'Toxic Links'].includes(pokeObj.find(".ability").val())) {
			moveHits = 5;
		} else if (pokeObj.find(".item").val() === 'Loaded Dice') {
			moveHits = 4;
		}
		if (pokeObj.find(statusType).val() === 'Drowsy') {
			moveHits = 1;
		}
		pokeObj.find(moveSelector).find(".move-hits").val(moveHits);
	}

	autosetQP(pokeObj);
	pokeObj.find('.item').attr('data-prev', itemName);
});

function smogonAnalysis(pokemonName) { // NewGenChange
	var generation = ["champions", "rb", "gs", "rs", "dp", "bw", "xy", "sm", "ss", "sv", "js", "bwyb", "th", "mh", "sbs", "ts", "pm", "dnu", "bca", "bcc", "fevgc", "mmm4", "megasr", "if", "fesv", 'bcd'][gen];
	if (pokemonName === "Aegislash-Shield" || pokemonName === "Aegislash-Both") pokemonName = "Aegislash";
	return "https://smogon.com/dex/" + generation + "/pokemon/" + pokemonName.toLowerCase() + "/";
}

// auto-update set details on select
$(".set-selector").change(function () {
	var fullSetName = $(this).val();
	var pokemonName = fullSetName.substring(0, fullSetName.indexOf(" ("));
	var setName = fullSetName.substring(fullSetName.indexOf("(") + 1, fullSetName.lastIndexOf(")"));
	var pokemon = pokedex[pokemonName];
	if (pokemon) {
		var pokeObj = $(this).closest(".poke-info");
		var isAutoTera =
		(startsWith(pokemonName, "Ogerpon") && endsWith(pokemonName, "Tera")) ||
		pokemonName === 'Terapagos-Stellar' || (startsWith(pokemonName, "Ogereena") && endsWith(pokemonName, "Tera"));
		if (stickyMoves.getSelectedSide() === pokeObj.prop("id")) {
			stickyMoves.clearStickyMove();
		}
		if (gen === 12) {
			pokeObj.find(".gender").val("Female");
		}
		pokeObj.find(".teraToggle").prop("checked", isAutoTera);
		pokeObj.find(".bigToggle").prop("checked", false);
		pokeObj.find(".max").prop("checked", false);
		stellarButtonsVisibility(pokeObj, 0);
		pokeObj.find(".boostedStat").val("");
		pokeObj.find(".analysis").attr("href", smogonAnalysis(pokemonName));
		pokeObj.find(".type1").val(pokemon.types[0]);
		pokeObj.find(".type2").val(pokemon.types[1]);
		pokeObj.find(".type3").val(pokemon.types[2]);
		pokeObj.find(".type4").val(pokemon.types[3]);
		pokeObj.find(".hp .base").val(pokemon.bs.hp);
		var i;
		for (i = 0; i < LEGACY_STATS[gen].length; i++) {
			pokeObj.find("." + LEGACY_STATS[gen][i] + " .base").val(pokemon.bs[LEGACY_STATS[gen][i]]);
		}
		pokeObj.find(".boost").val(0);
		pokeObj.find(".percent-hp").val(100);
		pokeObj.find(statusType).val("Healthy");
		$(statusType).change();
		var moveObj;
		var abilityObj = pokeObj.find(".ability");
		var itemObj = pokeObj.find(".item");
		var randset;
		if ($("#randoms").prop("checked")) {
			if (gen >= 8) {
				// The Gens 8 and 9 randdex contains information for multiple Random Battles formats for each Pokemon.
				// Duraludon, for example, has data for Randoms, Doubles Randoms, and Baby Randoms.
				// Therefore, the information for only the format chosen should be used.
				if (setName.endsWith("-Gmax")) {
					setName = setName.slice(0, -5);
					randset = randdex[pokemonName + "-Gmax"][setName];
					randset.isGmax = true;
				} else {
					randset = randdex[pokemonName][setName];
				}
			} else {
				randset = randdex[pokemonName];
			}
		}
		var regSets = pokemonName in setdex && setName in setdex[pokemonName];

		if (randset) {
			var listItems = randset.items ? randset.items : [];
			var listAbilities = randset.abilities ? randset.abilities : [];
			if (gen >= 3) $(this).closest('.poke-info').find(".ability-pool").show();
			$(this).closest('.poke-info').find(".extraSetAbilities").text(listAbilities.join(', '));
			if (gen >= 2) $(this).closest('.poke-info').find(".item-pool").show();
			$(this).closest('.poke-info').find(".extraSetItems").text(listItems.join(', '));
			if (!(gen === 8 && setName === 'BDSP Randoms') && gen !== 1) {
				$(this).closest('.poke-info').find(".role-pool").show();
				if (gen >= 9) $(this).closest('.poke-info').find(".tera-type-pool").show();
			} else {
				$(this).closest('.poke-info').find(".role-pool").hide();
			}
			var listRoles = randset.roles ? Object.keys(randset.roles) : [];
			$(this).closest('.poke-info').find(".extraSetRoles").text(listRoles.join(', '));
			var listTeraTypes = [];
			if (randset.roles && gen >= 9) {
				for (var roleName in randset.roles) {
					var role = randset.roles[roleName];
					for (var q = 0; q < role.teraTypes.length; q++) {
						if (listTeraTypes.indexOf(role.teraTypes[q]) === -1) {
							listTeraTypes.push(role.teraTypes[q]);
						}
					}
				}
			}
			pokeObj.find(".teraType").val(listTeraTypes[0] || getForcedTeraType(pokemonName, pokeObj.find(".ability")) || pokemon.types[0]);
			$(this).closest('.poke-info').find(".extraSetTeraTypes").text(listTeraTypes.join(', '));
		} else {
			$(this).closest('.poke-info').find(".ability-pool").hide();
			$(this).closest('.poke-info').find(".item-pool").hide();
			$(this).closest('.poke-info').find(".role-pool").hide();
			$(this).closest('.poke-info').find(".tera-type-pool").hide();
		}
		if (regSets || randset) {
			var set = regSets ? correctHiddenPower(setdex[pokemonName][setName]) : randset;
			if (regSets) {
				pokeObj.find(".teraType").val(set.teraType || getForcedTeraType(pokemonName, pokeObj.find(".ability")) || pokemon.types[0]);
			}
			pokeObj.find(".gmaxToggle").prop("checked", pokemon.canGigantamax && set.isGmax || false);
			pokeObj.find(".level").val(set.level === undefined ? 100 : set.level);
			var evsDefault = gen < 3 ? 252 : ($("#randoms").prop("checked") ? 84 : 0);
			for (i = 0; i < LEGACY_STATS[gen].length; i++) {
				var stat = $("#randoms").prop("checked") ? legacyStatToStat(LEGACY_STATS[gen][i]) : LEGACY_STATS[gen][i];
				pokeObj.find("." + LEGACY_STATS[gen][i] + " .evs").val(
					(set.evs && set.evs[stat] !== undefined) ? set.evs[stat] : evsDefault);
				if ($("#champions").prop("checked") && !set.sps) {
					var sps = set.evs && set.evs[stat] !== undefined ? set.evs[stat] : 0;
					if (sps === 4) sps = 1;
					else sps = Math.ceil(sps / 8);
					pokeObj.find("." + LEGACY_STATS[gen][i] + " .sps").val(sps);
				}
				pokeObj.find("." + LEGACY_STATS[gen][i] + " .ivs").val(
					(set.ivs && set.ivs[stat] !== undefined) ? set.ivs[stat] : 31);
				pokeObj.find("." + LEGACY_STATS[gen][i] + " .dvs").val(
					(set.dvs && set.dvs[stat] !== undefined) ? set.dvs[stat] : 15);
				if (set.sps) {
					pokeObj.find("." + LEGACY_STATS[gen][i] + " .sps").val(set.sps[stat] !== undefined ? set.sps[stat] : 0);
				}
			}
			setSelectValueIfValid(pokeObj.find(".nature"), set.nature, "Hardy");
			var abilityFallback = (typeof pokemon.abilities !== "undefined") ? pokemon.abilities[0] : "";
			if ($("#randoms").prop("checked")) {
				setSelectValueIfValid(abilityObj, randset.abilities && randset.abilities[0], abilityFallback);
				setSelectValueIfValid(itemObj, randset.items && randset.items[0], "");
			} else {
				setSelectValueIfValid(abilityObj, set.ability, abilityFallback);
				setSelectValueIfValid(itemObj, set.item, "");
			}
			var setMoves = set.moves;
			if (randset) {
				if ((gen === 8 && setName === 'BDSP Randoms') || gen === 1) {
					setMoves = randset.moves;
				} else {
					setMoves = [];
					for (var role in randset.roles) {
						for (var q = 0; q < randset.roles[role].moves.length; q++) {
							var moveName = randset.roles[role].moves[q];
							if (setMoves.indexOf(moveName) === -1) setMoves.push(moveName);
						}
					}
				}
			}
			var moves = selectMovesFromRandomOptions(setMoves);
			for (i = 0; i < 4; i++) {
				moveObj = pokeObj.find(".move" + (i + 1) + " select.move-selector");
				moveObj.attr('data-prev', moveObj.val());
				setSelectValueIfValid(moveObj, moves[i], "(No Move)");
				moveObj.change();
			}
			if (randset) {
				$(this).closest('.poke-info').find(".move-pool").show();
				$(this).closest('.poke-info').find(".extraSetMoves").html(formatMovePool(setMoves));
			}
		} else {
			pokeObj.find(".teraType").val(getForcedTeraType(pokemonName, pokeObj.find(".ability")) || pokemon.types[0]);
			pokeObj.find(".gmaxToggle").prop("checked", false);
			pokeObj.find(".level").val(defaultLevel);
			pokeObj.find(".hp .sps").val(0);
			pokeObj.find(".hp .evs").val(gen > 2 ? 0 : 252);
			pokeObj.find(".hp .ivs").val(31);
			pokeObj.find(".hp .dvs").val(15);
			for (i = 0; i < LEGACY_STATS[gen].length; i++) {
				pokeObj.find("." + LEGACY_STATS[gen][i] + " .sps").val(0);
				pokeObj.find("." + LEGACY_STATS[gen][i] + " .evs").val(gen > 2 ? 0 : 252);
				pokeObj.find("." + LEGACY_STATS[gen][i] + " .ivs").val(31);
				pokeObj.find("." + LEGACY_STATS[gen][i] + " .dvs").val(15);
			}
			pokeObj.find(".nature").val("Hardy");
			setSelectValueIfValid(abilityObj, pokemon.abilities && pokemon.abilities[0], "");
			if ((startsWith(pokemonName, "Ogerpon-") && !startsWith(pokemonName, "Ogerpon-Teal")) ||
				(startsWith(pokemonName, "Ogereena-") && !startsWith(pokemonName, "Ogereena-Teal"))) {
				itemObj.val(pokemonName.split("-")[1] + " Mask");
			} else {
				itemObj.val("");
			}
			for (i = 0; i < 4; i++) {
				moveObj = pokeObj.find(".move" + (i + 1) + " select.move-selector");
				moveObj.attr('data-prev', moveObj.val());
				moveObj.val("(No Move)");
				moveObj.change();
			}
			if ($("#randoms").prop("checked")) {
				$(this).closest('.poke-info').find(".move-pool").hide();
			}
		}
		totalEVs(pokeObj);
		if (typeof getSelectedTiers === "function") { // doesn't exist when in 1vs1 mode
			var format = getSelectedTiers()[0];
			var is50lvl = startsWith(format, "VGC") || startsWith(format, "Battle Spot");
			//var isDoubles = format === 'Doubles' || has50lvl; *TODO*
			if (format === "LC") pokeObj.find(".level").val(5);
			if (is50lvl) pokeObj.find(".level").val(50);
			//if (isDoubles) field.gameType = 'Doubles'; *TODO*
		}
		var formeObj = $(this).siblings().find(".forme").parent();
		itemObj.prop("disabled", false);
		var baseForme;
		if (pokemon.baseSpecies && pokemon.baseSpecies !== pokemon.name) {
			baseForme = pokedex[pokemon.baseSpecies];
		}
		if (pokemon.otherFormes) {
			showFormes(formeObj, pokemonName, pokemon, pokemonName);
		} else if (baseForme && baseForme.otherFormes) {
			showFormes(formeObj, pokemonName, baseForme, pokemon.baseSpecies);
		} else {
			formeObj.hide();
		}
		if (gen === 8 && pokemon.canGigantamax) {
			pokeObj.find(".gmaxToggle").parent().show();
		} else {
			pokeObj.find(".gmaxToggle").parent().hide();
		}
		calcStats(pokeObj);
		var total = pokeObj.find(".hp").find(".total").text();
		pokeObj.find(".max-hp").text(total);
		pokeObj.find(".max-hp").attr("data-prev", total);
		pokeObj.find(".current-hp").val(total);
		pokeObj.find(".current-hp").attr("data-set", true);
		calcHP(pokeObj);
		genderSelector(
			gen,
			pokemon.gender,
			pokeObj,
			(regSets || randset) && set.gender ? set.gender : undefined
		);
		$(".ability").each(function () {
			if (checkRivalry($(this).val())) return; // stop after any Rivalry is found, no need to look further
		});
		abilityObj.change();
		itemObj.change();
	}
});

function formatMovePool(moves) {
	var formatted = [];
	for (var i = 0; i < moves.length; i++) {
		formatted.push(isKnownDamagingMove(moves[i]) ? moves[i] : '<i>' + moves[i] + '</i>');
	}
	return formatted.join(', ');
}

function isKnownDamagingMove(move) {
	var m = GENERATION.moves.get(calc.toID(move));
	return m && m.basePower;
}

function selectMovesFromRandomOptions(moves) {
	var selected = [];

	var nonDamaging = [];
	for (var i = 0; i < moves.length; i++) {
		if (isKnownDamagingMove(moves[i])) {
			selected.push(moves[i]);
			if (selected.length >= 4) break;
		} else {
			nonDamaging.push(moves[i]);
		}
	}

	while (selected.length < 4 && nonDamaging.length) {
		selected.push(nonDamaging.pop());
	}

	return selected;
}

function showFormes(formeObj, pokemonName, pokemon, baseFormeName) {
	var formes = pokemon.otherFormes.slice();
	formes.unshift(baseFormeName);

	var defaultForme = formes.indexOf(pokemonName);
	if (defaultForme < 0) defaultForme = 0;

	var formeOptions = getSelectOptions(formes, false, defaultForme);
	formeObj.children("select").find("option").remove().end().append(formeOptions).change();
	formeObj.show();
}

function stellarButtonsVisibility(pokeObj, vis) {
	var fullSetName = pokeObj.find("input.set-selector").val();
	var pokemonName = fullSetName.substring(0, fullSetName.indexOf(" ("));
	var moveObjs = [
		pokeObj.find(".move1"),
		pokeObj.find(".move2"),
		pokeObj.find(".move3"),
		pokeObj.find(".move4")
	];
	if (vis && !startsWith(pokemonName, 'Terapagos')) {
		for (var i = 0; i < moveObjs.length; i++) {
			var moveObj = moveObjs[i];
			moveObj.find(".move-stellar").prop("checked", true);
			moveObj.find(".stellar-btn").show();
		}
		return;
	}
	for (var i = 0; i < moveObjs.length; i++) {
		var moveObj = moveObjs[i];
		moveObj.find(".move-stellar").prop("checked", false);
		moveObj.find(".stellar-btn").hide();
	}
}

function setSelectValueIfValid(select, value, fallback) {
	select.val(!value ? fallback : select.children("option[value='" + value + "']").length ? value : fallback);
}

$(".teraToggle").change(function () {
	var pokeObj = $(this).closest(".poke-info");
	stellarButtonsVisibility(pokeObj, pokeObj.find(".teraType").val() === "Stellar" && this.checked);
	var forme = $(this).parent().siblings().find(".forme");
	var curForme = forme.val();
	if (forme.is(":hidden")) return;
	var container = $(this).closest(".info-group").siblings();
	// Ogerpon and Terapagos mechs
	if (startsWith(curForme, "Ogerpon")) {
		if (
			curForme !== "Ogerpon" && !endsWith(curForme, "Tera") &&
			container.find(".item").val() !== curForme.split("-")[1] + " Mask"
		) return;
		if (this.checked) {
			var newForme = curForme === "Ogerpon" ? "Ogerpon-Teal-Tera" : curForme + "-Tera";
			forme.val(newForme);
			container.find(".ability").val("Embody Aspect (" + newForme.split("-")[1] + ")");
			return;
		}
		if (!endsWith(curForme, "Tera")) return;
		var newForme = curForme === "Ogerpon-Teal-Tera" ? "Ogerpon" : curForme.slice(0, -5);
		forme.val(newForme);
		container.find(".ability").val(pokedex[newForme].abilities[0]);
	} else if (startsWith(curForme, "Ogereena")) {
		if (
			curForme !== "Ogerpon" && !endsWith(curForme, "Tera") &&
			container.find(".item").val() !== curForme.split("-")[1] + " Mask"
		) return;
		if (this.checked) {
			var newForme = curForme === "Ogereena" ? "Ogereena-Teal-Tera" : curForme + "-Tera";
			forme.val(newForme);
			container.find(".ability").val("Embody Aspect (" + newForme.split("-")[1] + ")");
			return;
		}
		if (!endsWith(curForme, "Tera")) return;
		var newForme = curForme === "Ogereena-Teal-Tera" ? "Ogereena" : curForme.slice(0, -5);
		forme.val(newForme);
		container.find(".ability").val(pokedex[newForme].abilities[0]);
	} else if (startsWith(curForme, "Terapagos")) {
		if (this.checked) {
			var newForme = "Terapagos-Stellar";

			forme.val(newForme);
			container.find(".ability").val(pokedex[newForme].abilities[0]);

			for (var property in pokedex[newForme].bs) {
				var baseStat = container.find("." + property).find(".base");
				baseStat.val(pokedex[newForme].bs[property]);
				baseStat.keyup();
			}
			return;
		}

		if (!endsWith(curForme, "Stellar")) return;
		var newForme = "Terapagos-Terastal";

		forme.val(newForme);
		container.find(".ability").val(pokedex[newForme].abilities[0]);
		for (var property in pokedex[newForme].bs) {
			var baseStat = container.find("." + property).find(".base");
			baseStat.val(pokedex[newForme].bs[property]);
			baseStat.keyup();
		}
	}
});

$(".forme").change(function () {
	var altForme = pokedex[$(this).val()],
		container = $(this).closest(".info-group").siblings(),
		fullSetName = container.find(".select2-chosen").first().text(),
		pokemonName = fullSetName.substring(0, fullSetName.indexOf(" (")),
		setName = fullSetName.substring(fullSetName.indexOf("(") + 1, fullSetName.lastIndexOf(")"));

	$(this).parent().siblings().find(".type1").val(altForme.types[0]);
	$(this).parent().siblings().find(".type2").val(altForme.types[1] ? altForme.types[1] : "");
	$(this).parent().siblings().find(".type3").val(altForme.types[2] ? altForme.types[2] : "");
	$(this).parent().siblings().find(".type4").val(altForme.types[3] ? altForme.types[3] : "");
	genderSelector(gen, altForme.gender, container.parent(), container.parent().find(".gender").val());
	$(this).parent().siblings().find(".analysis").attr("href", smogonAnalysis($(this).val()));
	for (var i = 0; i < LEGACY_STATS[9].length; i++) {
		var baseStat = container.find("." + LEGACY_STATS[9][i]).find(".base");
		baseStat.val(altForme.bs[LEGACY_STATS[9][i]]);
		baseStat.keyup();
	}
	if (
		(startsWith($(this).val(), "Ogerpon") && endsWith($(this).val(), "Tera")) || $(this).val() === "Terapagos-Stellar" || (startsWith($(this).val(), "Ogereena") && endsWith($(this).val(), "Tera"))
	) {
		$(this).parent().siblings().find(".teraToggle").prop("checked", true);
	}
	var isRandoms = $("#randoms").prop("checked");
	var pokemonSets = isRandoms ? randdex[pokemonName] : setdex[pokemonName];
	var chosenSet = isRandoms && gen < 8 ? pokemonSets : pokemonSets && pokemonSets[setName];
	var greninjaSet = $(this).val().indexOf("Greninja") !== -1;
	var isAltForme = $(this).val() !== pokemonName;
	if (isAltForme && abilities.indexOf(altForme.abilities[0]) !== -1 && !greninjaSet) {
		container.find(".ability").val(altForme.abilities[0]);
	} else if (!isAltForme && abilities.indexOf(altForme.abilities[0]) !== -1 && !greninjaSet) {
		if (chosenSet && (chosenSet.ability || chosenSet.abilities[0])) {
			container.find(".ability").val(isRandoms ? chosenSet.abilities[0] : chosenSet.ability);
		} else {
			container.find(".ability").val(altForme.abilities[0]);
		}
	} else if (greninjaSet) {
		$(this).parent().find(".ability");
	} else if (chosenSet) {
		if (!isRandoms) {
			container.find(".abilities").val(chosenSet.ability);
		} else {
			container.find(".ability").val(chosenSet.abilities[0]);
		}
	}
	var forcedTeraType = getForcedTeraType($(this).val(), $(this).parent().find(".ability"));
	if (forcedTeraType) {
		$(this).parent().siblings().find(".teraType").val(forcedTeraType);
	}
	container.find(".ability").keyup();
	if (startsWith($(this).val(), "Ogerpon-") && !startsWith($(this).val(), "Ogerpon-Teal") || startsWith($(this).val(), "Ogereena-") && !startsWith($(this).val(), "Ogereena-Teal")) {
		container.find(".item").val($(this).val().split("-")[1] + " Mask").keyup();
	} else {
		container.find(".item").prop("disabled", false);
	}
});

function correctHiddenPower(pokemon) {
	// After Gen 7 bottlecaps means you can have a HP without perfect IVs
	// Level 100 is elided from sets so if its undefined its level 100
	if (gen >= 7 && (!pokemon.level || pokemon.level >= 100)) return pokemon;

	// Convert the legacy stats table to a useful one, and also figure out if all are maxed
	var ivs = {};
	var maxed = true;
	for (var i = 0; i <= LEGACY_STATS[9].length; i++) {
		var s = LEGACY_STATS[9][i];
		var iv = ivs[legacyStatToStat(s)] = (pokemon.ivs && typeof pokemon.ivs[s] !== "undefined") ? pokemon.ivs[s] : 31;
		if (iv !== 31) maxed = false;
	}

	var expected = calc.Stats.getHiddenPower(GENERATION, ivs);
	for (var i = 0; i < pokemon.moves.length; i++) {
		var m = pokemon.moves[i].match(HIDDEN_POWER_REGEX);
		if (!m) continue;
		// The Hidden Power type matches the IVs provided so we don't need to do anything else
		if (expected.type === m[1]) {
			continue;
		}
		// The Pokemon has Hidden Power and is not maxed but the types don't match we don't
		// want to attempt to reconcile the user's IVs so instead just correct the HP type
		if (!maxed) {
			pokemon.moves[i] = "Hidden Power " + expected.type;
			continue;
		}
		// Otherwise, use the default preset hidden power IVs that PS would use
		var hpIVs = calc.Stats.getHiddenPowerIVs(GENERATION, m[1]);
		if (!hpIVs) continue; // some impossible type was specified, ignore
		pokemon.ivs = pokemon.ivs || {hp: 31, at: 31, df: 31, sa: 31, sd: 31, sp: 31};
		pokemon.dvs = pokemon.dvs || {hp: 15, at: 15, df: 15, sa: 15, sd: 15, sp: 15};
		for (var stat in hpIVs) {
			pokemon.ivs[calc.Stats.shortForm(stat)] = hpIVs[stat];
			pokemon.dvs[calc.Stats.shortForm(stat)] = calc.Stats.IVToDV(hpIVs[stat]);
		}
		if (gen < 3) {
			pokemon.dvs.hp = calc.Stats.getHPDV({
				atk: pokemon.ivs.at || 31,
				def: pokemon.ivs.df || 31,
				spe: pokemon.ivs.sp || 31,
				spc: pokemon.ivs.sa || 31
			});
			pokemon.ivs.hp = calc.Stats.DVToIV(pokemon.dvs.hp);
		}
	}
	return pokemon;
}

function createPokemon(pokeInfo) {
	if (typeof pokeInfo === "string") { // in this case, pokeInfo is the id of an individual setOptions value whose moveset's tier matches the selected tier(s)
		var name = pokeInfo.substring(0, pokeInfo.indexOf(" ("));
		var setName = pokeInfo.substring(pokeInfo.indexOf("(") + 1, pokeInfo.lastIndexOf(")"));
		var isRandoms = $("#randoms").prop("checked");
		var isChampions = $("#champions").prop("checked");
		var set = isRandoms ? setName.endswith("-Gmax") ? randdex[name + "-Gmax"] : randdex[name] : setdex[name][setName];

		var ivs = {};
		var evs = {};
		for (var i = 0; i < LEGACY_STATS[gen].length; i++) {
			var legacyStat = LEGACY_STATS[gen][i];
			var stat = legacyStatToStat(legacyStat);

			ivs[stat] = (gen >= 3 && set.ivs && typeof set.ivs[legacyStat] !== "undefined") ? set.ivs[legacyStat] : 31;
			var sps = set.sps;
			if (isChampions) {
				var sps = 0;
				if (set.sps) {
					sps = set.sps[legacyStat] || 0;
				} else {
					sps = set.evs && typeof set.evs[legacyStat] !== "undefined" ? set.evs[legacyStat] : 0;
					if (sps === 4) sps = 1;
					else sps = Math.ceil(sps / 8);
				}
				evs[stat] = sps;
			} else {
				evs[stat] = (set.evs && typeof set.evs[legacyStat] !== "undefined") ? set.evs[legacyStat] : 0;
			}
		}
		var moveNames = set.moves;
		if (isRandoms && (gen !== 8 && gen !== 1)) {
			moveNames = [];
			for (var role in set.roles) {
				for (var q = 0; q < set.roles[role].moves.length; q++) {
					var moveName = set.roles[role].moves[q];
					if (moveNames.indexOf(moveName) === -1) moveNames.push(moveName);
				}
			}
		}

		var pokemonMoves = [];
		for (var i = 0; i < 4; i++) {
			var moveName = moveNames[i];
			pokemonMoves.push(new calc.Move(gen, moves[moveName] ? moveName : "(No Move)", {ability: ability, item: item}));
		}

		if (isRandoms) {
			pokemonMoves = pokemonMoves.filter(function (move) {
				return move.category !== "Status";
			});
		}

		return new calc.Pokemon(gen, name, {
			level: set.level,
			ability: set.ability,
			abilityOn: true,
			item: set.item && typeof set.item !== "undefined" && (set.item === "Eviolite" || set.item === "White Herb" || set.item.indexOf("ite") < 0) ? set.item : "",
			gender: set.gender,
			nature: set.nature,
			ivs: ivs,
			evs: evs,
			moves: pokemonMoves
		});
	} else {
		var setName = pokeInfo.find("input.set-selector").val();
		var name;
		if (setName.indexOf("(") === -1) {
			name = setName;
		} else {
			var pokemonName = setName.substring(0, setName.indexOf(" ("));
			var species = pokedex[pokemonName];
			name = (species.otherFormes || (species.baseSpecies && species.baseSpecies !== pokemonName)) ? pokeInfo.find(".forme").val() : pokemonName;
		}

		var baseStats = {};
		var ivs = {};
		var evs = {};
		var boosts = {};
		for (var i = 0; i < LEGACY_STATS[gen].length; i++) {
			var stat = legacyStatToStat(LEGACY_STATS[gen][i]);
			baseStats[stat === 'spc' ? 'spa' : stat] = ~~pokeInfo.find("." + LEGACY_STATS[gen][i] + " .base").val();
			ivs[stat] =
				gen == 0 ? 31 : gen > 2 ? ~~pokeInfo.find("." + LEGACY_STATS[gen][i] + " .ivs").val() : ~~pokeInfo.find("." + LEGACY_STATS[gen][i] + " .dvs").val() * 2 + 1;
			evs[stat] = gen === 0 ? ~~pokeInfo.find("." + LEGACY_STATS[gen][i] + " .sps").val() : ~~pokeInfo.find("." + LEGACY_STATS[gen][i] + " .evs").val();
			boosts[stat] = ~~pokeInfo.find("." + LEGACY_STATS[gen][i] + " .boost").val();
		}
		if (gen === 1) baseStats.spd = baseStats.spa;

		var ability = pokeInfo.find(".ability").val();
		var item = pokeInfo.find(".item").val();
		var gender = pokeInfo.find(".gender").val();
		var isDynamaxed = pokeInfo.find(".max").prop("checked");
		var isBig = pokeInfo.find(".bigToggle").prop("checked");
		var overrideMove;
		if (isDynamaxed && pokeInfo.find(".gmaxToggle").prop("checked")) {
			isDynamaxed = 'gmax';
			overrideMove = species.canGigantamax;
		}
		var teraType = pokeInfo.find(".teraToggle").is(":checked") ? pokeInfo.find(".teraType").val() : undefined;
		var opts = {
			ability: ability,
			item: item,
			gender: gender,
			isDynamaxed: isDynamaxed,
			teraType: teraType,
			isBig: isBig,
			species: name,
			overrideMove: overrideMove,
		};
		pokeInfo.isDynamaxed = isDynamaxed;
		pokeInfo.isBig = isBig;
		calcHP(pokeInfo);
		var curHP = ~~pokeInfo.find(".current-hp").val();
		// FIXME the Pokemon constructor expects non-dynamaxed HP
		if (pokeInfo.isDynamaxed) curHP = Math.floor(curHP / 2);
		var types = [pokeInfo.find(".type1").val(), pokeInfo.find(".type2").val(), pokeInfo.find(".type3").val(),
			pokeInfo.find(".type4").val()];
		return new calc.Pokemon(gen, name, {
			level: ~~pokeInfo.find(".level").val(),
			ability: ability,
			abilityOn: pokeInfo.find(".abilityToggle").is(":checked"),
			item: item,
			gender: gender,
			nature: pokeInfo.find(".nature").val(),
			ivs: ivs,
			evs: evs,
			isDynamaxed: isDynamaxed,
			isBig: isBig,
			alliesFainted: parseInt(pokeInfo.find(".alliesFainted").val()),
			foesFainted: parseInt(pokeInfo.find(".foesFainted").val()),
			boostedStat: pokeInfo.find(".boostedStat").val() || undefined,
			reactiveCore: pokeInfo.find(".reactiveCore").val() || undefined,
			teraType: teraType,
			isDynamaxed: isDynamaxed,
			overrideMove: overrideMove,
			boosts: boosts,
			curHP: curHP,
			status: CALC_STATUS[pokeInfo.find(statusType).val()],
			toxicCounter: pokeInfo.find(statusType).val() === 'Badly Poisoned' ? ~~pokeInfo.find(".toxic-counter").val() : 0,
			moves: [
				getMoveDetails(pokeInfo.find(".move1"), opts),
				getMoveDetails(pokeInfo.find(".move2"), opts),
				getMoveDetails(pokeInfo.find(".move3"), opts),
				getMoveDetails(pokeInfo.find(".move4"), opts),
			],
			overrides: {
				baseStats: baseStats,
				types: types
			}
		});
	}
}

function getGender(gender) {
	if (!gender || gender === 'genderless' || gender === 'N') return 'N';
	if (gender.toLowerCase() === 'male' || gender === 'M') return 'M';
	return 'F';
}

function genderSelector(gen, speciesGender, pokeObj, setGender) {
	if (gen === 1) {
		pokeObj.find(".gender").val("");
		pokeObj.find(".gender").parent().hide();
		return;
	}
	pokeObj.find(".gender").parent().show();
	pokeObj.find(".gender").val(setGender || speciesGender || "");
}

function checkRivalry(ability) {
	if (ability === "Rivalry") {
		$(".gender").each(function () {
			if ($(this).val() === "") $(this).val("M");
		});
		return true;
	}
}

function getMoveDetails(moveInfo, opts) {
	var moveName = moveInfo.find("select.move-selector").val();
	var isZMove = gen > 6 && moveInfo.find("input.move-z").prop("checked");
	var isCrit = moveInfo.find(".move-crit").prop("checked");
	var isStellarFirstUse = moveInfo.find(".move-stellar").prop("checked");
	var hits = +moveInfo.find(".move-hits").val();
	var timesUsed = +moveInfo.find(".move-times").val();
	var timesUsedWithMetronome = moveInfo.find(".metronome").is(':visible') ? +moveInfo.find(".metronome").val() : 1;
	var ppLeft = +moveInfo.find(".pp-counter").val();
	var moveAlliesFainted = +moveInfo.find(".moveAlliesFainted").val();
	var numTrumps = +moveInfo.find(".num-trumps").val();
	var overrides = {
		basePower: +moveInfo.find(".move-bp").val(),
		type: moveInfo.find(".move-type").val()
	};
	if (moveName === 'Tera Blast') {
		// custom logic for stellar type tera blast
		var isStellar = opts.teraType === 'Stellar';
		var statDrops = moveInfo.find('.move-times');
		var dropsStats = statDrops.is(':visible');
		if (isStellar !== dropsStats) {
			// update stat drop dropdown here
			if (isStellar) statDrops.show(); else statDrops.hide();
		}
		if (isStellar) overrides.self = {boosts: {atk: -1, spa: -1}};
	}
	if (gen >= 4) overrides.category = moveInfo.find(".move-cat").val();
	return new calc.Move(gen, moveName, {
		ability: opts.ability, item: opts.item, useZ: isZMove, useMax: opts.isDynamaxed, overrideMove: opts.overrideMove,
		isCrit: isCrit, hits: hits, timesUsed: timesUsed, timesUsedWithMetronome: timesUsedWithMetronome,
		isStellarFirstUse: isStellarFirstUse, overrides: overrides, ppLeft: ppLeft, alliesFainted: moveAlliesFainted,
		numTrumps: numTrumps,
	});
}

function createField() {
	var gameType = $("input:radio[name='format']:checked").val();
	var isBeadsOfRuin = $("#beads").prop("checked");
	var isTabletsOfRuin = $("#tablets").prop("checked");
	var isSwordOfRuin = $("#sword").prop("checked");
	var isVesselOfRuin = $("#vessel").prop("checked");
	var isAutomatonOfRuin = $("#automaton").prop("checked");
	var isDogOfRuin = $("#dog").prop("checked");
	var isLoveOfRuin = $("#love").prop("checked");
	var isPoultryOfRuin = $("#poultry").prop("checked");
	var isMagicRoom = $("#magicroom").prop("checked");
	var isTrickRoom = $("#trickroom").prop("checked");
	var isWonderRoom = $("#wonderroom").prop("checked");
	var isGravity = $(gravityType).prop("checked");
	var isRuststorm = $("#ruststorm").prop("checked");
	var isSR = [$("#srL").prop("checked"), $("#srR").prop("checked")];
	var weather = $("input:radio[name=" + weatherType + "]:checked").val();
	var spikes;
	if (gen === 2) {
		spikes = [$("#gscSpikesL").prop("checked") ? 1 : 0, $("#gscSpikesR").prop("checked") ? 1 : 0];
	} else {
		spikes = [~~$("input:radio[name='spikesL']:checked").val(), ~~$("input:radio[name='spikesR']:checked").val()];
	}
	var steelsurge = [$("#steelsurgeL").prop("checked"), $("#steelsurgeR").prop("checked")];
	var vinelash = [$("#vinelashL").prop("checked"), $("#vinelashR").prop("checked")];
	var wildfire = [$("#wildfireL").prop("checked"), $("#wildfireR").prop("checked")];
	var cannonade = [$("#cannonadeL").prop("checked"), $("#cannonadeR").prop("checked")];
	var volcalith = [$("#volcalithL").prop("checked"), $("#volcalithR").prop("checked")];
	var terrain = ($("input:checkbox[name=" + terrainType + "]:checked").val()) ? $("input:checkbox[name=" + terrainType + "]:checked").val() : "";
	var isReflect = [$("#reflectL").prop("checked"), $("#reflectR").prop("checked")];
	var isLightScreen = [$("#lightScreenL").prop("checked"), $("#lightScreenR").prop("checked")];
	var isProtected = [$("#protectL").prop("checked"), $("#protectR").prop("checked")];
	var isSeeded = [$("#leechSeedL").prop("checked"), $("#leechSeedR").prop("checked")];
	var isSaltCured = [$("#saltCureL").prop("checked"), $("#saltCureR").prop("checked")];
	var isForesight = [$("#foresightL").prop("checked"), $("#foresightR").prop("checked")];
	var isHelpingHand = [$("#helpingHandL").prop("checked"), $("#helpingHandR").prop("checked")];
	var isCharged = [$("#chargeL").prop("checked"), $("#chargeR").prop("checked")];
	var isDragonCharged = [$("#dragonChargeL").prop("checked"), $("#dragonChargeR").prop("checked")];
	var isSigma = [$("#sigmaL").prop("checked"), $("#sigmaR").prop("checked")];
	var isBlastblighted = [$("#blastblightL").prop("checked"), $("#blastblightR").prop("checked")];
	var isBubbleblighted = [$("#bubbleblightL").prop("checked"), $("#bubbleblightR").prop("checked")];
	var isDefenseDown = [$("#defenseDownL").prop("checked"), $("#defenseDownR").prop("checked")];
	var isStenched = [$("#stenchL").prop("checked"), $("#stenchR").prop("checked")];
	var isBlottedOut = [$("#blotOutL").prop("checked"), $("#blotOutR").prop("checked")];
	var isTailwind = [$("#tailwindL").prop("checked"), $("#tailwindR").prop("checked")];
	var isFlowerGift = [$("#flowerGiftL").prop("checked"), $("#flowerGiftR").prop("checked")];
	var isPowerTrick = [$("#powerTrickL").prop("checked"), $("#powerTrickR").prop("checked")];
	var isSteelySpirit = [$("#steelySpiritL").prop("checked"), $("#steelySpiritR").prop("checked")];
	var isFriendGuard = [$("#friendGuardL").prop("checked"), $("#friendGuardR").prop("checked")];
	var isAuroraVeil = [$("#auroraVeilL").prop("checked"), $("#auroraVeilR").prop("checked")];
	var isBattery = [$("#batteryL").prop("checked"), $("#batteryR").prop("checked")];
	var isPowerSpot = [$("#powerSpotL").prop("checked"), $("#powerSpotR").prop("checked")];
	// TODO: support switching in as well!
	var isSwitchingOut = [$("#switchingL").prop("checked"), $("#switchingR").prop("checked")];
	var fishingTokens = [parseInt($('#fishingTokensL').val()), parseInt($('#fishingTokensR').val())];

	var createSide = function (i) {
		return new calc.Side({
			spikes: spikes[i],
			isSR: isSR[i],
			steelsurge: steelsurge[i],
			vinelash: vinelash[i],
			wildfire: wildfire[i],
			cannonade: cannonade[i],
			volcalith: volcalith[i],
			isReflect: isReflect[i],
			isLightScreen: isLightScreen[i],
			isProtected: isProtected[i],
			isSeeded: isSeeded[i],
			isSaltCured: isSaltCured[i],
			isForesight: isForesight[i],
			isTailwind: isTailwind[i],
			isHelpingHand: isHelpingHand[i],
			isFlowerGift: isFlowerGift[i],
			isPowerTrick: isPowerTrick[i],
			isSteelySpirit: isSteelySpirit[i],
			isFriendGuard: isFriendGuard[i],
			isAuroraVeil: isAuroraVeil[i],
			isBattery: isBattery[i],
			isPowerSpot: isPowerSpot[i],
			isSwitching: isSwitchingOut[i] ? 'out' : undefined,
			isCharged: isCharged[i],
			isDragonCharged: isDragonCharged[i],
			isSigma: isSigma[i],
			isBlastblighted: isBlastblighted[i],
			isBubbleblighted: isBubbleblighted[i],
			isDefenseDown: isDefenseDown[i],
			isStenched: isStenched[i],
			isBlottedOut: isBlottedOut[i],
			fishingTokens: fishingTokens[i],
		});
	};
	return new calc.Field({
		gameType: gameType,
		terrain: terrain,
		isBeadsOfRuin: isBeadsOfRuin,
		isTabletsOfRuin: isTabletsOfRuin,
		isSwordOfRuin: isSwordOfRuin,
		isVesselOfRuin: isVesselOfRuin,
		isAutomatonOfRuin: isAutomatonOfRuin,
		isDogOfRuin: isDogOfRuin,
		isLoveOfRuin: isLoveOfRuin,
		isPoultryOfRuin: isPoultryOfRuin,
		weather: weather,
		isMagicRoom: isMagicRoom,
		isTrickRoom: isTrickRoom,
		isWonderRoom: isWonderRoom,
		isGravity: isGravity,
		isRuststorm: isRuststorm,
		attackerSide: createSide(0),
		defenderSide: createSide(1)
	});
}

function calcHP(poke) {
	var total = calcStat(poke, "hp");
	var $maxHP = poke.find(".max-hp");

	var prevMaxHP = Number($maxHP.attr('data-prev')) || total;
	var $currentHP = poke.find(".current-hp");
	var prevCurrentHP = $currentHP.attr('data-set') ? Math.min(Number($currentHP.val()), prevMaxHP) : prevMaxHP;
	// NOTE: poke.find(".percent-hp").val() is a rounded value!
	var prevPercentHP = 100 * prevCurrentHP / prevMaxHP;

	$maxHP.text(total);
	$maxHP.attr('data-prev', total);

	var newCurrentHP = calcCurrentHP(poke, total, prevPercentHP);
	calcPercentHP(poke, total, newCurrentHP);

	$currentHP.attr('data-set', true);
}

function totalEVs(poke) {
	var el = gen === 0 ? ".sps" : ".evs";
	var totalEVs = 0;
	for (var i = 0; i < LEGACY_STATS[gen].length; i++) {
		var statName = LEGACY_STATS[gen][i];
		var stat = poke.find("." + statName);
		var evs = ~~stat.find(el).val();
		totalEVs += evs;
	}
	poke.find(".total" + el.slice(1)).find(el).text(totalEVs);
	return totalEVs;
}

function calcStat(poke, StatID) {
	var stat = poke.find("." + StatID);
	var base = ~~stat.find(".base").val();
	var level = ~~poke.find(".level").val();
	var evs = ~~stat.find(".evs").val();
	var nature, ivs;
	if (gen === 0) {
		level = 50;
		ivs = 31;
		evs = ~~stat.find(".sps").val();
		if (StatID !== "hp") nature = poke.find(".nature").val();
	} else if (gen < 3) {
		ivs = ~~stat.find(".dvs").val() * 2;
	} else {
		ivs = ~~stat.find(".ivs").val();
		if (StatID !== "hp") nature = poke.find(".nature").val();
	}
	// Shedinja still has 1 max HP during the effect even if its Dynamax Level is maxed (DaWoblefet)
	var total = calc.calcStat(gen, legacyStatToStat(StatID), base, ivs, evs, level, nature);
	if (gen > 7 && StatID === "hp" && poke.isDynamaxed && total !== 1) {
		total *= 2;
	}
	stat.find(".total").text(total);
	return total;
}

var GENERATION = {
	'1': 1, 'rb': 1, 'rby': 1,
	'2': 2, 'gs': 2, 'gsc': 2,
	'3': 3, 'rs': 3, 'rse': 3, 'frlg': 3, 'adv': 3,
	'4': 4, 'dp': 4, 'dpp': 4, 'hgss': 4,
	'5': 5, 'bw': 5, 'bw2': 5, 'b2w2': 5,
	'6': 6, 'xy': 6, 'oras': 6,
	'7': 7, 'sm': 7, 'usm': 7, 'usum': 7,
	'8': 8, 'ss': 8,
	'9': 9, 'sv': 9,
	'10': 10, 'js': 10,
	'11': 11, 'bwyb': 11,
	'12': 12, 'th': 12,
	'13': 13, 'mh': 13,
	'14': 14, 'sbs': 14,
	'15': 15, 'ts': 15,
	'16': 16, 'pm': 16,
	'17': 17, 'dnu': 17,
	'18': 18, 'bca': 18,
	'19': 19, 'bcc': 19,
	'20': 20, 'fevgc': 20,
	'21': 21, 'mmm4': 21,
	'22': 22, 'megasr': 22,
	'23': 23, 'if': 23,
	'24': 24, 'fesv': 24,
	'25': 25, 'bcd': 25,
}; // NewGenChange

var SETDEX = [
	typeof SETDEX_CHAMPIONS === 'undefined' ? {} : SETDEX_CHAMPIONS,
	typeof SETDEX_RBY === 'undefined' ? {} : SETDEX_RBY,
	typeof SETDEX_GSC === 'undefined' ? {} : SETDEX_GSC,
	typeof SETDEX_ADV === 'undefined' ? {} : SETDEX_ADV,
	typeof SETDEX_DPP === 'undefined' ? {} : SETDEX_DPP,
	typeof SETDEX_BW === 'undefined' ? {} : SETDEX_BW,
	typeof SETDEX_XY === 'undefined' ? {} : SETDEX_XY,
	typeof SETDEX_SM === 'undefined' ? {} : SETDEX_SM,
	typeof SETDEX_SS === 'undefined' ? {} : SETDEX_SS,
	typeof SETDEX_SV === 'undefined' ? {} : SETDEX_SV,
	typeof SETDEX_JS === 'undefined' ? {} : SETDEX_JS,
	typeof SETDEX_BWYB === 'undefined' ? {} : SETDEX_BWYB,
	typeof SETDEX_TH === 'undefined' ? {} : SETDEX_TH,
	typeof SETDEX_MH === 'undefined' ? {} : SETDEX_MH,
	{},
	{},
	typeof SETDEX_PM === 'undefined' ? {} : SETDEX_PM,
	typeof SETDEX_DNU === 'undefined' ? {} : SETDEX_DNU,
	typeof SETDEX_BCA === 'undefined' ? {} : SETDEX_BCA,
	typeof SETDEX_BCC === 'undefined' ? {} : SETDEX_BCC,
	typeof SETDEX_FEVGC === 'undefined' ? {} : SETDEX_FEVGC,
	typeof SETDEX_MMM4 === 'undefined' ? {} : SETDEX_MMM4,
	typeof SETDEX_MEGASR === 'undefined' ? {} : SETDEX_MEGASR,
	typeof SETDEX_IF === 'undefined' ? {} : SETDEX_IF,
	{},
	typeof SETDEX_BCD === 'undefined' ? {} : SETDEX_BCD
]; // NewGenChange

/*
 * Converts an object that has the hierarchy Format -> Pokemon -> Sets
 * into one that has the hierarchy Pokemon -> Format -> Sets
 * An example for Gen 9 Duraludon would be:
 * {
 *		Randoms: {
 *			...
 *			Duraludon: {...},
 *			...
 *		},
 *		Doubles Randoms: {
 *			...
 *			Duraludon: {...},
 *			...
 *		},
 *		Baby Randoms: {
 *			...
 *			Duraludon: {...},
 *			...
 *		}
 * }
 * getting converted into:
 * {
 *		...
 *		Duraludon: {
 *			Randoms: {...},
 *			Doubles Randoms: {...},
 *			Baby Randoms: {...}
 *		}
 *		...
 * }
 */
function formatRandSets(gen) {
	var combined = {};

	for (var format in gen) {
		var formatSets = gen[format];
		for (var pokemon in formatSets) {
			var sets = formatSets[pokemon];
			if (!(pokemon in combined)) {
				combined[pokemon] = {};
			}
			combined[pokemon][format] = sets;
		}
	}

	return combined;
}

// Creates a single dictionary for Gen 8 & Gen 9 Random Battles formats
var GEN8RANDSETS = formatRandSets({
	"Randoms": typeof GEN8RANDOMBATTLE === 'undefined' ? {} : GEN8RANDOMBATTLE,
	"Doubles Randoms": typeof GEN8RANDOMDOUBLESBATTLE === 'undefined' ? {} : GEN8RANDOMDOUBLESBATTLE,
	"BDSP Randoms": typeof GEN8BDSPRANDOMBATTLE === 'undefined' ? {} : GEN8BDSPRANDOMBATTLE,
});

var GEN9RANDSETS = formatRandSets({
	"Randoms": typeof GEN9RANDOMBATTLE === 'undefined' ? {} : GEN9RANDOMBATTLE,
	"Doubles Randoms": typeof GEN9RANDOMDOUBLESBATTLE === 'undefined' ? {} : GEN9RANDOMDOUBLESBATTLE,
	"Baby Randoms": typeof GEN9BABYRANDOMBATTLE === 'undefined' ? {} : GEN9BABYRANDOMBATTLE,
});

var RANDDEX = [
	{},
	typeof GEN1RANDOMBATTLE === 'undefined' ? {} : GEN1RANDOMBATTLE,
	typeof GEN2RANDOMBATTLE === 'undefined' ? {} : GEN2RANDOMBATTLE,
	typeof GEN3RANDOMBATTLE === 'undefined' ? {} : GEN3RANDOMBATTLE,
	typeof GEN4RANDOMBATTLE === 'undefined' ? {} : GEN4RANDOMBATTLE,
	typeof GEN5RANDOMBATTLE === 'undefined' ? {} : GEN5RANDOMBATTLE,
	typeof GEN6RANDOMBATTLE === 'undefined' ? {} : GEN6RANDOMBATTLE,
	typeof GEN7RANDOMBATTLE === 'undefined' ? {} : GEN7RANDOMBATTLE,
	GEN8RANDSETS,
	GEN9RANDSETS,
	GEN9RANDSETS, // Jumpstarted
	GEN9RANDSETS, // Best Wishes
	GEN9RANDSETS, // Touhou
	GEN9RANDSETS, // Monster Hunter
	GEN9RANDSETS, // Six by Six
	GEN9RANDSETS, // Tier Sovereign
	GEN9RANDSETS, // Paleomons
	GEN9RANDSETS, // DNU
	GEN9RANDSETS, // BC Meta A
	GEN9RANDSETS, // BC Meta C
	GEN9RANDSETS, // FE VGC
	GEN9RANDSETS, // MMM4
	GEN9RANDSETS, // Megas Revisited
	GEN9RANDSETS, // Iron Fist
	GEN9RANDSETS, // FE SV
	{},
]; // New Gen Change
var gen, genWasChanged, notation, pokedex, setdex, randdex, typeChart, moves, abilities, items, calcHP, calcStat, GENERATION;

$(".gen").change(function () {
	/*eslint-disable */
	gen = ~~$(this).val() || 19;
	GENERATION = calc.Generations.get(gen);
	if (gen === 13) { // Monster Hunter Statuses
		statusType = '.status2';
	} else if (gen === 23) { // Iron Fist Statuses
		statusType = '.status3'
	} else {
		statusType = '.status';
	}
	if (gen === 13) {
		gravityType = "#gravity2";
	} else {
		gravityType = "#gravity";
	}
	if (gen === 23) {
		terrainType = "'terrain2'";
		terrains.electric = "#electric2";
		terrains.fishing = "#fishing2";
		terrains.frigid = "#frigid2";
		terrains.grassy = "#grassy2";
		terrains.misty = "#misty2";
		terrains.psychic = "#psychic2";
	} else {
		terrainType = "'terrain'";
		terrains.electric = "#electric";
		terrains.grassy = "#grassy";
		terrains.misty = "#misty";
		terrains.psychic = "#psychic";
	}
	if (gen === 23) {
		weatherType = "'weather-if'";
		weathers.clear = "#clear-if"; weatherNames.clear = "Clear";
		weathers.sun = "#sun-if"; weatherNames.sun = "Sun";
		weathers.rain = "#rain-if"; weatherNames.rain = "Rain";
		weathers.sand = "#sand-if"; weatherNames.sand = "Sand";
		weathers.cold = "#snow-if"; weatherNames.cold = "Snow";
		weathers.grave = "#grave-if"; weatherNames.grave = "Grave";
		weathers.acid = "#acid-if"; weatherNames.acid = "Acid";
	} else if (gen === 14) {
		weatherType = "'weather-sbs'";
		weathers.clear = "#clear-sbs"; weatherNames.clear = "Clear";
		weathers.sun = "#sun-sbs"; weatherNames.sun = "Sun";
		weathers.rain = "#rain-sbs"; weatherNames.rain = "Rain";
		weathers.sand = "#sand-sbs"; weatherNames.sand = "Sand";
		weathers.cold = "#snow-sbs"; weatherNames.cold = "Snow";
		weathers.strongwinds = "#strong-winds-sbs"; weatherNames.strongwinds = "Strong Winds";
	} else if (gen === 13) {
		weatherType = "'weather-mh'";
		weathers.clear = "#clear-mh"; weatherNames.clear = "Clear";
		weathers.sun = "#sun-mh"; weatherNames.sun = "Sun";
		weathers.rain = "#rain-mh"; weatherNames.rain = "Rain";
		weathers.sand = "#sand-mh"; weatherNames.sand = "Sand";
		weathers.cold = "#snow-mh"; weatherNames.cold = "Snow";
		weathers.strongsun = "#harsh-sunshine-mh"; weatherNames.strongsun = "Harsh Sunshine";
		weathers.strongrain = "#heavy-rain-mh"; weatherNames.strongrain = "Heavy Rain";
		weathers.strongwinds = "#strong-winds-mh"; weatherNames.strongwinds = "Strong Winds";
		weathers.strongsand = "#dust-devil-mh"; weatherNames.strongsand = "Dust Devil";
		weathers.strongcold = "#absolute-zero-mh"; weatherNames.strongcold = "Absolute Zero";
	} else if (snowGens.includes(gen)) {
		weatherType = "'weather'";
		weathers.clear = "#clear"; weatherNames.clear = "Clear";
		weathers.sun = "#sun"; weatherNames.sun = "Sun";
		weathers.rain = "#rain"; weatherNames.rain = "Rain";
		weathers.sand = "#sand"; weatherNames.sand = "Sand";
		weathers.cold = "#snow"; weatherNames.cold = "Snow";
		weathers.strongsun = "#harsh-sunshine"; weatherNames.strongsun = "Harsh Sunshine";
		weathers.strongrain = "#heavy-rain"; weatherNames.strongsun = "Heavy Rain";
		weathers.strongwinds = "#strong-winds"; weatherNames.strongsun = "Strong Winds";
	} else if (hailGens.includes(gen)) {
		weatherType = "'weather-hail'";
		weathers.clear = "#clear-hail"; weatherNames.clear = "Clear";
		weathers.sun = "#sun-hail"; weatherNames.sun = "Sun";
		weathers.rain = "#rain-hail"; weatherNames.rain = "Rain";
		weathers.sand = "#sand-hail"; weatherNames.sand = "Sand";
		weathers.cold = "#hail-hail"; weatherNames.cold = "Hail";
		weathers.strongsun = "#harsh-sunshine-hail"; weatherNames.strongsun = "Harsh Sunshine";
		weathers.strongrain = "#heavy-rain-hail"; weatherNames.strongsun = "Heavy Rain";
		weathers.strongwinds = "#strong-winds-hail"; weatherNames.strongsun = "Strong Winds";
	} else {
		weatherType = "'weather-nocold'";
		weathers.clear = "#clear-nocold"; weatherNames.clear = "Clear";
		weathers.sun = "#sun-nocold"; weatherNames.sun = "Sun";
		weathers.rain = "#rain-nocold"; weatherNames.rain = "Rain";
		weathers.sand = "#sand-nocold"; weatherNames.sand = "Sand";
	}
	var params = new URLSearchParams(window.location.search);
	if (gen === 19) {
		params.delete('gen');
		params = '' + params;
		if (window.history && window.history.replaceState) {
			window.history.replaceState({}, document.title, window.location.pathname + (params.length ? '?' + params : ''));
		}
	} else {
		params.set('gen', gen);
		if (window.history && window.history.pushState) {
			params.sort();
			var path = window.location.pathname + '?' + params;
			window.history.pushState({}, document.title, path);
			gtag('config', 'UA-26211653-3', {'page_path': path});
		}
	}
	genWasChanged = true;
	/* eslint-enable */
	// declaring these variables with var here makes z moves not work; TODO
	pokedex = calc.SPECIES[gen];
	setdex = SETDEX[gen];
	randdex = RANDDEX[gen];
	if ('Aegislash' in randdex) randdex['Aegislash-Shield'] = randdex['Aegislash'];
	typeChart = calc.TYPE_CHART[gen];
	moves = calc.MOVES[gen];
	items = calc.ITEMS[gen];
	abilities = calc.ABILITIES[gen];
	clearField();
	if (gen === 20) {
		$("#default-level-50").prop("checked", true);
		$("#default-level-50").change();
		$("#doubles-format").prop("checked", true);
		$("#doubles-format").change();
	} else {
		$("#default-level-100").prop("checked", true);
		$("#default-level-100").change();
		$("#singles-format").prop("checked", true);
		$("#singles-format").change();
	}
	$("#importedSets").prop("checked", false);
	loadDefaultLists();
	$(".gen-specific.g" + gen).show();
	$(".gen-specific").not(".g" + gen).hide();
	$("input:radio[name='format']").change();
	var typeOptions = getSelectOptions(Object.keys(typeChart));
	$("select.type1, select.move-type").find("option").remove().end().append(typeOptions);
	$("select.teraType").find("option").remove().end().append(getSelectOptions(Object.keys(typeChart).slice(1)));
	$("select.type2").find("option").remove().end().append("<option value=\"\">(none)</option>" + typeOptions);
	$("select.type3").find("option").remove().end().append("<option value=\"\">(none)</option>" + typeOptions);
	$("select.type4").find("option").remove().end().append("<option value=\"\">(none)</option>" + typeOptions);
	var moveOptions = getSelectOptions(Object.keys(moves), true);
	$("select.move-selector").find("option").remove().end().append(moveOptions);
	var abilityOptions = getSelectOptions(abilities, true);
	$("select.ability").find("option").remove().end().append("<option value=\"\">(other)</option>" + abilityOptions);
	var itemOptions = getSelectOptions(items, true);
	$("select.item").find("option").remove().end().append("<option value=\"\">(none)</option>" + itemOptions);

	$(".set-selector").val(getFirstValidSetOption().id);
	$(".set-selector").change();
});

function getFirstValidSetOption() {
	var sets = getSetOptions();
	// NB: The first set is never valid, so we start searching after it.
	for (var i = 1; i < sets.length; i++) {
		if (sets[i].id && sets[i].id.indexOf('(Blank Set)') === -1) return sets[i];
	}
	return undefined;
}

$(".notation").change(function () {
	notation = $(this).val();
});

function clearField() {
	$("#singles-format").prop("checked", true);
	$("#clear").prop("checked", true);
	$("#gscClear").prop("checked", true);
	$(gravityType).prop("checked", false);
	$("#magicroom").prop("checked", false);
	$("#wonderroom").prop("checked", false);
	$("#srL").prop("checked", false);
	$("#srR").prop("checked", false);
	$("#spikesL0").prop("checked", true);
	$("#spikesR0").prop("checked", true);
	$("#gscSpikesL").prop("checked", false);
	$("#gscSpikesR").prop("checked", false);
	$("#steelsurgeL").prop("checked", false);
	$("#steelsurgeR").prop("checked", false);
	$("#vinelashL").prop("checked", false);
	$("#vinelashR").prop("checked", false);
	$("#wildfireL").prop("checked", false);
	$("#wildfireR").prop("checked", false);
	$("#cannonadeL").prop("checked", false);
	$("#cannonadeR").prop("checked", false);
	$("#volcalithL").prop("checked", false);
	$("#volcalithR").prop("checked", false);
	$("#reflectL").prop("checked", false);
	$("#reflectR").prop("checked", false);
	$("#lightScreenL").prop("checked", false);
	$("#lightScreenR").prop("checked", false);
	$("#protectL").prop("checked", false);
	$("#protectR").prop("checked", false);
	$("#leechSeedL").prop("checked", false);
	$("#leechSeedR").prop("checked", false);
	$("#flowerGiftL").prop("checked", false);
	$("#flowerGiftR").prop("checked", false);
	$("#powerTrickL").prop("checked", false);
	$("#powerTrickR").prop("checked", false);
	$("#steelySpiritL").prop("checked", false);
	$("#steelySpiritR").prop("checked", false);
	$("#saltCureL").prop("checked", false);
	$("#saltCureR").prop("checked", false);
	$("#foresightL").prop("checked", false);
	$("#foresightR").prop("checked", false);
	$("#helpingHandL").prop("checked", false);
	$("#helpingHandR").prop("checked", false);
	$("#chargeL").prop("checked", false);
	$("#chargeR").prop("checked", false);
	$("#dragonChargeL").prop("checked", false);
	$("#dragonChargeR").prop("checked", false);
	$("#sigmaL").prop("checked", false);
	$("#sigmaChargeR").prop("checked", false);
	$("#blastblightL").prop("checked", false);
	$("#blastblightR").prop("checked", false);
	$("#bubbleblightL").prop("checked", false);
	$("#bubbleblightR").prop("checked", false);
	$("#defenseDownL").prop("checked", false);
	$("#defenseDownR").prop("checked", false);
	$("#stenchL").prop("checked", false);
	$("#stenchR").prop("checked", false);
	$("#blotOutL").prop("checked", false);
	$("#blotOutR").prop("checked", false);
	$("#tailwindL").prop("checked", false);
	$("#tailwindR").prop("checked", false);
	$("#friendGuardL").prop("checked", false);
	$("#friendGuardR").prop("checked", false);
	$("#auroraVeilL").prop("checked", false);
	$("#auroraVeilR").prop("checked", false);
	$("#batteryL").prop("checked", false);
	$("#batteryR").prop("checked", false);
	$("#powerSpotL").prop("checked", false);
	$("#powerSpotR").prop("checked", false);
	$("#switchingL").prop("checked", false);
	$("#switchingR").prop("checked", false);
	$("input:checkbox[name=" + terrainType + "]").prop("checked", false);
}

function getSetOptions(sets) {
	var setsHolder = sets;
	if (setsHolder === undefined) {
		setsHolder = pokedex;
	}
	var pokeNames = Object.keys(setsHolder);
	pokeNames.sort();
	var setOptions = [];
	for (var i = 0; i < pokeNames.length; i++) {
		var pokeName = pokeNames[i];
		setOptions.push({
			pokemon: pokeName,
			text: pokeName
		});
		if ($("#randoms").prop("checked")) {
			if (pokeName in randdex) loadRandset(pokeName, setOptions, "");
			if ((pokeName + "-Gmax") in randdex) loadRandset(pokeName, setOptions, "Gmax");
		} else {
			if (pokeName in setdex) {
				var setNames = Object.keys(setdex[pokeName]);
				for (var j = 0; j < setNames.length; j++) {
					var setName = setNames[j];
					setOptions.push({
						pokemon: pokeName,
						set: setName,
						text: pokeName + " (" + setName + ")",
						id: pokeName + " (" + setName + ")",
						isCustom: setdex[pokeName][setName].isCustomSet,
						nickname: setdex[pokeName][setName].nickname || ""
					});
				}
			}
			setOptions.push({
				pokemon: pokeName,
				set: "Blank Set",
				text: pokeName + " (Blank Set)",
				id: pokeName + " (Blank Set)"
			});
		}
	}
	return setOptions;
}

function loadRandset(pokeName, setOptions, isGmax) {
	if (gen >= 8) {
		// The Gen 8 and 9 randdex contains information for multiple Random Battles formats for each Pokemon.
		// Duraludon, for example, has data for Randoms, Doubles Randoms, and Baby Randoms.
		// Therefore, all of this information has to be populated within the set options.
		var baseName = pokeName;
		if (isGmax) pokeName = pokeName + "-Gmax";
		var randTypes = Object.keys(randdex[pokeName]);
		for (var j = 0; j < randTypes.length; j++) {
			var rand = randTypes[j];
			setOptions.push({
				pokemon: pokeName + (rand === "Randoms" ? "" : " (" + rand.split(' ')[0] + ")"),
				set: isGmax + rand + " Set",
				text: pokeName + " (" + rand + ")",
				id: baseName + " (" + rand + (isGmax ? "-Gmax)" : ")")
			});
		}
	} else {
		setOptions.push({
			pokemon: pokeName,
			set: "Randoms Set",
			text: pokeName + " (Randoms)",
			id: pokeName + " (Randoms)"
		});
	}
}

function getSelectOptions(arr, sort, defaultOption) {
	if (sort) {
		arr.sort();
	}
	var r = '';
	for (var i = 0; i < arr.length; i++) {
		r += '<option value="' + arr[i] + '" ' + (defaultOption === i ? 'selected' : '') + '>' + arr[i] + '</option>';
	}
	return r;
}

var stickyWeather = (function () {
	var lastClicked = '';
	$('.weather').click(function () {
		if (this.id === lastClicked) {
			$(this).toggleClass("locked-weather");
		} else {
			$('.locked-weather').removeClass('locked-weather');
		}
		lastClicked = this.id;
	});

	return {
		clearStickyWeather: function () {
			lastClicked = null;
			$('.locked-weather').removeClass('locked-weather');
		}
	};
})();

var stickyMoves = (function () {
	var lastClicked = 'resultMoveL1';
	$(".result-move").click(function () {
		if (this.id === lastClicked) {
			$(this).toggleClass("locked-move");
		} else {
			$('.locked-move').removeClass('locked-move');
		}
		lastClicked = this.id;
	});

	return {
		clearStickyMove: function () {
			lastClicked = null;
			$('.locked-move').removeClass('locked-move');
		},
		setSelectedMove: function (slot) {
			lastClicked = slot;
		},
		getSelectedSide: function () {
			if (lastClicked) {
				if (lastClicked.indexOf('resultMoveL') !== -1) {
					return 'p1';
				} else if (lastClicked.indexOf('resultMoveR') !== -1) {
					return 'p2';
				}
			}
			return null;
		}
	};
})();

function isPokeInfoGrounded(pokeInfo) {
	var teraType = pokeInfo.find(".teraToggle").is(":checked") ? pokeInfo.find(".teraType").val() : undefined;
	return $(gravityType).prop("checked") || (
		  teraType ? teraType !== "Flying" : pokeInfo.find(".type1").val() !== "Flying" &&
        teraType ? teraType !== "Flying" : pokeInfo.find(".type2").val() !== "Flying" &&
		  teraType ? teraType !== "Flying" : pokeInfo.find(".type3").val() !== "Flying" &&
		  teraType ? teraType !== "Flying" : pokeInfo.find(".type4").val() !== "Flying" &&
        pokeInfo.find(".ability").val() !== "Levitate" &&
        pokeInfo.find(".ability").val() !== "Eelevate" &&
        pokeInfo.find(".item").val() !== "Air Balloon"
	);
}

function getTerrainEffects() {
	var className = $(this).prop("className");
	className = className.substring(0, className.indexOf(" "));
	switch (className) {
	case "type1":
	case "type2":
	case "type3":
	case "type4":
	case "teraType":
	case "teraToggle":
	case "item":
		var id = $(this).closest(".poke-info").prop("id");
		var terrainValue = $("input:checkbox[name=" + terrainType + "]:checked").val();
		if (terrainValue === "Electric") {
			$("#" + id).find("[value='Asleep']").prop("disabled", isPokeInfoGrounded($("#" + id)));
		} else if (terrainValue === "Misty") {
			$("#" + id).find(statusType).prop("disabled", isPokeInfoGrounded($("#" + id)));
		}
		break;
	case "ability":
		// with autoset, ability change may cause terrain change, need to consider both sides
		var terrainValue = $("input:checkbox[name=" + terrainType + "]:checked").val();
		if (terrainValue === "Electric") {
			$("#p1").find(statusType).prop("disabled", false);
			$("#p2").find(statusType).prop("disabled", false);
			$("#p1").find("[value='Asleep']").prop("disabled", isPokeInfoGrounded($("#p1")));
			$("#p2").find("[value='Asleep']").prop("disabled", isPokeInfoGrounded($("#p2")));
		} else if (terrainValue === "Misty") {
			$("#p1").find(statusType).prop("disabled", isPokeInfoGrounded($("#p1")));
			$("#p2").find(statusType).prop("disabled", isPokeInfoGrounded($("#p2")));
		} else {
			$("#p1").find("[value='Asleep']").prop("disabled", false);
			$("#p1").find(statusType).prop("disabled", false);
			$("#p2").find("[value='Asleep']").prop("disabled", false);
			$("#p2").find(statusType).prop("disabled", false);
		}
		break;
	default:
		$("input:checkbox[name=" + terrainType + "]").not(this).prop("checked", false);
		if ($(this).prop("checked") && $(this).val() === "Electric") {
			// need to enable status because it may be disabled by Misty Terrain before.
			$("#p1").find(statusType).prop("disabled", false);
			$("#p2").find(statusType).prop("disabled", false);
			$("#p1").find("[value='Asleep']").prop("disabled", isPokeInfoGrounded($("#p1")));
			$("#p2").find("[value='Asleep']").prop("disabled", isPokeInfoGrounded($("#p2")));
		} else if ($(this).prop("checked") && $(this).val() === "Misty") {
			$("#p1").find(statusType).prop("disabled", isPokeInfoGrounded($("#p1")));
			$("#p2").find(statusType).prop("disabled", isPokeInfoGrounded($("#p2")));
		} else {
			$("#p1").find("[value='Asleep']").prop("disabled", false);
			$("#p1").find(statusType).prop("disabled", false);
			$("#p2").find("[value='Asleep']").prop("disabled", false);
			$("#p2").find(statusType).prop("disabled", false);
		}
		break;
	}
}

function loadDefaultLists() {
	$(".set-selector").select2({
		formatResult: function (object) {
			if ($("#randoms").prop("checked")) {
				return object.pokemon;
			} else {
				return object.set ? ("&nbsp;&nbsp;&nbsp;" + object.set) : ("<b>" + object.text + "</b>");
			}
		},
		query: function (query) {
			var pageSize = 30;
			var results = [];
			var options = getSetOptions();
			for (var i = 0; i < options.length; i++) {
				var option = options[i];
				var pokeName = option.pokemon.toUpperCase();
				if (!query.term || query.term.toUpperCase().split(" ").every(function (term) {
					return pokeName.indexOf(term) === 0 || pokeName.indexOf("-" + term) >= 0 || pokeName.indexOf(" " + term) >= 0;
				})) {
					if ($("#randoms").prop("checked")) {
						if (option.id) results.push(option);
					} else {
						results.push(option);
					}
				}
			}
			query.callback({
				results: results.slice((query.page - 1) * pageSize, query.page * pageSize),
				more: results.length >= query.page * pageSize
			});
		},
		initSelection: function (element, callback) {
			callback(getFirstValidSetOption());
		}
	});
}

function allPokemon(selector) {
	var allSelector = "";
	for (var i = 0; i < $(".poke-info").length; i++) {
		if (i > 0) {
			allSelector += ", ";
		}
		allSelector += "#p" + (i + 1) + " " + selector;
	}
	return allSelector;
}

function loadCustomList(id) {
	$("#" + id + " .set-selector").select2({
		formatResult: function (set) {
			return (set.nickname ? set.pokemon + " (" + set.nickname + ")" : set.id);
		},
		query: function (query) {
			var pageSize = 30;
			var results = [];
			var options = getSetOptions();
			for (var i = 0; i < options.length; i++) {
				var option = options[i];
				var pokeName = option.pokemon.toUpperCase();
				var setName = option.set ? option.set.toUpperCase() : option.set;
				if (option.isCustom && option.set && (!query.term || query.term.toUpperCase().split(" ").every(function (term) {
					return pokeName.indexOf(term) === 0 || pokeName.indexOf("-" + term) >= 0 || pokeName.indexOf(" " + term) >= 0 || setName.indexOf(term) === 0 || setName.indexOf("-" + term) >= 0 || setName.indexOf(" " + term) >= 0;
				}))) {
					results.push(option);
				}
			}
			query.callback({
				results: results.slice((query.page - 1) * pageSize, query.page * pageSize),
				more: results.length >= query.page * pageSize
			});
		},
		initSelection: function (element, callback) {
			var data = "";
			callback(data);
		}
	});
}

$(document).ready(function () {
	var params = new URLSearchParams(window.location.search);
	var g = GENERATION[params.get('gen')] || 19;
	if ($("#champions").prop("checked")) {
		/* eslint-disable */
		g = 0;
		gen = 0;
		GENERATION = calc.Generations.get(gen);
		/* eslint-enable */
		pokedex = calc.SPECIES[gen];
		setdex = SETDEX[gen];
		typeChart = calc.TYPE_CHART[gen];
		moves = calc.MOVES[gen];
		items = calc.ITEMS[gen];
		abilities = calc.ABILITIES[gen];
		clearField();
		$("#importedSets").prop("checked", false);
		loadDefaultLists();
		$("input:radio[name='format']").change();
		var typeOptions = getSelectOptions(Object.keys(typeChart));
		$("select.type1, select.move-type").find("option").remove().end().append(typeOptions);
		$("select.type2").find("option").remove().end().append("<option value=\"\">(none)</option>" + typeOptions);
		var moveOptions = getSelectOptions(Object.keys(moves), true);
		$("select.move-selector").find("option").remove().end().append(moveOptions);
		var abilityOptions = getSelectOptions(abilities, true);
		$("select.ability").find("option").remove().end().append("<option value=\"\">(other)</option>" + abilityOptions);
		var itemOptions = getSelectOptions(items, true);
		$("select.item").find("option").remove().end().append("<option value=\"\">(none)</option>" + itemOptions);

		$(".set-selector").val(getFirstValidSetOption().id);
		$(".set-selector").change();
	}
	$("#gen" + g).prop("checked", true);
	$("#gen" + g).change();
	$("#percentage").prop("checked", true);
	$("#percentage").change();
	$("#singles-format").prop("checked", true);
	$("#singles-format").change();
	$("#default-level-100").prop("checked", true);
	$("#default-level-100").change();
	loadDefaultLists();
	$(".move-selector").select2({
		dropdownAutoWidth: true,
		matcher: function (term, text) {
			// 2nd condition is for Hidden Power
			return text.toUpperCase().indexOf(term.toUpperCase()) === 0 || text.toUpperCase().indexOf(" " + term.toUpperCase()) >= 0;
		}
	});
	$(".set-selector").val(getFirstValidSetOption().id);
	$(".set-selector").change();
	$(".terrain-trigger").bind("change keyup", getTerrainEffects);
});

/* Click-to-copy function */
$("#mainResult").click(function () {
	navigator.clipboard.writeText($("#mainResult").text()).then(function () {
		document.getElementById('tooltipText').style.visibility = 'visible';
		setTimeout(function () {
			document.getElementById('tooltipText').style.visibility = 'hidden';
		}, 1500);
	});
});
