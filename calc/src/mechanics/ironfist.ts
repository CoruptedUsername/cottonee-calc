import type {Generation, AbilityName, StatID, Terrain} from '../data/interface';
import {toID} from '../util';
import {
  getBerryResistType,
  getFlingPower,
  getItemBoostType,
  getMultiAttack,
  getNaturalGift,
  getTechnoBlast,
  SEED_BOOSTED_STAT,
} from '../items';
import type {RawDesc} from '../desc';
// eslint-disable-next-line no-duplicate-imports
import {getHazards} from '../desc';
import type {Field} from '../field';
import {Move} from '../move';
import type {Pokemon} from '../pokemon';
import type {Damage} from '../result';
// eslint-disable-next-line no-duplicate-imports
import {Result} from '../result';
import {
  chainMods,
  checkAirLock,
  checkDauntlessShield,
  checkDownload,
  checkEmbody,
  checkForecast,
  checkInfiltrator,
  checkIntimidate,
  checkIntrepidSword,
  checkItem,
  checkMultihitBoost,
  checkSeedBoost,
  checkTeraformZero,
  checkWindRider,
  checkRawStatChanges,
  computeFinalStats,
  countBoosts,
  getBaseDamage,
  getStatDescriptionText,
  getFinalDamage,
  getModifiedStat,
  getQPBoostedStat,
  getMoveEffectiveness,
  getShellSideArmCategory,
  getWeight,
  handleFixedDamageMoves,
  isGrounded,
  OF16, OF32,
  pokeRound,
  isQPActive,
  getStabMod,
  getStellarStabMod,
  checkBigAbilities,
  checkKatabaticWinds,
  checkChainedWrath,
  checkFlygonMega,
} from './util';


function combineDesc(desc1: RawDesc, desc2: RawDesc) {
  const newDesc: RawDesc = {
    attackerName: desc1.attackerName,
    defenderName: desc1.defenderName,
    moveName: desc1.moveName,
  };
  for (const i of Object.keys(newDesc)) {
    // @ts-ignore
    if (!['attackerName', 'defenderName', 'moveName'].includes(i)) {
      // @ts-ignore
      if (typeof desc1[i] === 'boolean') {
        // @ts-ignore
        newDesc[i] = desc1[i] || desc2[i];
      } else { // @ts-ignore
        if (typeof desc1[i] === 'number') {
          // @ts-ignore
          newDesc[i] = Math.max(desc1[i], desc2[i]);
        } else {
          // @ts-ignore
          newDesc[i] = desc1[i];
        }
      }
    }
  }
  return newDesc;
}

function combineDamage(dam1: Damage, dam2: Damage): Damage {
  if (typeof dam1 === 'number') {
    dam1 = [dam1];
  }
  if (typeof dam2 === 'number') {
    dam2 = [dam2];
  }
  if (dam1[0].constructor === Array) {
    return 0;
  }
  if (dam2[0].constructor === Array) {
    return 0;
  }
  dam1 = dam1 as number[];
  dam2 = dam2 as number[];
  const finalDam: number[] = [];
  for (const i of dam1) {
    for (const j of dam2) {
      finalDam.push(i + j);
    }
  }
  return finalDam.sort();
}

export function calculateIF(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field
) {
  // #region Initial

  const desc: RawDesc = {
    attackerName: attacker.name,
    moveName: move.name,
    defenderName: defender.name,
    isDefenderDynamaxed: defender.isDynamaxed,
    isWonderRoom: field.isWonderRoom,
  };

  checkFlygonMega(attacker, desc, true);
  checkFlygonMega(defender, desc, false);

  checkAirLock(attacker, field);
  checkAirLock(defender, field);
  checkTeraformZero(attacker, field);
  checkTeraformZero(defender, field);
  checkForecast(attacker, field.weather);
  checkForecast(defender, field.weather);
  checkItem(attacker, field.isMagicRoom);
  checkItem(defender, field.isMagicRoom);
  checkRawStatChanges(attacker, field.attackerSide.isPowerTrick, field.isWonderRoom);
  checkRawStatChanges(defender, field.defenderSide.isPowerTrick, field.isWonderRoom);
  checkSeedBoost(attacker, field);
  checkSeedBoost(defender, field);
  checkDauntlessShield(attacker, gen);
  checkDauntlessShield(defender, gen);
  checkEmbody(attacker, gen);
  checkEmbody(defender, gen);

  computeFinalStats(gen, attacker, defender, field, 'def', 'spd', 'spe');

  checkIntimidate(gen, attacker, defender);
  checkIntimidate(gen, defender, attacker);
  checkDownload(attacker, defender, field.isWonderRoom);
  checkDownload(defender, attacker, field.isWonderRoom);
  checkIntrepidSword(attacker, gen);
  checkIntrepidSword(defender, gen);
  checkBigAbilities(attacker, defender);
  checkBigAbilities(defender, attacker);
  checkKatabaticWinds(attacker, field);
  checkKatabaticWinds(defender, field);
  checkChainedWrath(gen, field, attacker, defender);
  checkChainedWrath(gen, field, defender, attacker);

  checkWindRider(attacker, field.attackerSide);
  checkWindRider(defender, field.defenderSide);

  if (move.named('Meteor Beam', 'Electro Shot')) {
    attacker.boosts.spa +=
      attacker.hasAbility('Simple') ? 2
      : attacker.hasAbility('Contrary') ? -1
      : 1;
    // restrict to +- 6
    attacker.boosts.spa = Math.min(6, Math.max(-6, attacker.boosts.spa));
  }

  computeFinalStats(gen, attacker, defender, field, 'atk', 'spa');

  checkInfiltrator(attacker, field.defenderSide);
  checkInfiltrator(defender, field.attackerSide);

  // only display tera type if it applies
  if (attacker.teraType !== 'Stellar' || move.name === 'Tera Blast' || move.isStellarFirstUse) {
    // tera blast has special behavior with tera stellar
    desc.isStellarFirstUse = attacker.name !== 'Terapagos-Stellar' && move.name === 'Tera Blast' &&
      attacker.teraType === 'Stellar' && move.isStellarFirstUse;
    desc.attackerTera = attacker.teraType;
  }
  if (defender.teraType !== 'Stellar') desc.defenderTera = defender.teraType;

  if (move.named('Photon Geyser', 'Light That Burns the Sky', 'awesomemove',
    'Enchanted Boomerang', 'Minior Shower', 'Multi-Attack', 'Trump Card') ||
    (move.named('Tera Blast') && attacker.teraType) ||
    (move.named('Tera Starstorm') && attacker.teraType && attacker.named('Terapagos-Stellar'))) {
    move.category = attacker.stats.atk > attacker.stats.spa ? 'Physical' : 'Special';
  }

  const result = new Result(gen, attacker, defender, move, field, 0, desc);

  if (move.category === 'Status' && !move.named('Nature Power')) {
    return result;
  }

  if (move.flags.punch && attacker.hasItem('Punching Glove')) {
    desc.attackerItem = attacker.item;
    move.flags.contact = 0;
  }

  if (move.named('Shell Side Arm') &&
    getShellSideArmCategory(attacker, defender, field.isWonderRoom) === 'Physical') {
    move.category = 'Physical';
    move.flags.contact = 1;
  }

  const breaksProtect = move.breaksProtect || move.isZ || attacker.isDynamaxed ||
    (attacker.hasAbility('Unseen Fist', 'Piercing Drill') && move.flags.contact);

  if (field.defenderSide.isProtected && !breaksProtect) {
    desc.isProtected = true;
    return result;
  }

  if (move.name === 'Pain Split') {
    const average = Math.floor((attacker.curHP() + defender.curHP()) / 2);
    const damage = Math.max(0, defender.curHP() - average);
    result.damage = damage;
    return result;
  }

  const defenderAbilityIgnored = defender.hasAbility(
    'Armor Tail', 'Aroma Veil', 'Aura Break', 'Battle Armor',
    'Big Pecks', 'Bulletproof', 'Clear Body', 'Contrary',
    'Damp', 'Dazzling', 'Disguise', 'Dry Skin',
    'Earth Eater', 'Eelevate', 'Filter', 'Flash Fire', 'Flower Gift',
    'Flower Veil', 'Fluffy', 'Friend Guard', 'Fur Coat',
    'Good as Gold', 'Grass Pelt', 'Guard Dog', 'Heatproof',
    'Heavy Metal', 'Hyper Cutter', 'Ice Face', 'Ice Scales',
    'Illuminate', 'Immunity', 'Inner Focus', 'Insomnia',
    'Keen Eye', 'Leaf Guard', 'Levitate', 'Light Metal',
    'Lightning Rod', 'Limber', 'Magic Bounce', 'Magma Armor',
    'Marvel Scale', "Mind's Eye", 'Mirror Armor', 'Motor Drive',
    'Multiscale', 'Oblivious', 'Overcoat', 'Own Tempo',
    'Pastel Veil', 'Punk Rock', 'Purifying Salt', 'Queenly Majesty',
    'Sand Veil', 'Sap Sipper', 'Shell Armor', 'Shield Dust',
    'Simple', 'Snow Cloak', 'Solid Rock', 'Soundproof',
    'Sticky Hold', 'Storm Drain', 'Sturdy', 'Suction Cups',
    'Sweet Veil', 'Tangled Feet', 'Telepathy', 'Tera Shell',
    'Thermal Exchange', 'Thick Fat', 'Unaware', 'Vital Spirit',
    'Volt Absorb', 'Water Absorb', 'Water Bubble', 'Water Veil',
    'Well-Baked Body', 'White Smoke', 'Wind Rider', 'Wonder Guard',
    'Wonder Skin', '!dt air slash', 'awesomeability', 'champion',
    'Eternal Rice', 'Fly Eater', 'Ghoul Gobbler', 'Impalpable',
    'Iron Nose', 'Just a Little Guy', 'Justified', 'Katabatic Winds',
    'Magnetic Storm', 'Mmmm Green', 'Miracle Student', 'What the Sigma',
    'Socially Unaware', 'Snakewood', 'Sour Sipper', 'Skeptic', 'Shields Up',
    'PVZ Fishing', 'Pristine Dessert',
  );

  const attackerIgnoresAbility = attacker.hasAbility('Mold Breaker', 'Teravolt', 'Turboblaze');
  const moveIgnoresAbility = move.named(
    'G-Max Drum Solo',
    'G-Max Fire Ball',
    'G-Max Hydrosnipe',
    'Light That Burns the Sky',
    'Menacing Moonraze Maelstrom',
    'Moongeist Beam',
    'Photon Geyser',
    'Searing Sunraze Smash',
    'Sunsteel Strike'
  );

  if (defenderAbilityIgnored && (attackerIgnoresAbility || moveIgnoresAbility)) {
    if (attackerIgnoresAbility) desc.attackerAbility = attacker.ability;
    if (defender.hasItem('Ability Shield')) {
      desc.defenderItem = defender.item;
    } else {
      defender.ability = '' as AbilityName;
    }
  }

  const ignoresNeutralizingGas = [
    'As One (Glastrier)', 'As One (Spectrier)', 'Battle Bond', 'Comatose',
    'Disguise', 'Gulp Missile', 'Ice Face', 'Multitype', 'Neutralizing Gas',
    'Power Construct', 'RKS System', 'Schooling', 'Shields Down',
    'Stance Change', 'Tera Shift', 'Zen Mode', 'Zero to Hero', 'Greatest Video Game of all Time',
  ];

  if (attacker.hasAbility('Neutralizing Gas') &&
    !ignoresNeutralizingGas.includes(defender.ability || '')) {
    desc.attackerAbility = attacker.ability;
    if (defender.hasItem('Ability Shield')) {
      desc.defenderItem = defender.item;
    } else {
      defender.ability = '' as AbilityName;
    }
  }

  if (defender.hasAbility('Neutralizing Gas') &&
    !ignoresNeutralizingGas.includes(attacker.ability || '')) {
    desc.defenderAbility = defender.ability;
    if (attacker.hasItem('Ability Shield')) {
      desc.attackerItem = attacker.item;
    } else {
      attacker.ability = '' as AbilityName;
    }
  }

  // Merciless does not ignore Shell Armor, damage dealt to a poisoned Pokemon with Shell Armor
  // will not be a critical hit (UltiMario)
  const isCritical = !defender.hasAbility('Battle Armor', 'Shell Armor') &&
    (move.isCrit || (attacker.hasAbility('Merciless') && defender.hasStatus('psn', 'tox') ||
      (move.named('Air Horn', 'Big Bash') && (attacker.isBig !== defender.isBig)) ||
      (move.named('Sour Shot') && (field.hasWeather('Acid') ||
        attacker.hasAbility('Lemonga Sour'))) ||
      (move.named('Flotsam Hook') && !!field.attackerSide.fishingTokens &&
        field.attackerSide.fishingTokens >= ((field.hasWeather('Acid') ||
          attacker.hasAbility('Lemonga Sour')) ? 4 : 3))) || attacker.hasAbility('Ultra Luck')) &&
    move.timesUsed === 1;

  let type = move.type;
  if (move.originalName === 'Weather Ball') {
    const holdingUmbrella = attacker.hasItem('Utility Umbrella');
    const isLemongaSour = attacker.hasAbility('Lemonga Sour');
    const isMegaSol = attacker.hasAbility('Mega Sol');
    type = isLemongaSour && !holdingUmbrella ? 'Lemon'
      : isMegaSol && !holdingUmbrella ? 'Fire'
      : field.hasWeather('Sun', 'Harsh Sunshine') && !holdingUmbrella ? 'Fire'
      : field.hasWeather('Rain', 'Heavy Rain') && !holdingUmbrella ? 'Water'
      : field.hasWeather('Sand') ? 'Rock'
      : field.hasWeather('Hail', 'Snow') ? 'Ice'
      : field.hasWeather('Acid') ? 'Lemon'
      : field.hasWeather('Grave') ? 'Ghost'
      : 'Normal';
    isMegaSol || isLemongaSour ? desc.attackerAbility = attacker.ability : desc.weather =
      field.weather;
    desc.moveType = type;
  } else if (move.named('Judgment') && attacker.item && attacker.item.includes('Plate')) {
    type = getItemBoostType(attacker.item)!;
  } else if (move.originalName === 'Techno Blast' &&
    attacker.item && attacker.item.includes('Drive')) {
    type = getTechnoBlast(attacker.item)!;
    desc.moveType = type;
  } else if (move.originalName === 'Multi-Attack' &&
    attacker.item && attacker.item.includes('Memory')) {
    type = getMultiAttack(attacker.item)!;
    desc.moveType = type;
  } else if (move.named('Natural Gift') && attacker.item?.endsWith('Berry')) {
    const gift = getNaturalGift(gen, attacker.item)!;
    type = gift.t;
    desc.moveType = type;
    desc.attackerItem = attacker.item;
  } else if (
    move.named('Nature Power') ||
    (move.originalName === 'Terrain Pulse' && isGrounded(attacker, field))
  ) {
    type =
      field.hasTerrain('Electric') ? 'Electric'
      : field.hasTerrain('Grassy') ? 'Grass'
      : field.hasTerrain('Misty') ? 'Fairy'
      : field.hasTerrain('Psychic') ? 'Psychic'
      : field.hasTerrain('Fishing') ? 'Water'
      : field.hasTerrain('Frigid') ? 'Ice'
      : 'Normal';
    desc.terrain = field.terrain;

    if (move.isMax) {
      desc.moveType = type;
    }

    // If the Nature Power user has the ability Prankster, it cannot affect
    // Dark-types or grounded foes if Psychic Terrain is active
    if (!(move.named('Nature Power') && attacker.hasAbility('Prankster')) &&
      ((defender.types.includes('Dark') ||
        (field.hasTerrain('Psychic') && (isGrounded(defender, field) ||
          defender.hasAbility('United Party')))))) {
      desc.moveType = type;
    }
  } else if (move.originalName === 'Revelation Dance') {
    if (attacker.teraType) {
      type = attacker.teraType;
    } else if (attacker.types[0] === '???' && attacker.types[1]) {
      type = attacker.types[1];
    } else {
      type = attacker.types[0];
    }
  } else if (move.originalName === 'Minior Shower') {
    if (attacker.types[1]) {
      type = attacker.types[1];
    } else {
      type = 'Stellar';
    }
  } else if (move.named('Aura Wheel') && attacker.named('Morpeko-Hangry')) {
    type = 'Dark';
  } else if (move.named('Raging Bull')) {
    if (attacker.named('Tauros')) {
      type = 'Normal';
    } else if (attacker.named('Tauros-Paldea-Combat')) {
      type = 'Fighting';
    } else if (attacker.named('Tauros-Paldea-Blaze')) {
      type = 'Fire';
    } else if (attacker.named('Tauros-Paldea-Aqua')) {
      type = 'Water';
    }

    field.defenderSide.isReflect = false;
    field.defenderSide.isLightScreen = false;
    field.defenderSide.isAuroraVeil = false;
  } else if (move.named('Ivy Cudgel')) {
    if (attacker.named('Ogerpon') || attacker.name.includes('Ogerpon-Teal')) {
      type = 'Grass';
    } else if (attacker.name.includes('Ogerpon-Cornerstone')) {
      type = 'Rock';
    } else if (attacker.name.includes('Ogerpon-Hearthflame')) {
      type = 'Fire';
    } else if (attacker.name.includes('Ogerpon-Wellspring')) {
      type = 'Water';
    }
  } else if (
    move.named('Tera Starstorm') && attacker.name === 'Terapagos-Stellar'
  ) {
    move.target = 'allAdjacentFoes';
    type = 'Stellar';
  } else if (move.named('Brick Break', 'Psychic Fangs') ||
    (move.flags.contact && attacker.hasAbility('Wrecking Ball'))) {
    field.defenderSide.isReflect = false;
    field.defenderSide.isLightScreen = false;
    field.defenderSide.isAuroraVeil = false;
  }

  let hasAteAbilityTypeChange = false;
  let isAerilate = false;
  let isPixilate = false;
  let isRefrigerate = false;
  let isGalvanize = false;
  let isLiquidVoice = false;
  let isFruityBars = false;
  let isNormalize = false;
  let isSourHour = false;
  let isDragonize = false;
  const noTypeChange = move.named(
    'Revelation Dance',
    'Judgment',
    'Nature Power',
    'Techno Blast',
    'Multi-Attack',
    'Natural Gift',
    'Weather Ball',
    'Terrain Pulse',
    'Struggle',
  ) || (move.named('Tera Blast') && attacker.teraType);

  if (!move.isZ && !noTypeChange) {
    const normal = type === 'Normal';
    if ((isAerilate = attacker.hasAbility('Aerilate') && normal)) {
      type = 'Flying';
    } else if ((isGalvanize = attacker.hasAbility('Galvanize') && normal)) {
      type = 'Electric';
    } else if ((isLiquidVoice = attacker.hasAbility('Liquid Voice') && !!move.flags.sound)) {
      type = 'Water';
    } else if ((isFruityBars = attacker.hasAbility('Fruity Bars') && !!move.flags.sound)) {
      type = 'Lemon';
    } else if ((isPixilate = attacker.hasAbility('Pixilate', 'Mystic Slicer') && normal)) {
      type = 'Fairy';
    } else if ((isRefrigerate = attacker.hasAbility('Refrigerate') && normal)) {
      type = 'Ice';
    } else if ((isNormalize = attacker.hasAbility('Normalize'))) { // Boosts any type
      type = 'Normal';
    } else if ((isSourHour = attacker.hasAbility('Sour Hour') && type === 'Grass')) {
      type = 'Lemon';
    } else if ((isDragonize = attacker.hasAbility('Dragonize') && normal)) {
      type = 'Dragon';
    }
    if (isGalvanize || isPixilate || isRefrigerate || isAerilate || isNormalize || isDragonize) {
      desc.attackerAbility = attacker.ability;
      hasAteAbilityTypeChange = true;
    } else if (isLiquidVoice || isFruityBars || isSourHour) {
      desc.attackerAbility = attacker.ability;
    }
  }

  if (move.named('Tera Blast') && attacker.teraType) {
    type = attacker.teraType;
  }

  move.type = type;

  const isGhostRevealed =
    attacker.hasAbility('Scrappy', 'Mind\'s Eye', 'Bravery') ||
    field.defenderSide.isForesight;
  const isRingTarget =
    defender.hasItem('Ring Target') && !defender.hasAbility('Klutz');
  const type1Effectiveness = getMoveEffectiveness(
    gen,
    move,
    defender.types[0],
    isGhostRevealed,
    field.isGravity,
    isRingTarget
  );
  const type2Effectiveness = defender.types[1]
    ? getMoveEffectiveness(
      gen,
      move,
      defender.types[1],
      isGhostRevealed,
      field.isGravity,
      isRingTarget
    )
    : 1;
  const type3Effectiveness = defender.types[2]
    ? getMoveEffectiveness(
      gen,
      move,
      defender.types[2],
      isGhostRevealed,
      field.isGravity,
      isRingTarget
    )
    : 1;
  const type4Effectiveness = defender.types[3]
    ? getMoveEffectiveness(
      gen,
      move,
      defender.types[3],
      isGhostRevealed,
      field.isGravity,
      isRingTarget
    )
    : 1;
  let typeEffectiveness = type1Effectiveness * type2Effectiveness * type3Effectiveness *
    type4Effectiveness;

  typeEffectiveness = move.named('POG') ? 2 : typeEffectiveness;

  if (defender.teraType && defender.teraType !== 'Stellar') {
    typeEffectiveness = getMoveEffectiveness(
      gen,
      move,
      defender.teraType,
      isGhostRevealed,
      field.isGravity,
      isRingTarget
    );
  }

  if (typeEffectiveness === 0 && move.hasType('Ground') &&
    defender.hasItem('Iron Ball') && !defender.hasAbility('Klutz')) {
    typeEffectiveness = 1;
  }

  if (typeEffectiveness === 0 && move.named('Thousand Arrows')) {
    typeEffectiveness = 1;
  }

  if (defender.nature === 'Serious') {
    if (move.hasType('Silly')) {
      desc.isSerious = true;
      typeEffectiveness *= 0;
    } else if (move.hasType('Psychic')) {
      desc.isSerious = true;
      typeEffectiveness *= 2;
    }
  }

  if (typeEffectiveness === 0) {
    return result;
  }

  if ((move.named('Sky Drop') &&
      (defender.hasType('Flying') || defender.weightkg >= 200 || field.isGravity)) ||
    (move.named('Synchronoise') && !defender.hasType(attacker.types[0]) &&
      (!attacker.types[1] || !defender.hasType(attacker.types[1]))) ||
    (move.named('Dream Eater') &&
      (!(defender.hasStatus('slp') || defender.hasAbility('Comatose')))) ||
    (move.named('Steel Roller') && !field.terrain) ||
    (move.named('Poltergeist') &&
      (!defender.item || (isQPActive(defender, field) && defender.hasItem('Booster Energy'))))
  ) {
    return result;
  }

  if (
    (field.hasWeather('Harsh Sunshine') && move.hasType('Water')) ||
    (field.hasWeather('Heavy Rain') && move.hasType('Fire'))
  ) {
    desc.weather = field.weather;
    return result;
  }

  if (move.named('Clash')) {
    for (const i of attacker.moves) {
      const moveCategory = gen.moves.get(toID(((i as unknown) as Move).originalName))?.category;
      if (moveCategory === 'Status') {
        return result;
      }
    }
  } else if (move.named('Drippy Blade') && field.attackerSide.fishingTokens &&
    (field.attackerSide.fishingTokens <= ((field.hasWeather('Acid') ||
        attacker.hasAbility('Lemonga Sour')) ? 2 : 1) ||
      attacker.named('Kanon-Blue Sea'))) {
    return result;
  } else if (move.named('Kill Token') && field.attackerSide.fishingTokens &&
    field.attackerSide.fishingTokens < ((field.hasWeather('Acid') ||
      attacker.hasAbility('Lemonga Sour')) ? 4 : 3)) {
    return result;
  } else if (move.named('cuddle')) {
    desc.isCuddle = true;
    return result;
  } else if (move.named('Hold Hands')) {
    desc.isHoldHands = true;
    return result;
  } else if (move.named('The Kitchen Sink')) {
    desc.isKitchenSink = true;
    return result;
  } else if (move.named('Necromancy') && !move.alliesFainted) {
    desc.alliesFainted = 0;
    return result;
  }

  if (defender.hasAbility('Just a Little Guy') && attacker.weightkg > defender.weightkg) {
    desc.defenderAbility = defender.ability;
    return result;
  } else if (defender.hasAbility('Divining Horn') && move.flags.disaster) {
    desc.defenderAbility = defender.ability;
    return result;
  }

  if (field.hasWeather('Strong Winds') && defender.hasType('Flying') &&
    gen.types.get(toID(move.type))!.effectiveness['Flying']! > 1) {
    typeEffectiveness /= 2;
    desc.weather = field.weather;
  }

  if (move.type === 'Stellar') {
    desc.defenderTera = defender.teraType; // always show in this case
    typeEffectiveness = !defender.teraType ? 1 : 2;
  }

  const turn2typeEffectiveness = typeEffectiveness;

  // Tera Shell works only at full HP, but for all hits of multi-hit moves
  if (defender.hasAbility('Tera Shell') &&
    defender.curHP() === defender.maxHP() &&
    (!field.defenderSide.isSR && (!field.defenderSide.spikes || defender.hasType('Flying')) ||
      defender.hasItem('Heavy-Duty Boots'))
  ) {
    typeEffectiveness = 0.5;
    desc.defenderAbility = defender.ability;
  }

  if ((defender.hasAbility('Wonder Guard') && typeEffectiveness <= 1) ||
    (move.hasType('Grass') && defender.hasAbility('Sap Sipper')) ||
    (move.hasType('Fire') && defender.hasAbility('Flash Fire', 'Well-Baked Body')) ||
    (move.hasType('Water') && defender.hasAbility('Dry Skin', 'Storm Drain', 'Water Absorb',
      'champion', 'Magnetic Storm')) ||
    (move.hasType('Electric') &&
      defender.hasAbility('Lightning Rod', 'Motor Drive', 'Volt Absorb')) ||
    (move.hasType('Ground') &&
      !field.isGravity && !move.named('Thousand Arrows') &&
      !defender.hasItem('Iron Ball') && defender.hasAbility('Levitate', 'Shields Up',
      'Eelevate')) ||
    (move.flags.bullet && defender.hasAbility('Bulletproof', 'Snakewood')) ||
    (move.flags.sound && !move.named('Clangorous Soul') && defender.hasAbility('Soundproof')) ||
    (move.priority > 0 && defender.hasAbility('Queenly Majesty', 'Dazzling', 'Armor Tail')) ||
    (move.hasType('Ground') && defender.hasAbility('Earth Eater')) ||
    (move.flags.wind && defender.hasAbility('Wind Rider')) ||
    (move.hasType('Flying') && !move.named('Air Slash') &&
      defender.hasAbility('!dt air slash')) ||
    (move.hasType('Normal', 'Ground') && defender.hasAbility('Clownery')) ||
    (move.hasType('Fire', 'Fighting') && defender.hasAbility('Eternal Rice')) ||
    (move.hasType('Bug') && defender.hasAbility('Fly Eater')) ||
    (move.hasType('Ghost') && defender.hasAbility('Ghoul Gobbler')) ||
    (move.hasType(...[...attacker.types, ...defender.types]) &&
      defender.hasAbility('Impalpable')) ||
    (move.hasType('Steel') && defender.hasAbility('Iron Nose', 'Steel Drummer')) ||
    (move.hasType('Dark') && defender.hasAbility('Justified')) ||
    (move.hasType('Flying') && defender.hasAbility('Katabatic Winds') && field.isGravity) ||
    (move.hasType('Silly') && defender.hasAbility('What the Sigma', 'Miracle Student')) ||
    (move.hasType('Lemon') && defender.hasAbility('Sour Sipper')) ||
    (move.hasType('Grass', 'Bug') && defender.hasAbility('Pristine Dessert'))
  ) {
    desc.defenderAbility = defender.ability;
    return result;
  }

  if (attacker.hasStatus('bsb') && move.flags.sound) {
    desc.isBaseballed = true;
    return result;
  }

  if (move.hasType('Ground') && !move.named('Thousand Arrows') &&
    !field.isGravity && defender.hasItem('Air Balloon')) {
    desc.defenderItem = defender.item;
    return result;
  }

  if (move.priority > 0 && field.hasTerrain('Psychic') && (isGrounded(defender, field) ||
    defender.hasAbility('United Party'))) {
    desc.terrain = field.terrain;
    return result;
  }

  if (defender.hasAbility('Greatest Video Game of All Time')) {
    return result;
  }

  const weightBasedMove = move.named('Heat Crash', 'Heavy Slam', 'Low Kick', 'Grass Knot');
  if (defender.isDynamaxed && weightBasedMove) {
    return result;
  }

  desc.HPEVs = getStatDescriptionText(gen, defender, 'hp');

  const fixedDamage = handleFixedDamageMoves(attacker, move, defender);
  if (move.named('Goomba Stomp') && defender.named('Goomba') && defender.isBig) {
    desc.isDefenderBig = true;
  }
  if (fixedDamage) {
    if (attacker.hasAbility('Parental Bond')) {
      result.damage = [fixedDamage, fixedDamage];
      desc.attackerAbility = attacker.ability;
    } else {
      result.damage = fixedDamage;
    }
    return result;
  }

  if (move.named('silcoonsexactmovepool')) {
    const tackle = new Move(gen, 'Tackle');
    const poisonSting = new Move(gen, 'Poison Sting');
    const bugBite = new Move(gen, 'Bug Bite');
    const tackleResult = calculateIF(gen, attacker, defender, tackle, field);
    const tackleDamage = tackleResult.damage as unknown as Damage;
    const poisonStingResult = calculateIF(gen, attacker, defender, poisonSting, field);
    const poisonDamage = poisonStingResult.damage as unknown as Damage;
    const bugBiteResult = calculateIF(gen, attacker, defender, bugBite, field);
    const totalDamage = combineDamage(combineDamage(tackleDamage, poisonDamage),
      bugBiteResult.damage);
    const finalDesc = combineDesc(combineDesc(combineDesc(desc, tackleResult.rawDesc),
      poisonStingResult.rawDesc), bugBiteResult.rawDesc);
    return new Result(gen, attacker, defender, move, field, totalDamage, finalDesc);
  }

  if (move.named('Final Gambit')) {
    result.damage = attacker.curHP();
    return result;
  }

  if (move.named('Guardian of Alola')) {
    let zLostHP = Math.floor((defender.curHP() * 3) / 4);
    if (field.defenderSide.isProtected && attacker.item && attacker.item.includes(' Z')) {
      zLostHP = Math.ceil(zLostHP / 4 - 0.5);
    }
    result.damage = zLostHP;
    return result;
  }

  if (move.named('Nature\'s Madness')) {
    const lostHP = field.defenderSide.isProtected ? 0 : Math.floor(defender.curHP() / 2);
    result.damage = lostHP;
    return result;
  }

  if (move.named('Spectral Thief')) {
    let stat: StatID;
    for (stat in defender.boosts) {
      if (defender.boosts[stat] > 0) {
        attacker.boosts[stat] +=
          attacker.hasAbility('Contrary') ? -defender.boosts[stat]! : defender.boosts[stat]!;
        if (attacker.boosts[stat] > 6) attacker.boosts[stat] = 6;
        if (attacker.boosts[stat] < -6) attacker.boosts[stat] = -6;
        attacker.stats[stat] = getModifiedStat(attacker.rawStats[stat]!, attacker.boosts[stat]!);
        defender.boosts[stat] = 0;
        defender.stats[stat] = defender.rawStats[stat];
      }
    }
  }

  if (move.named('Fiend Fire') && field.attackerSide.fishingTokens) {
    move.hits = Math.min(4, 1 + ((field.hasWeather('Acid') || attacker.hasAbility('Lemonga Sour'))
      ? field.attackerSide.fishingTokens - 1 : field.attackerSide.fishingTokens));
  }
  if (attacker.hasAbility('best friends <3')) {
    move.hits = move.hits * 2;
    move.bp = move.bp / 3;
    desc.moveBP = move.bp;
  }

  if (move.hits > 1) {
    desc.hits = move.hits;
  }

  if (defender.hasAbility('Bouncy Bastard')) {
    move.recoil = [1, 4];
  }

  const turnOrder = attacker.stats.spe > defender.stats.spe ? 'first' : 'last';

  // #endregion
  // #region Base Power

  const basePower = calculateBasePowerIF(
    gen,
    attacker,
    defender,
    move,
    field,
    hasAteAbilityTypeChange,
    desc
  );
  if (basePower === 0) {
    return result;
  }

  // #endregion
  // #region (Special) Attack
  const attack = calculateAttackIF(gen, attacker, defender, move, field, desc, isCritical);
  const attackStat =
    move.named('Shell Side Arm') &&
    getShellSideArmCategory(attacker, defender) === 'Physical'
      ? 'atk'
      : move.named('Body Press')
        ? 'def'
        : move.category === 'Special'
          ? 'spa'
          : 'atk';
  // #endregion

  // #region (Special) Defense

  const defense = calculateDefenseIF(gen, attacker, defender, move, field, desc, isCritical);
  const hitsPhysical = move.overrideDefensiveStat === 'def' || move.category === 'Physical' ||
    (move.named('Shell Side Arm') && getShellSideArmCategory(attacker, defender) === 'Physical');
  const defenseStat = hitsPhysical ? 'def' : 'spd';

  // #endregion
  // #region Damage

  const baseDamage = calculateBaseDamageIF(
    gen,
    attacker,
    defender,
    basePower,
    attack,
    defense,
    move,
    field,
    desc,
    isCritical
  );

  // FIXME: this is incorrect, should be move.flags.heal, not move.drain
  if ((attacker.hasAbility('Triage') && move.drain) ||
    (attacker.hasAbility('Gale Wings') &&
      move.hasType('Flying') &&
      attacker.curHP() === attacker.maxHP()) ||
    (attacker.hasAbility('WRATH OF THE SMOGONBIRD') &&
      move.hasType('Flying'))) {
    move.priority = 1;
    desc.attackerAbility = attacker.ability;
  }
  if (attacker.hasAbility('Crossover') && defender.flags?.fakemon) {
    move.priority += 1;
    desc.attackerAbility = attacker.ability;
  } else if (attacker.hasAbility('Lowkickenuinely') && move.named('Low Kick')) {
    move.priority = 1;
    desc.attackerAbility = attacker.ability;
  }
  if (move.named('Zesty Cutter') && (defender.boosts.atk < 0 ||
    defender.boosts.def < 0 || defender.boosts.spa < 0 || defender.boosts.spd < 0 ||
    defender.boosts.spe < 0)) {
    move.priority = 1;
  }

  if (hasTerrainSeed(defender) &&
    field.hasTerrain(defender.item!.substring(0, defender.item!.indexOf(' ')) as Terrain) &&
    SEED_BOOSTED_STAT[defender.item!] === defenseStat) {
    // Last condition applies so the calc doesn't show a seed where it wouldn't affect the outcome
    // (like Grassy Seed when being hit by a special move)
    desc.defenderItem = defender.item;
  }

  // the random factor is applied between the crit mod and the stab mod, so don't apply anything
  // below this until we're inside the loop
  let preStellarStabMod = getStabMod(attacker, move, desc);
  let stabMod = getStellarStabMod(attacker, move, preStellarStabMod);

  const applyBurn =
    attacker.hasStatus('brn') &&
    move.category === 'Physical' &&
    !attacker.hasAbility('Guts') &&
    !move.named('Facade');
  desc.isBurned = applyBurn;
  const finalMods = calculateFinalModsIF(
    gen,
    attacker,
    defender,
    move,
    field,
    desc,
    isCritical,
    typeEffectiveness
  );

  let protect = false;
  if (field.defenderSide.isProtected &&
    (attacker.isDynamaxed || (move.isZ && attacker.item && attacker.item.includes(' Z')))) {
    protect = true;
    desc.isProtected = true;
  }

  const finalMod = chainMods(finalMods, 41, 131072);

  const isSpread = field.gameType !== 'Singles' &&
    ['allAdjacent', 'allAdjacentFoes'].includes(move.target);

  let childDamage: number[] | undefined;
  if (attacker.hasAbility('Parental Bond') && move.hits === 1 && !isSpread) {
    const child = attacker.clone();
    child.ability = 'Parental Bond (Child)' as AbilityName;
    checkMultihitBoost(gen, child, defender, move, field, desc);
    childDamage = calculateIF(gen, child, defender, move, field).damage as number[];
    desc.attackerAbility = attacker.ability;
  } else if (attacker.hasAbility('Honker') && isCritical && !move.named('Nose Honk')) {
    const honkMove = new Move(gen, 'Nose Honk');
    checkMultihitBoost(gen, attacker, defender, honkMove, field, desc);
    childDamage = calculateIF(gen, attacker, defender, honkMove, field).damage as number[];
    desc.attackerAbility = attacker.ability;
  }

  const damage = [];
  for (let i = 0; i < 16; i++) {
    damage[i] =
      getFinalDamage(baseDamage, i, typeEffectiveness, applyBurn, stabMod, finalMod, protect);
  }
  result.damage = childDamage ? [damage, childDamage] : damage;

  desc.attackBoost =
    move.named('Foul Play') ? defender.boosts[attackStat] : attacker.boosts[attackStat];

  if (move.timesUsed! > 1 || move.hits > 1) {
    // store boosts so intermediate boosts don't show.
    const origDefBoost = desc.defenseBoost;
    const origAtkBoost = desc.attackBoost;

    let numAttacks = 1;
    if (move.timesUsed! > 1) {
      desc.moveTurns = `over ${move.timesUsed} turns`;
      numAttacks = move.timesUsed!;
    } else {
      numAttacks = move.hits;
    }
    let usedItems = [false, false];
    const damageMatrix = [damage];
    for (let times = 1; times < numAttacks; times++) {
      usedItems = checkMultihitBoost(gen, attacker, defender, move,
        field, desc, usedItems[0], usedItems[1]);
      const newAttack = calculateAttackIF(gen, attacker, defender, move,
        field, desc, isCritical);
      const newDefense = calculateDefenseIF(gen, attacker, defender, move,
        field, desc, isCritical);
      // Check if lost -ate ability. Typing stays the same, only boost is lost
      // Cannot be regained during multihit move and no Normal moves with stat drawbacks
      hasAteAbilityTypeChange = hasAteAbilityTypeChange &&
        attacker.hasAbility('Aerilate', 'Galvanize', 'Pixilate', 'Refrigerate', 'Normalize',
          'Mystic Slicer', 'Dragonize');

      if (move.timesUsed! > 1) {
        // Adaptability does not change between hits of a multihit, only between turns
        preStellarStabMod = getStabMod(attacker, move, desc);
        // Hack to make Tera Shell with multihit moves, but not over multiple turns
        typeEffectiveness = turn2typeEffectiveness;
        // Stellar damage boost applies for 1 turn, but all hits of multihit.
        stabMod = getStellarStabMod(attacker, move, preStellarStabMod, times);
      }

      const newBasePower = calculateBasePowerIF(
        gen,
        attacker,
        defender,
        move,
        field,
        hasAteAbilityTypeChange,
        desc,
        times + 1
      );
      const newBaseDamage = calculateBaseDamageIF(
        gen,
        attacker,
        defender,
        newBasePower,
        newAttack,
        newDefense,
        move,
        field,
        desc,
        isCritical
      );
      const newFinalMods = calculateFinalModsIF(
        gen,
        attacker,
        defender,
        move,
        field,
        desc,
        isCritical,
        typeEffectiveness,
        times
      );
      const newFinalMod = chainMods(newFinalMods, 41, 131072);

      const damageArray = [];
      for (let i = 0; i < 16; i++) {
        const newFinalDamage = getFinalDamage(
          newBaseDamage,
          i,
          typeEffectiveness,
          applyBurn,
          stabMod,
          newFinalMod,
          protect
        );
        damageArray[i] = newFinalDamage;
      }
      damageMatrix[times] = damageArray;
    }
    result.damage = damageMatrix;
    desc.defenseBoost = origDefBoost;
    desc.attackBoost = origAtkBoost;
  }

  if (move.named('Flush')) {
    result.damage = combineDamage(result.damage, getHazards(gen, defender,
      field).damage);
  }


  // #endregion

  return result;
}

export function calculateBasePowerIF(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field,
  hasAteAbilityTypeChange: boolean,
  desc: RawDesc,
  hit = 1,
) {
  const turnOrder = attacker.stats.spe > defender.stats.spe ? 'first' : 'last';

  let basePower: number;

  switch (move.name) {
  case 'Payback':
    basePower = move.bp * (turnOrder === 'last' ? 2 : 1);
    desc.moveBP = basePower;
    break;
  case 'Bolt Beak':
  case 'Fishious Rend':
  case 'Citrus Rend':
    basePower = move.bp * (turnOrder !== 'last' ? 2 : 1);
    desc.moveBP = basePower;
    break;
  case 'Lightning Strike':
    basePower = turnOrder === 'last' ? 120 : move.bp;
    desc.moveBP = basePower;
    break;
  case 'Pursuit':
    const switching = field.defenderSide.isSwitching === 'out';
    basePower = move.bp * (switching ? 2 : 1);
    if (switching) desc.isSwitching = 'out';
    desc.moveBP = basePower;
    break;
  case 'Electro Ball':
    const r = Math.floor(attacker.stats.spe / defender.stats.spe);
    basePower = r >= 4 ? 150 : r >= 3 ? 120 : r >= 2 ? 80 : r >= 1 ? 60 : 40;
    if (defender.stats.spe === 0) basePower = 40;
    desc.moveBP = basePower;
    break;
  case 'Gyro Ball':
    basePower = Math.min(150, Math.floor((25 * defender.stats.spe) / attacker.stats.spe) + 1);
    if (attacker.stats.spe === 0) basePower = 1;
    desc.moveBP = basePower;
    break;
  case 'Punishment':
    basePower = Math.min(200, 60 + 20 * countBoosts(gen, defender.boosts));
    desc.moveBP = basePower;
    break;
  case 'Low Kick':
  case 'Grass Knot':
    const w = getWeight(defender, desc, 'defender');
    if (defender.isBig && !attacker.isBig) {
      basePower = 120;
      desc.moveBP = 120;
      desc.isDefenderBig = true;
    } else {
      basePower = w >= 200 ? 120 : w >= 100 ? 100 : w >= 50 ? 80 : w >= 25 ? 60 : w >= 10 ? 40 : 20;
      desc.moveBP = basePower;
    }
    break;
  case 'Hex':
  case 'Infernal Parade':
    // Hex deals double damage to Pokemon with Comatose (ih8ih8sn0w)
    basePower = move.bp * (defender.status || defender.hasAbility('Comatose') ? 2 : 1);
    desc.moveBP = basePower;
    break;
  case 'Barb Barrage':
    basePower = move.bp * (defender.hasStatus('psn', 'tox') ? 2 : 1);
    desc.moveBP = basePower;
    break;
  case 'Heavy Slam':
  case 'Heat Crash':
    const wr =
        getWeight(attacker, desc, 'attacker') /
        getWeight(defender, desc, 'defender');
    if (attacker.isBig && !defender.isBig) {
      basePower = 120;
      desc.moveBP = 120;
    } else {
      basePower = wr >= 5 ? 120 : wr >= 4 ? 100 : wr >= 3 ? 80 : wr >= 2 ? 60 : 40;
      desc.moveBP = basePower;
    }
    break;
  case 'Stored Power':
  case 'Power Trip':
    basePower = 20 + 20 * countBoosts(gen, attacker.boosts);
    desc.moveBP = basePower;
    break;
  case 'Acrobatics':
    basePower = move.bp * (attacker.hasItem('Flying Gem') ||
      (!attacker.item ||
        (isQPActive(attacker, field) && attacker.hasItem('Booster Energy'))) ? 2 : 1);
    desc.moveBP = basePower;
    break;
  case 'Assurance':
    basePower = move.bp * (defender.hasAbility('Parental Bond (Child)') ? 2 : 1);
    // NOTE: desc.attackerAbility = 'Parental Bond' will already reflect this boost
    break;
  case 'Wake-Up Slap':
    // Wake-Up Slap deals double damage to Pokemon with Comatose (ih8ih8sn0w)
    basePower = move.bp * (defender.hasStatus('slp') || defender.hasAbility('Comatose') ? 2 : 1);
    desc.moveBP = basePower;
    break;
  case 'Smelling Salts':
    basePower = move.bp * (defender.hasStatus('par') ? 2 : 1);
    desc.moveBP = basePower;
    break;
  case 'Weather Ball':
    const isStrongWinds = field.hasWeather('Strong Winds');
    const isMegaSol = attacker.hasAbility('Mega Sol', 'Lemonga Sour');
    basePower = move.bp * ((field.weather && !isStrongWinds) || isMegaSol ? 2 : 1);
    if (field.hasWeather('Sun', 'Harsh Sunshine', 'Rain', 'Heavy Rain', 'Acid') &&
        attacker.hasItem('Utility Umbrella') && !isMegaSol) basePower = move.bp;
    desc.moveBP = basePower;
    break;
  case 'awesomemove':
    basePower = move.bp * ((field.weather ||
        (isGrounded(attacker, field) || attacker.hasAbility('United Party') &&
          field.terrain)) ? 1.2 : 1);
    desc.moveBP = basePower;
    break;
  case 'Terrain Pulse':
    basePower = move.bp * ((isGrounded(attacker, field) ||
        attacker.hasAbility('United Party')) && field.terrain ? 2 : 1);
    desc.moveBP = basePower;
    break;
  case 'Rising Voltage':
    basePower = move.bp * (((isGrounded(defender, field) ||
        defender.hasAbility('United Party')) && field.hasTerrain('Electric')) ? 2 : 1);
    desc.moveBP = basePower;
    break;
  case 'Absolute Zero':
    basePower = move.bp * (((isGrounded(defender, field) ||
        defender.hasAbility('United Party')) && field.hasTerrain('Frigid')) ? 1.5 : 1);
    desc.moveBP = basePower;
    break;
  case 'Psyblade':
    basePower = move.bp * (field.hasTerrain('Electric') ? 1.5 : 1);
    if (field.hasTerrain('Electric')) {
      desc.moveBP = basePower;
      desc.terrain = field.terrain;
    }
    break;
  case 'Fling':
    basePower = getFlingPower(attacker.item);
    desc.moveBP = basePower;
    desc.attackerItem = attacker.item;
    break;
  case 'Dragon Energy':
  case 'Eruption':
  case 'Water Spout':
    basePower = Math.max(1, Math.floor((150 * attacker.curHP()) / attacker.maxHP()));
    desc.moveBP = basePower;
    break;
  case 'Flail':
  case 'Reversal':
    const p = Math.floor((48 * attacker.curHP()) / attacker.maxHP());
    basePower = p <= 1 ? 200 : p <= 4 ? 150 : p <= 9 ? 100 : p <= 16 ? 80 : p <= 32 ? 40 : 20;
    desc.moveBP = basePower;
    break;
  case 'Natural Gift':
    if (attacker.item?.endsWith('Berry')) {
      const gift = getNaturalGift(gen, attacker.item)!;
      basePower = gift.p;
      desc.attackerItem = attacker.item;
      desc.moveBP = move.bp;
    } else {
      basePower = move.bp;
    }
    break;
  case 'Nature Power':
    move.category = 'Special';
    move.secondaries = true;

    // Nature Power cannot affect Dark-types if it is affected by Prankster
    if (attacker.hasAbility('Prankster') && defender.types.includes('Dark')) {
      basePower = 0;
      desc.moveName = 'Nature Power';
      desc.attackerAbility = 'Prankster';
      break;
    }
    switch (field.terrain) {
    case 'Electric':
      basePower = 90;
      desc.moveName = 'Thunderbolt';
      break;
    case 'Grassy':
      basePower = 90;
      desc.moveName = 'Energy Ball';
      break;
    case 'Misty':
      basePower = 95;
      desc.moveName = 'Moonblast';
      break;
    case 'Psychic':
      // Nature Power does not affect grounded Pokemon if it is affected by
      // Prankster and there is Psychic Terrain active
      if (attacker.hasAbility('Prankster') && (isGrounded(defender, field) ||
            defender.hasAbility('United Party'))) {
        basePower = 0;
        desc.attackerAbility = 'Prankster';
      } else {
        basePower = 90;
        desc.moveName = 'Psychic';
      }
      break;
    case 'Fishing':
      basePower = 90;
      desc.moveName = 'Fishing Minigame';
      break;
    case 'Frigid':
      basePower = 90;
      desc.moveName = 'Ice Beam';
      break;
    default:
      basePower = 80;
      desc.moveName = 'Tri Attack';
    }
    break;
  case 'Water Shuriken':
    basePower = attacker.named('Greninja-Ash') && attacker.hasAbility('Battle Bond') ? 20 : 15;
    desc.moveBP = basePower;
    break;
    // Triple Axel's damage increases after each consecutive hit (20, 40, 60)
  case 'Triple Axel':
    basePower = hit * 20;
    desc.moveBP = move.hits === 2 ? 60 : move.hits === 3 ? 120 : 20;
    break;
    // Triple Kick's damage increases after each consecutive hit (10, 20, 30)
  case 'Triple Kick':
    basePower = hit * 10;
    desc.moveBP = move.hits === 2 ? 30 : move.hits === 3 ? 60 : 10;
    break;
  case 'Crush Grip':
  case 'Wring Out':
    basePower = 100 * Math.floor((defender.curHP() * 4096) / defender.maxHP());
    basePower = Math.floor(Math.floor((120 * basePower + 2048 - 1) / 4096) / 100) || 1;
    desc.moveBP = basePower;
    break;
  case 'Hard Press':
    basePower = 100 * Math.floor((defender.curHP() * 4096) / defender.maxHP());
    basePower = Math.floor(Math.floor((100 * basePower + 2048 - 1) / 4096) / 100) || 1;
    desc.moveBP = basePower;
    break;
  case 'Tera Blast':
    basePower = attacker.teraType === 'Stellar' ? 100 : 80;
    desc.moveBP = basePower;
    break;
  case 'Diamond Hatchet':
    basePower = (attacker.isBig ? 120 : move.bp);
    desc.moveBP = basePower;
    break;
  case 'Walk the Dog':
    basePower = move.bp * (attacker.isBig ? 2 : 1);
    desc.moveBP = basePower;
    break;
  case 'Fish Burn':
    basePower = move.bp * (field.defenderSide.fishingTokens ? 1.5 : 1);
    desc.moveBP = basePower;
    break;
  case 'Hand of Space':
    basePower = move.bp * (defender.flags?.diamondhand ? 1.5 : 1);
    desc.moveBP = basePower;
    break;
  case 'Home Run':
    basePower = move.bp * (defender.hasStatus('bsb') ? 1.5 : 1);
    desc.moveBP = basePower;
    break;
  case 'Velvet Blade':
    let hasStatus = false;
    for (const i of attacker.moves) {
      const moveCategory = gen.moves.get(toID(((i as unknown) as Move).originalName))?.category;
      if (moveCategory === 'Status') {
        hasStatus = true;
      }
    }
    basePower = 90 * (hasStatus ? 1 : 0.5);
    desc.moveBP = basePower;
    break;
  case 'Kill Token':
    let dmgMultiplier = 0;
    if (field.attackerSide.fishingTokens) {
      dmgMultiplier = (field.hasWeather('Acid') || attacker.hasAbility('Lemonga Sour'))
        ? field.attackerSide.fishingTokens : field.attackerSide.fishingTokens + 1;
    }
    basePower = 25 * dmgMultiplier;
    desc.moveBP = Math.min(basePower, 250);
    break;
  case 'Zekrom Kick':
    basePower = move.bp * (attacker.named('Zekrom') ? 2 : 1);
    desc.moveBP = basePower;
    break;
  case 'Trump Card':
    switch (move.ppLeft) {
    case 5:
      basePower = 40;
      desc.moveBP = basePower;
      desc.pp = 5;
      break;
    case 4:
      basePower = 60;
      desc.moveBP = basePower;
      desc.pp = 4;
      break;
    case 3:
      basePower = 0x5a;
      desc.moveBP = basePower;
      desc.pp = 3;
      break;
    case 2:
      basePower = 120;
      desc.moveBP = basePower;
      desc.pp = 2;
      break;
    default:
      basePower = 250;
      desc.moveBP = basePower;
      desc.pp = 1;
      break;
    }
    break;
  case 'Necromancy':
    basePower = move.alliesFainted ? move.bp + 20 * move.alliesFainted : 0;
    desc.moveBP = basePower;
    desc.alliesFainted = move.alliesFainted;
    break;
  case 'Balatro Blast':
    basePower = move.numTrumps ? move.bp + 20 * move.numTrumps : move.bp;
    desc.moveBP = basePower;
    desc.numTrumps = move.numTrumps ? move.numTrumps : -1;
    break;
  case 'Mald Fist':
    basePower = move.ppLeft ? move.bp + 10 * (16 - move.ppLeft) : move.bp;
    desc.moveBP = basePower;
    desc.pp = move.ppLeft ? move.ppLeft : -1;
    break;
  default:
    basePower = move.bp;
  }
  if (basePower === 0) {
    return 0;
  }
  if (attacker.hasAbility('Buy 1 get 2 free')) {
    basePower = 123;
    desc.moveBP = basePower;
  }
  if (move.named(
    'Breakneck Blitz', 'Bloom Doom', 'Inferno Overdrive', 'Hydro Vortex', 'Gigavolt Havoc',
    'Subzero Slammer', 'Supersonic Skystrike', 'Savage Spin-Out', 'Acid Downpour', 'Tectonic Rage',
    'Continental Crush', 'All-Out Pummeling', 'Shattered Psyche', 'Never-Ending Nightmare',
    'Devastating Drake', 'Black Hole Eclipse', 'Corkscrew Crash', 'Twinkle Tackle'
  ) || move.isMax) {
    // show z-move power in description
    desc.moveBP = move.bp;
  }
  const bpMods = calculateBPModsIF(
    gen,
    attacker,
    defender,
    move,
    field,
    desc,
    basePower,
    hasAteAbilityTypeChange,
    turnOrder,
    hit
  );
  basePower = OF16(Math.max(1, pokeRound((basePower * chainMods(bpMods, 41, 2097152)) / 4096)));
  if (
    attacker.teraType && move.type === attacker.teraType &&
    attacker.hasType(attacker.teraType) && move.hits === 1 && !move.multiaccuracy &&
    move.priority <= 0 && move.bp > 0 && !move.named('Dragon Energy', 'Eruption', 'Water Spout') &&
    basePower < 60 && gen.num >= 9
  ) {
    basePower = 60;
    desc.moveBP = 60;
  }
  return basePower;
}

export function calculateBPModsIF(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field,
  desc: RawDesc,
  basePower: number,
  hasAteAbilityTypeChange: boolean,
  turnOrder: string,
  hit: number
) {
  const bpMods = [];

  // Move effects
  const defenderItem = (defender.item && defender.item !== '')
    ? defender.item : defender.disabledItem;
  let resistedKnockOffDamage =
    (!defenderItem || (isQPActive(defender, field) && defenderItem === 'Booster Energy')) ||
    (defender.named('Dialga-Origin') && defenderItem === 'Adamant Crystal') ||
    (defender.named('Palkia-Origin') && defenderItem === 'Lustrous Globe') ||
    // Griseous Core for gen 9, Griseous Orb otherwise
    (defender.name.includes('Giratina-Origin') && defenderItem.includes('Griseous')) ||
    (defender.name.includes('Arceus') && defenderItem.includes('Plate')) ||
    (defender.name.includes('Genesect') && defenderItem.includes('Drive')) ||
    (defender.named('Groudon', 'Groudon-Primal') && defenderItem === 'Red Orb') ||
    (defender.named('Kyogre', 'Kyogre-Primal') && defenderItem === 'Blue Orb') ||
    (defender.name.includes('Silvally') && defenderItem.includes('Memory')) ||
    defenderItem.includes(' Z') ||
    (defender.name.includes('Zacian') && defenderItem === 'Rusted Sword') ||
    (defender.name.includes('Zamazenta') && defenderItem === 'Rusted Shield') ||
    (defender.name.includes('Ogerpon-Cornerstone') && defenderItem === 'Cornerstone Mask') ||
    (defender.name.includes('Ogerpon-Hearthflame') && defenderItem === 'Hearthflame Mask') ||
    (defender.name.includes('Ogerpon-Wellspring') && defenderItem === 'Wellspring Mask') ||
    (defender.named('Venomicon-Epilogue') && defenderItem === 'Vile Vial');

  // The last case only applies when the Pokemon has the Mega Stone that matches its species
  // (or when it's already a Mega-Evolution)
  if (!resistedKnockOffDamage && defenderItem) {
    const item = gen.items.get(toID(defenderItem))!;
    resistedKnockOffDamage = !!(item.megaStone &&
      (item.megaStone[defender.name] || Object.values(item.megaStone).includes(defender.name)));
  }

  if (attacker.isBig && !defender.isBig) {
    if (move.named('Aerial Ace', 'Force Palm', 'Fury Attack', 'Nuzzle', 'Peck', 'Struggle Bug',
      'Vise Grip')) {
      bpMods.push(8192);
    } else if (move.named('Stomp', 'Steamroller', 'Body Slam', 'Flying Press', 'Dragon Rush',
      'Malicious Moonsault', 'Supercell Slam')) {
      bpMods.push(6144);
    }
    desc.isAttackerBig = true;
  }

  // Resist knock off damage if your item was already knocked off
  if (!resistedKnockOffDamage && hit > 1 && !defender.hasAbility('Sticky Hold')) {
    resistedKnockOffDamage = true;
  }

  if ((move.named('Facade') && attacker.hasStatus('brn', 'par', 'psn', 'tox')) ||
    (move.named('Brine') && defender.curHP() <= defender.maxHP() / 2) ||
    (move.named('Venoshock') && defender.hasStatus('psn', 'tox')) ||
    (move.named('Lash Out') && (countBoosts(gen, attacker.boosts) < 0))
  ) {
    bpMods.push(8192);
    desc.moveBP = basePower * 2;
  } else if (
    move.named('Expanding Force') && (isGrounded(attacker, field) ||
      attacker.hasAbility('United Party')) && field.hasTerrain('Psychic')
  ) {
    move.target = 'allAdjacentFoes';
    bpMods.push(6144);
    desc.moveBP = basePower * 1.5;
  } else if ((move.named('Knock Off', 'Incinerate') && !resistedKnockOffDamage) ||
    (move.named('Misty Explosion') && (isGrounded(attacker, field) ||
      attacker.hasAbility('United Party')) && field.hasTerrain('Misty')) ||
    (move.named('Grav Apple') && field.isGravity)
  ) {
    bpMods.push(6144);
    desc.moveBP = basePower * 1.5;
  } else if (move.named('Solar Beam', 'Solar Blade') &&
    field.hasWeather('Rain', 'Heavy Rain', 'Sand', 'Hail', 'Snow')) {
    bpMods.push(2048);
    desc.moveBP = basePower / 2;
    desc.weather = field.weather;
  } else if (move.named('Collision Course', 'Electro Drift')) {
    const isGhostRevealed =
      attacker.hasAbility('Scrappy', 'Bravery', 'Mind\'s Eye') ||
      field.defenderSide.isForesight;
    const isRingTarget =
      defender.hasItem('Ring Target') && !defender.hasAbility('Klutz');
    const types = defender.teraType && defender.teraType !== 'Stellar'
      ? [defender.teraType] : defender.types;
    const type1Effectiveness = getMoveEffectiveness(
      gen,
      move,
      types[0],
      isGhostRevealed,
      field.isGravity,
      isRingTarget
    );
    const type2Effectiveness = types[1] ? getMoveEffectiveness(
      gen,
      move,
      types[1],
      isGhostRevealed,
      field.isGravity,
      isRingTarget
    ) : 1;
    const type3Effectiveness = types[2] ? getMoveEffectiveness(
      gen,
      move,
      types[2],
      isGhostRevealed,
      field.isGravity,
      isRingTarget
    ) : 1;
    const type4Effectiveness = types[3] ? getMoveEffectiveness(
      gen,
      move,
      types[3],
      isGhostRevealed,
      field.isGravity,
      isRingTarget
    ) : 1;
    if (type1Effectiveness * type2Effectiveness * type3Effectiveness * type4Effectiveness >= 2) {
      bpMods.push(5461);
      desc.moveBP = basePower * (5461 / 4096);
    }
  }

  if (field.attackerSide.isHelpingHand) {
    bpMods.push(6144);
    desc.isHelpingHand = true;
  }

  // Field effects

  const terrainMultiplier = gen.num > 7 ? 5325 : 6144;
  if ((isGrounded(attacker, field) || attacker.hasAbility('United Party'))) {
    if ((field.hasTerrain('Electric') && move.hasType('Electric')) ||
      (field.hasTerrain('Grassy') && move.hasType('Grass')) ||
      (field.hasTerrain('Psychic') && move.hasType('Psychic')) ||
      (field.hasTerrain('Fishing') && move.flags.fishing) ||
      (field.hasTerrain('Frigid') && move.hasType('Ice'))
    ) {
      bpMods.push(terrainMultiplier);
      desc.terrain = field.terrain;
    }
  }
  if ((isGrounded(defender, field) || defender.hasAbility('United Party'))) {
    if ((field.hasTerrain('Misty') && move.hasType('Dragon')) ||
      (field.hasTerrain('Grassy') && move.named('Bulldoze', 'Earthquake'))
    ) {
      bpMods.push(2048);
      desc.terrain = field.terrain;
    }
  }

  // Abilities

  // Use BasePower after moves with custom BP to determine if Technician should boost
  if ((attacker.hasAbility('Technician', 'Perfectionist') && basePower <= 60) ||
    (attacker.hasAbility('Flare Boost') &&
      attacker.hasStatus('brn') && move.category === 'Special') ||
    (attacker.hasAbility('Toxic Boost') &&
      attacker.hasStatus('psn', 'tox') && move.category === 'Physical') ||
    (attacker.hasAbility('Mega Launcher') && move.flags.pulse) ||
    (attacker.hasAbility('Strong Jaw') && move.flags.bite) ||
    (attacker.hasAbility('Steely Spirit') && move.hasType('Steel')) ||
    (attacker.hasAbility('Sharpness', 'Mystic Slicer') && move.flags.slicing) ||
    (attacker.hasAbility('I Love Fishing') && move.flags.fishing)
  ) {
    bpMods.push(6144);
    desc.attackerAbility = attacker.ability;
  } else if (attacker.hasAbility('Feels Like Home') && move.flags.bite &&
    field.hasTerrain('Frigid')) {
    bpMods.push(6144);
    desc.attackerAbility = attacker.ability;
    desc.terrain = field.terrain;
  } else if ((attacker.hasAbility('Doomer') && move.flags.future) ||
    (attacker.hasAbility('Slayer of Beasts') && defender.flags?.fakemon)) {
    bpMods.push(4915);
    desc.attackerAbility = attacker.ability;
  }

  const aura = `${move.type} Aura`;
  const isAttackerAura = attacker.hasAbility(aura);
  const isDefenderAura = defender.hasAbility(aura);
  const isUserAuraBreak = attacker.hasAbility('Aura Break') || defender.hasAbility('Aura Break');
  const isFieldAuraBreak = field.isAuraBreak;
  const isFieldFairyAura = field.isFairyAura && move.type === 'Fairy';
  const isFieldDarkAura = field.isDarkAura && move.type === 'Dark';
  const auraActive = isAttackerAura || isDefenderAura || isFieldFairyAura || isFieldDarkAura;
  const auraBreak = isFieldAuraBreak || isUserAuraBreak;
  if (auraActive) {
    if (auraBreak) {
      bpMods.push(3072);
      desc.attackerAbility = attacker.ability;
      desc.defenderAbility = defender.ability;
    } else {
      bpMods.push(5448);
      if (isAttackerAura) desc.attackerAbility = attacker.ability;
      if (isDefenderAura) desc.defenderAbility = defender.ability;
    }
  }

  // Sheer Force does not power up max moves or remove the effects (SadisticMystic)
  if (
    (attacker.hasAbility('Sheer Force') &&
      (move.secondaries || move.named('Order Up')) && !move.isMax) ||
    (attacker.hasAbility('Sand Force') &&
      field.hasWeather('Sand')) ||
    (attacker.hasAbility('Analytic') &&
      (turnOrder !== 'first' || field.defenderSide.isSwitching === 'out')) ||
    (attacker.hasAbility('Tough Claws') && move.flags.contact) ||
    (attacker.hasAbility('Punk Rock') && move.flags.sound)
  ) {
    bpMods.push(5325);
    desc.attackerAbility = attacker.ability;
  }

  if (field.attackerSide.isBattery && move.category === 'Special') {
    bpMods.push(5325);
    desc.isBattery = true;
  }

  if (field.attackerSide.isPowerSpot) {
    bpMods.push(5325);
    desc.isPowerSpot = true;
  }

  if (attacker.hasAbility('Rivalry') && ![attacker.gender, defender.gender].includes('N')) {
    if (attacker.gender === defender.gender) {
      bpMods.push(5120);
      desc.rivalry = 'buffed';
    } else {
      bpMods.push(3072);
      desc.rivalry = 'nerfed';
    }
    desc.attackerAbility = attacker.ability;
  }

  // The -ate abilities already changed move typing earlier, so most checks are done and desc is set
  // However, Max Moves also don't boost -ate Abilities
  if (!move.isMax && hasAteAbilityTypeChange) {
    bpMods.push(4915);
  }

  if ((attacker.hasAbility('Reckless') && (move.recoil || move.hasCrashDamage)) ||
    (attacker.hasAbility('Iron Fist') && move.flags.punch)
  ) {
    bpMods.push(4915);
    desc.attackerAbility = attacker.ability;
  }

  if (gen.num <= 8 && defender.hasAbility('Heatproof') && move.hasType('Fire')) {
    bpMods.push(2048);
    desc.defenderAbility = defender.ability;
  } else if (defender.hasAbility('Dry Skin', 'Ghoul Gobbler') && move.hasType('Fire')) {
    bpMods.push(5120);
    desc.defenderAbility = defender.ability;
  }

  if (attacker.hasAbility('Supreme Overlord', 'Iron Lady') && attacker.alliesFainted) {
    const powMod = [4096, 4506, 4915, 5325, 5734, 6144];
    bpMods.push(powMod[Math.min(5, attacker.alliesFainted)]);
    desc.attackerAbility = attacker.ability;
    desc.alliesFainted = attacker.alliesFainted;
  }

  // Items

  if (attacker.hasItem(`${move.type} Gem`)) {
    bpMods.push(5325);
    desc.attackerItem = attacker.item;
  } else if (
    (((attacker.hasItem('Adamant Crystal') && attacker.named('Dialga-Origin')) ||
        (attacker.hasItem('Adamant Orb') && attacker.named('Dialga'))) &&
      move.hasType('Steel', 'Dragon')) ||
    (((attacker.hasItem('Lustrous Orb') &&
          attacker.named('Palkia')) ||
        (attacker.hasItem('Lustrous Globe') && attacker.named('Palkia-Origin'))) &&
      move.hasType('Water', 'Dragon')) ||
    (((attacker.hasItem('Griseous Orb') || attacker.hasItem('Griseous Core')) &&
        (attacker.named('Giratina-Origin') || attacker.named('Giratina'))) &&
      move.hasType('Ghost', 'Dragon')) ||
    (attacker.hasItem('Vile Vial') &&
      attacker.named('Venomicon-Epilogue') &&
      move.hasType('Poison', 'Flying')) ||
    (attacker.hasItem('Soul Dew') &&
      attacker.named('Latios', 'Latias', 'Latios-Mega', 'Latias-Mega') &&
      move.hasType('Psychic', 'Dragon')) ||
    attacker.item && move.hasType(getItemBoostType(attacker.item)) ||
    (attacker.name.includes('Ogerpon-Cornerstone') && attacker.hasItem('Cornerstone Mask')) ||
    (attacker.name.includes('Ogerpon-Hearthflame') && attacker.hasItem('Hearthflame Mask')) ||
    (attacker.name.includes('Ogerpon-Wellspring') && attacker.hasItem('Wellspring Mask'))
  ) {
    bpMods.push(4915);
    desc.attackerItem = attacker.item;
  } else if (
    (attacker.hasItem('Muscle Band') && move.category === 'Physical') ||
    (attacker.hasItem('Wise Glasses') && move.category === 'Special')
  ) {
    bpMods.push(4505);
    desc.attackerItem = attacker.item;
  } else if (attacker.hasItem('Punching Glove') && move.flags.punch) {
    bpMods.push(4506);
  }
  return bpMods;
}

export function calculateAttackIF(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field,
  desc: RawDesc,
  isCritical = false
) {
  let attack: number;
  const attackStat =
    move.named('Body Press')
      ? (field.isWonderRoom ? 'spd' : 'def')
      : (move.category === 'Special' ? 'spa' : 'atk');
  desc.attackEVs =
    move.named('Foul Play')
      ? getStatDescriptionText(gen, defender, attackStat, field.defenderSide.isPowerTrick)
      : getStatDescriptionText(gen, attacker, attackStat, field.attackerSide.isPowerTrick);
  const attackSource = move.named('Foul Play') ? defender : attacker;
  if (attackSource.boosts[attackStat] === 0 ||
    (isCritical && attackSource.boosts[attackStat] < 0)) {
    attack = attackSource.rawStats[attackStat];
  } else if (defender.hasAbility('Unaware', 'Socially Unaware')) {
    attack = attackSource.rawStats[attackStat];
    desc.defenderAbility = defender.ability;
  } else {
    attack = getModifiedStat(attackSource.rawStats[attackStat]!, attackSource.boosts[attackStat]!);
    desc.attackBoost = attackSource.boosts[attackStat];
  }

  // unlike all other attack modifiers, Hustle gets applied directly
  if (attacker.hasAbility('Hustle') && move.category === 'Physical') {
    attack = pokeRound((attack * 3) / 2);
    desc.attackerAbility = attacker.ability;
  }
  const atMods = calculateAtModsIF(gen, attacker, defender, move, field, desc);
  attack = OF16(Math.max(1, pokeRound((attack * chainMods(atMods, 410, 131072)) / 4096)));
  return attack;
}

export function calculateAtModsIF(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field,
  desc: RawDesc
) {
  const atMods = [];

  // Slow Start also halves damage with special Z-moves
  if ((attacker.hasAbility('Slow Start') && attacker.abilityOn &&
      (move.category === 'Physical' || (move.category === 'Special' && move.isZ))) ||
    (attacker.hasAbility('Defeatist') && attacker.curHP() <= attacker.maxHP() / 2)
  ) {
    atMods.push(2048);
    desc.attackerAbility = attacker.ability;
  } else if (
    (attacker.hasAbility('Solar Power') &&
      field.hasWeather('Sun', 'Harsh Sunshine') &&
      move.category === 'Special') ||
    (attacker.named('Cherrim') &&
      attacker.hasAbility('Flower Gift') &&
      field.hasWeather('Sun', 'Harsh Sunshine') &&
      move.category === 'Physical')) {
    atMods.push(6144);
    desc.attackerAbility = attacker.ability;
    desc.weather = field.weather;
  } else if (attacker.hasAbility('Fashion Icon') && field.hasWeather('Grave') &&
    move.category === 'Special') {
    atMods.push(6144);
    desc.attackerAbility = attacker.ability;
    desc.weather = field.weather;
  } else if (
    // Gorilla Tactics has no effect during Dynamax (Anubis)
    (attacker.hasAbility('Gorilla Tactics') && move.category === 'Physical' &&
      !attacker.isDynamaxed)) {
    atMods.push(6144);
    desc.attackerAbility = attacker.ability;
  } else if (
    (attacker.hasAbility('Guts') && attacker.status && move.category === 'Physical') ||
    (attacker.curHP() <= attacker.maxHP() / 3 &&
      ((attacker.hasAbility('Overgrow') && move.hasType('Grass')) ||
        (attacker.hasAbility('Blaze') && move.hasType('Fire')) ||
        (attacker.hasAbility('Torrent') && move.hasType('Water')) ||
        (attacker.hasAbility('Swarm') && move.hasType('Bug')))) ||
    (move.category === 'Special' && attacker.abilityOn && attacker.hasAbility('Plus', 'Minus'))
  ) {
    atMods.push(6144);
    desc.attackerAbility = attacker.ability;
  } else if (attacker.hasAbility('Flash Fire') && attacker.abilityOn && move.hasType('Fire')) {
    atMods.push(6144);
    desc.attackerAbility = 'Flash Fire';
  } else if (
    (attacker.hasAbility('Steelworker') && move.hasType('Steel')) ||
    (attacker.hasAbility('Dragon\'s Maw') && move.hasType('Dragon')) ||
    (attacker.hasAbility('Rocky Payload') && move.hasType('Rock'))
  ) {
    atMods.push(6144);
    desc.attackerAbility = attacker.ability;
  } else if (attacker.hasAbility('Transistor') && move.hasType('Electric')) {
    atMods.push(gen.num >= 9 ? 5325 : 6144);
    desc.attackerAbility = attacker.ability;
  } else if (attacker.hasAbility('Stakeout') && attacker.abilityOn) {
    atMods.push(8192);
    desc.attackerAbility = attacker.ability;
  } else if (
    (attacker.hasAbility('Water Bubble') && move.hasType('Water')) ||
    (attacker.hasAbility('Huge Power', 'Pure Power') && move.category === 'Physical')
  ) {
    atMods.push(8192);
    desc.attackerAbility = attacker.ability;
  } else if (attacker.hasAbility('Kyrum Aura') && move.category === 'Special' &&
    attacker.curHP() * 3 < attacker.maxHP()) {
    atMods.push(5325);
    desc.attackerAbility = attacker.ability;
  } else if (attacker.hasAbility('Zesty') && move.hasType('Lemon', 'Silly')) {
    atMods.push(5325);
    desc.attackerAbility = attacker.ability;
  } else if (attacker.hasAbility('WRATH OF THE SMOGONBIRD') && move.hasType('Fire')) {
    atMods.push(4915);
    desc.attackerAbility = attacker.ability;
  } else if (attacker.hasAbility('River Thief') && (defender.hasType('Water') ||
    defender.flags?.fish)) {
    atMods.push(5120);
    desc.attackerAbility = attacker.ability;
  } else if ((attacker.hasType('Water') || attacker.flags?.fish) &&
    defender.hasAbility('River Thief')) {
    atMods.push(3072);
    desc.defenderAbility = defender.ability;
  }

  if (field.attackerSide.isSigma) {
    atMods.push(5325);
    desc.isAttackerSigma = true;
  }

  if (attacker.hasStatus('bsb')) {
    if (move.flags.sound) {
      atMods.push(0);
      desc.isBaseballed = true;
    } else {
      atMods.push(3072);
      desc.isBaseballed = true;
    }
  }

  if (
    field.attackerSide.isFlowerGift &&
    !attacker.hasAbility('Flower Gift') &&
    field.hasWeather('Sun', 'Harsh Sunshine') &&
    move.category === 'Physical') {
    atMods.push(6144);
    desc.weather = field.weather;
    desc.isFlowerGiftAttacker = true;
  }

  if (
    field.attackerSide.isSteelySpirit &&
    move.hasType('Steel')
  ) {
    atMods.push(6144);
    desc.isSteelySpiritAttacker = true;
  }

  if ((defender.hasAbility('Thick Fat') && move.hasType('Fire', 'Ice')) ||
    (defender.hasAbility('Water Bubble') && move.hasType('Fire')) ||
    (defender.hasAbility('Purifying Salt') && move.hasType('Ghost'))) {
    atMods.push(2048);
    desc.defenderAbility = defender.ability;
  }

  if ((gen.num >= 9 && defender.hasAbility('Heatproof') && move.hasType('Fire')) ||
    (defender.hasAbility('Mmmm Green') && move.hasType('Grass', 'Bug', 'Silly')) ||
    (defender.hasAbility('Skeptic') && move.hasType('Dragon', 'Fairy', 'Dark'))) {
    atMods.push(2048);
    desc.defenderAbility = defender.ability;
  }
  // Pokemon with "-of Ruin" Ability are immune to the opposing "-of Ruin" ability
  const isTabletsOfRuinActive = (defender.hasAbility('Tablets of Ruin') || field.isTabletsOfRuin) &&
    !attacker.hasAbility('Tablets of Ruin');
  const isVesselOfRuinActive = (defender.hasAbility('Vessel of Ruin') || field.isVesselOfRuin) &&
    !attacker.hasAbility('Vessel of Ruin');
  if (
    (isTabletsOfRuinActive && move.category === 'Physical') ||
    (isVesselOfRuinActive && move.category === 'Special')
  ) {
    if (defender.hasAbility('Tablets of Ruin') || defender.hasAbility('Vessel of Ruin')) {
      desc.defenderAbility = defender.ability;
    } else {
      desc[move.category === 'Special' ? 'isVesselOfRuin' : 'isTabletsOfRuin'] = true;
    }
    atMods.push(3072);
  }

  if (isQPActive(attacker, field)) {
    if (
      (move.category === 'Physical' && getQPBoostedStat(attacker) === 'atk') ||
      (move.category === 'Special' && getQPBoostedStat(attacker) === 'spa')
    ) {
      atMods.push(5325);
      desc.attackerAbility = attacker.ability;
    }
  }

  if (
    (attacker.hasAbility('Hadron Engine') && move.category === 'Special' &&
      field.hasTerrain('Electric')) ||
    (attacker.hasAbility('Orichalcum Pulse') && move.category === 'Physical' &&
      field.hasWeather('Sun', 'Harsh Sunshine') && !attacker.hasItem('Utility Umbrella'))
  ) {
    atMods.push(5461);
    desc.attackerAbility = attacker.ability;
  }

  if ((attacker.hasItem('Thick Club') &&
      attacker.named('Cubone', 'Marowak', 'Marowak-Alola', 'Marowak-Alola-Totem') &&
      move.category === 'Physical') ||
    (attacker.hasItem('Deep Sea Tooth') &&
      attacker.named('Clamperl') &&
      move.category === 'Special') ||
    (attacker.hasItem('Light Ball') && attacker.name.includes('Pikachu') && !move.isZ)
  ) {
    atMods.push(8192);
    desc.attackerItem = attacker.item;
    // Choice Band/Scarf/Specs move lock and stat boosts are ignored during Dynamax (Anubis)
  } else if (!move.isZ && !move.isMax &&
    ((attacker.hasItem('Choice Band') && move.category === 'Physical') ||
      (attacker.hasItem('Choice Specs') && move.category === 'Special'))
  ) {
    atMods.push(6144);
    desc.attackerItem = attacker.item;
  }
  return atMods;
}

export function calculateDefenseIF(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field,
  desc: RawDesc,
  isCritical = false
) {
  let defense: number;
  const hitsPhysical = move.overrideDefensiveStat === 'def' || move.category === 'Physical' ||
    (move.named('Shell Side Arm') && getShellSideArmCategory(attacker, defender) === 'Physical');
  const defenseStat = hitsPhysical ? 'def' : 'spd';
  desc.defenseEVs = getStatDescriptionText(gen, defender, defenseStat,
    field.defenderSide.isPowerTrick);
  if (defender.boosts[defenseStat] === 0 ||
    (isCritical && defender.boosts[defenseStat] > 0) ||
    move.ignoreDefensive) {
    defense = defender.rawStats[defenseStat];
  } else if (attacker.hasAbility('Unaware', 'Socially Unaware') || move.name === 'Nihil Light') {
    defense = defender.rawStats[defenseStat];
    desc.attackerAbility = attacker.ability;
  } else {
    defense = getModifiedStat(defender.rawStats[defenseStat]!, defender.boosts[defenseStat]!);
    desc.defenseBoost = defender.boosts[defenseStat];
  }

  // unlike all other defense modifiers, Sandstorm SpD boost gets applied directly
  if (field.hasWeather('Sand') && defender.hasType('Rock') && !hitsPhysical) {
    defense = pokeRound((defense * 3) / 2);
    desc.weather = field.weather;
  }
  if (field.hasWeather('Snow') && defender.hasType('Ice') && hitsPhysical) {
    defense = pokeRound((defense * 3) / 2);
    desc.weather = field.weather;
  }

  const dfMods = calculateDfModsIF(
    gen,
    attacker,
    defender,
    move,
    field,
    desc,
    isCritical,
    hitsPhysical
  );

  return OF16(Math.max(1, pokeRound((defense * chainMods(dfMods, 410, 131072)) / 4096)));
}

export function calculateDfModsIF(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field,
  desc: RawDesc,
  isCritical = false,
  hitsPhysical = false
) {
  const dfMods = [];
  if (defender.hasAbility('Marvel Scale') && defender.status && hitsPhysical) {
    dfMods.push(6144);
    desc.defenderAbility = defender.ability;
  } else if (
    defender.named('Cherrim') &&
    defender.hasAbility('Flower Gift') &&
    field.hasWeather('Sun', 'Harsh Sunshine') &&
    !hitsPhysical
  ) {
    dfMods.push(6144);
    desc.defenderAbility = defender.ability;
    desc.weather = field.weather;
  } else if (
    field.defenderSide.isFlowerGift &&
    field.hasWeather('Sun', 'Harsh Sunshine') &&
    !hitsPhysical) {
    dfMods.push(6144);
    desc.weather = field.weather;
    desc.isFlowerGiftDefender = true;
  } else if (
    defender.hasAbility('Grass Pelt') &&
    field.hasTerrain('Grassy') &&
    hitsPhysical
  ) {
    dfMods.push(6144);
    desc.defenderAbility = defender.ability;
  } else if (defender.hasAbility('Fur Coat') && hitsPhysical) {
    dfMods.push(8192);
    desc.defenderAbility = defender.ability;
  } else if (defender.hasAbility('Gender Ambiguity') && attacker.flags?.trans) {
    dfMods.push(2048);
    desc.defenderAbility = defender.ability;
  }
  // Pokemon with "-of Ruin" Ability are immune to the opposing "-of Ruin" ability
  const isSwordOfRuinActive = (attacker.hasAbility('Sword of Ruin') || field.isSwordOfRuin) &&
    !defender.hasAbility('Sword of Ruin');
  const isBeadsOfRuinActive = (attacker.hasAbility('Beads of Ruin') || field.isBeadsOfRuin) &&
    !defender.hasAbility('Beads of Ruin');
  if (
    (isSwordOfRuinActive && hitsPhysical) ||
    (isBeadsOfRuinActive && !hitsPhysical)
  ) {
    if (attacker.hasAbility('Sword of Ruin') || attacker.hasAbility('Beads of Ruin')) {
      desc.attackerAbility = attacker.ability;
    } else {
      desc[hitsPhysical ? 'isSwordOfRuin' : 'isBeadsOfRuin'] = true;
    }
    dfMods.push(3072);
  }

  if (field.defenderSide.isSigma && hitsPhysical) {
    dfMods.push(5325);
    desc.isDefenderSigma = true;
  }

  if (isQPActive(defender, field)) {
    if (
      (hitsPhysical && getQPBoostedStat(defender) === 'def') ||
      (!hitsPhysical && getQPBoostedStat(defender) === 'spd')
    ) {
      desc.defenderAbility = defender.ability;
      dfMods.push(5324);
    }
  }

  if ((defender.hasItem('Eviolite') &&
      (defender.name === 'Dipplin' || gen.species.get(toID(defender.name))?.nfe)) ||
    (!hitsPhysical && defender.hasItem('Assault Vest'))) {
    dfMods.push(6144);
    desc.defenderItem = defender.item;
  } else if (
    (defender.hasItem('Metal Powder') && defender.named('Ditto') && hitsPhysical) ||
    (defender.hasItem('Deep Sea Scale') && defender.named('Clamperl') && !hitsPhysical)
  ) {
    dfMods.push(8192);
    desc.defenderItem = defender.item;
  }
  return dfMods;
}

function calculateBaseDamageIF(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  basePower: number,
  attack: number,
  defense: number,
  move: Move,
  field: Field,
  desc: RawDesc,
  isCritical = false,
) {
  let baseDamage = getBaseDamage(attacker.level, basePower, attack, defense);
  const isSpread = field.gameType !== 'Singles' &&
    ['allAdjacent', 'allAdjacentFoes'].includes(move.target);
  if (isSpread) {
    baseDamage = pokeRound(OF32(baseDamage * 3072) / 4096);
  }

  if (attacker.hasAbility('Parental Bond (Child)')) {
    baseDamage = pokeRound(OF32(baseDamage * 1024) / 4096);
  }

  const isMegaSol = attacker.hasAbility('Mega Sol');

  if (
    field.hasWeather('Sun') && move.named('Hydro Steam') && !attacker.hasItem('Utility Umbrella')
  ) {
    baseDamage = pokeRound(OF32(baseDamage * 6144) / 4096);
    isMegaSol ? desc.attackerAbility = attacker.ability : desc.weather = field.weather;
  } else if (!defender.hasItem('Utility Umbrella')) {
    if (
      (field.hasWeather('Sun', 'Harsh Sunshine') && move.hasType('Fire')) ||
      (field.hasWeather('Rain', 'Heavy Rain') && move.hasType('Water')) ||
      (field.hasWeather('Grave') && move.hasType('Ghost'))
    ) {
      baseDamage = pokeRound(OF32(baseDamage * 6144) / 4096);
      desc.weather = field.weather;
    } else if (
      (field.hasWeather('Sun') && move.hasType('Water')) ||
      (field.hasWeather('Rain') && move.hasType('Fire'))
    ) {
      baseDamage = pokeRound(OF32(baseDamage * 2048) / 4096);
      desc.weather = field.weather;
    }
  }

  if (isCritical) {
    baseDamage = Math.floor(OF32(baseDamage * 1.5));
    desc.isCritical = isCritical;
  }

  return baseDamage;
}

export function calculateFinalModsIF(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field,
  desc: RawDesc,
  isCritical = false,
  typeEffectiveness: number,
  hitCount = 0
) {
  const finalMods = [];

  if (field.defenderSide.isReflect && move.category === 'Physical' &&
    !isCritical && !field.defenderSide.isAuroraVeil) {
    // doesn't stack with Aurora Veil
    finalMods.push(field.gameType !== 'Singles' ? 2732 : 2048);
    desc.isReflect = true;
  } else if (
    field.defenderSide.isLightScreen && move.category === 'Special' &&
    !isCritical && !field.defenderSide.isAuroraVeil
  ) {
    // doesn't stack with Aurora Veil
    finalMods.push(field.gameType !== 'Singles' ? 2732 : 2048);
    desc.isLightScreen = true;
  }
  if (field.defenderSide.isAuroraVeil && !isCritical) {
    finalMods.push(field.gameType !== 'Singles' ? 2732 : 2048);
    desc.isAuroraVeil = true;
  }

  if (field.hasTerrain('Frigid') && typeEffectiveness > 1 && !move.hasType('Ice')) {
    finalMods.push(3072);
    desc.terrain = 'Frigid';
  }

  if (attacker.hasAbility('Neuroforce') && typeEffectiveness > 1) {
    finalMods.push(5120);
    desc.attackerAbility = attacker.ability;
  } else if (attacker.hasAbility('Sniper') && isCritical) {
    finalMods.push(6144);
    desc.attackerAbility = attacker.ability;
  } else if (attacker.hasAbility('Tinted Lens') && typeEffectiveness < 1) {
    finalMods.push(8192);
    desc.attackerAbility = attacker.ability;
  }

  if (defender.isDynamaxed && move.named('Dynamax Cannon', 'Behemoth Blade', 'Behemoth Bash')) {
    finalMods.push(8192);
  }

  if (defender.hasAbility('Multiscale', 'Shadow Shield') &&
    defender.curHP() === defender.maxHP() &&
    hitCount === 0 &&
    (!field.defenderSide.isSR && (!field.defenderSide.spikes || defender.hasType('Flying')) ||
      defender.hasItem('Heavy-Duty Boots')) && !attacker.hasAbility('Parental Bond (Child)')
  ) {
    finalMods.push(2048);
    desc.defenderAbility = defender.ability;
  }

  if (defender.hasAbility('Fluffy') && move.flags.contact && !attacker.hasAbility('Long Reach',
    'PVZ Fishing')) {
    finalMods.push(2048);
    desc.defenderAbility = defender.ability;
  } else if (
    (defender.hasAbility('Punk Rock') && move.flags.sound) ||
    (defender.hasAbility('Ice Scales') && move.category === 'Special')
  ) {
    finalMods.push(2048);
    desc.defenderAbility = defender.ability;
  }

  if (defender.hasAbility('Solid Rock', 'Filter', 'Prism Armor') && typeEffectiveness > 1) {
    finalMods.push(3072);
    desc.defenderAbility = defender.ability;
  }

  if (field.defenderSide.isFriendGuard) {
    finalMods.push(3072);
    desc.isFriendGuard = true;
  }

  if (defender.hasAbility('Fluffy') && move.hasType('Fire')) {
    finalMods.push(8192);
    desc.defenderAbility = defender.ability;
  } else if (defender.hasAbility('PVZ Fishing') && move.hasType('Grass')) {
    finalMods.push(8192);
    desc.defenderAbility = defender.ability;
  }

  if (attacker.hasItem('Expert Belt') && typeEffectiveness > 1 && !move.isZ) {
    finalMods.push(4915);
    desc.attackerItem = attacker.item;
  } else if (attacker.hasItem('Life Orb')) {
    finalMods.push(5324);
    desc.attackerItem = attacker.item;
  } else if (attacker.hasItem('Metronome') && move.timesUsedWithMetronome! >= 1) {
    const timesUsedWithMetronome = Math.floor(move.timesUsedWithMetronome!);
    if (timesUsedWithMetronome <= 4) {
      finalMods.push(4096 + timesUsedWithMetronome * 819);
    } else {
      finalMods.push(8192);
    }
    desc.attackerItem = attacker.item;
  }

  if (move.hasType(getBerryResistType(defender.item)) &&
    (typeEffectiveness > 1 || move.hasType('Normal')) &&
    hitCount === 0 &&
    !attacker.hasAbility('Unnerve', 'As One (Glastrier)', 'As One (Spectrier)')) {
    if (defender.hasAbility('Ripen')) {
      finalMods.push(1024);
    } else {
      finalMods.push(2048);
    }
    desc.defenderItem = defender.item;
  }

  return finalMods;
}

function hasTerrainSeed(pokemon: Pokemon) {
  return pokemon.hasItem('Electric Seed', 'Misty Seed', 'Grassy Seed', 'Psychic Seed');
}
