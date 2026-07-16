import type {Generation, Weather, Terrain, TypeName, ID} from './data/interface';
import type {Field, Side} from './field';
import {Move} from './move';
import type {Pokemon} from './pokemon';
import {type Damage, damageRange, multiDamageRange} from './result';
import {calculateIF} from './mechanics/ironfist';
import {error} from './util';
// NOTE: This needs to come last to simplify bundling
import {isGrounded} from './mechanics/util';

export interface RawDesc {
  HPEVs?: string;
  attackBoost?: number;
  attackEVs?: string;
  attackerAbility?: string;
  attackerItem?: string;
  attackerName: string;
  attackerTera?: string;
  defenderAbility?: string;
  defenderItem?: string;
  defenderName: string;
  defenderTera?: string;
  defenseBoost?: number;
  defenseEVs?: string;
  hits?: number;
  alliesFainted?: number;
  foesFainted?: number;
  foeBoosts?: number;
  isStellarFirstUse?: boolean;
  isBeadsOfRuin?: boolean;
  isSwordOfRuin?: boolean;
  isTabletsOfRuin?: boolean;
  isVesselOfRuin?: boolean;
  isAutomatonOfRuin?: boolean;
  isDogOfRuin?: boolean;
  isLoveOfRuin?: boolean;
  isPoultryOfRuin?: boolean;
  isAuroraVeil?: boolean;
  isFlowerGiftAttacker?: boolean;
  isFlowerGiftDefender?: boolean;
  isPowerTrickAttacker?: boolean;
  isPowerTrickDefender?: boolean;
  isSteelySpiritAttacker?: boolean;
  isFriendGuard?: boolean;
  isHelpingHand?: boolean;
  isCritical?: boolean;
  isLightScreen?: boolean;
  isBurned?: boolean;
  isDrowsy?: boolean;
  isFrostbitten?: boolean;
  isBaseballed?: boolean;
  isProtected?: boolean;
  isReflect?: boolean;
  isBattery?: boolean;
  isPowerSpot?: boolean;
  isWonderRoom?: boolean;
  isSwitching?: 'out' | 'in';
  moveBP?: number;
  moveName: string;
  moveTurns?: string;
  moveType?: TypeName;
  rivalry?: 'buffed' | 'nerfed';
  terrain?: Terrain;
  weather?: Weather;
  isDefenderDynamaxed?: boolean | 'gmax';
  isDefenseDown?: boolean;
  isCharged?: boolean;
  isDragonCharged?: boolean;
  isBlottedOut?: boolean;
  isBestWishesFrozen?: boolean;
  isAttackerBig?: boolean;
  isDefenderBig?: boolean;
  isAttackerSigma?: boolean;
  isDefenderSigma?: boolean;
  isSerious?: boolean;
  attackerFishingTokens?: boolean | number;
  defenderFishingTokens?: boolean | number;
  isCuddle?: boolean;
  isHoldHands?: boolean;
  isKitchenSink?: boolean;
  hasSelfHitDamage?: Damage;
  numTrumps?: number;
  pp?: number;
}

function isImmuneToIndirect(source: Pokemon, field: Field): boolean {
  return source.hasAbility('Magic Guard') ||
    (source.hasAbility('Magic Sticks') && source.gen.num === 20) ||
    (source.hasAbility('Gentei\'s Protection') && field.isTrickRoom);
}

function isImmuneToHazards(source: Pokemon, field: Field): boolean {
  return isImmuneToIndirect(source, field) ||
    (source.hasAbility('Dexterity') && source.gen.num === 12) ||
    (source.hasAbility('Exoskeleton') && source.gen.num === 22) ||
    (source.hasAbility('Diving Horn') && source.gen.num === 23);
}

function isImmuneToRocks(source: Pokemon, field: Field): boolean {
  return isImmuneToHazards(source, field) || source.hasAbility('Mountaineer') ||
    (source.hasAbility('Plow') && source.gen.num === 13) ||
    (source.hasAbility('Earth Eater') && source.gen.num === 22);
}

function isImmuneToSpikes(source: Pokemon, field: Field): boolean {
  return isImmuneToHazards(source, field) || source.hasAbility('Levitate', 'Eelevate') ||
    (source.hasAbility('Plow') && source.gen.num === 13) ||
    (source.hasAbility('Earth Eater') && source.gen.num === 22) ||
    (source.hasAbility('Sunlit Flight') && source.gen.num === 20) ||
    source.hasType('Flying') || source.hasItem('Air Balloon');
}

function isImmuneToWeather(source: Pokemon, field: Field): boolean {
  return isImmuneToIndirect(source, field) || source.hasAbility('Overcoat') ||
    (source.hasAbility('Leaf Coat', 'Love of Ruin') && source.gen.num === 20) ||
    (source.hasAbility('awesomeability', 'Diving Horn') && source.gen.num === 23);
}

function isImmuneToSand(source: Pokemon, field: Field): boolean {
  return isImmuneToWeather(source, field) || source.hasAbility('Sand Force', 'Sand Rush',
    'Sand Veil') || source.hasItem('Safety Goggles') || source.hasType('Steel', 'Rock', 'Ground') ||
    (source.hasAbility('Dust Devil', 'Sand Cloak', 'Tempest Force', 'Tempest Energy') &&
      source.gen.num === 13) ||
    (source.hasAbility('Desert Shot', 'Oasis Lunch', 'Sharpshooter', 'Soulstone', 'Tectonic Power',
      'Tundra Rush', 'Tundra Veil') && source.gen.num === 20);
}

function isImmuneToHail(source: Pokemon, field: Field): boolean {
  return isImmuneToWeather(source, field) || source.hasType('Ice') ||
    source.hasAbility('Ice Body', 'Slush Rush', 'Snow Cloak') || source.hasItem('Safety Goggles') ||
    (source.hasAbility('Absolute Zero', 'Ice Breaker') && source.gen.num === 13) ||
    (source.hasAbility('Ice Scales') && source.gen.num === 22) ||
    (source.hasAbility('Abominable', 'Cryowarning', 'Polar Power', 'Tundra Rush', 'Tundra Veil') &&
      source.gen.num === 20);
}

function isImmuneToAcid(source: Pokemon, field: Field): boolean {
  return isImmuneToWeather(source, field) ||
    !(source.hasType('Water', 'Steel') && !source.hasType('Bug', 'Lemon')) ||
    (source.hasAbility('I love sewers', 'Toxic Wisdom') && source.gen.num === 23);
}

function isImmuneToGrave(source: Pokemon, field: Field): boolean {
  return isImmuneToWeather(source, field) || source.hasType('Normal', 'Ghost', 'Dark') ||
    (source.hasAbility('Fashion Icon', 'Ghoul Gobbler', 'Macabre Mourner', 'Monster Mash') &&
      source.gen.num === 23);
}

export function display(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field,
  damage: Damage,
  rawDesc: RawDesc,
  notation = '%',
  err = true
) {
  const [min, max] = damageRange(damage);

  const minDisplay = toDisplay(notation, min, defender.maxHP());
  const maxDisplay = toDisplay(notation, max, defender.maxHP());

  const desc = buildDescription(rawDesc, attacker, defender);
  const damageText = `${min}-${max} (${minDisplay} - ${maxDisplay}${notation})`;

  if (move.category === 'Status' && !move.named('Nature Power')) return `${desc}: ${damageText}`;
  const koChanceText = getKOChance(gen, attacker, defender, move, field, damage, err).text;
  return !(rawDesc.isCuddle || rawDesc.isHoldHands || rawDesc.isKitchenSink)
    ? (koChanceText ? `${desc}: ${damageText} -- ${koChanceText}`
    : `${desc}: ${damageText}`) : `${desc}`;
}

export function displayMove(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  damage: Damage,
  notation = '%',
  field: Field
) {
  const [min, max] = damageRange(damage);

  const minDisplay = toDisplay(notation, min, defender.maxHP());
  const maxDisplay = toDisplay(notation, max, defender.maxHP());

  const recoveryText = getRecovery(gen, attacker, defender, move, damage, notation).text;
  const recoilText = getRecoil(gen, attacker, defender, move, damage, notation, field).text;

  return `${minDisplay} - ${maxDisplay}${notation}${recoveryText &&
    ` (${recoveryText})`}${recoilText && ` (${recoilText})`}`;
}

export function getRecovery(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  damage: Damage,
  notation = '%'
) {
  const [minDamage, maxDamage] = damageRange(damage);
  let minD;
  let maxD;
  if (move.timesUsed && move.timesUsed > 1) {
    [minD, maxD] = multiDamageRange(damage) as [number[], number[]];
  } else {
    minD = [minDamage];
    maxD = [maxDamage];
  }

  const recovery = [0, 0] as [number, number];
  let text = '';

  const ignoresShellBell =
    [3].includes(gen.num) && move.named('Doom Desire', 'Future Sight');
  if ((attacker.hasItem('Shell Bell') || attacker.hasAbility('Predator')) && !ignoresShellBell) {
    for (let i = 0; i < minD.length; i++) {
      recovery[0] += minD[i] > 0 ? Math.max(Math.round(minD[i] / 8), 1) : 0;
      recovery[1] += maxD[i] > 0 ? Math.max(Math.round(maxD[i] / 8), 1) : 0;
    }
    // This is incorrect if the opponent heals during your damage
    // Ex: Sitrus Berry procs in the middle of multi-hit move
    const maxHealing = Math.round(defender.curHP() / 8);
    recovery[0] = Math.min(recovery[0], maxHealing);
    recovery[1] = Math.min(recovery[1], maxHealing);
  }

  if ([11].includes(gen.num) && attacker.hasItem('Bug Gem') && move.hasType('Bug')) {
    for (let i = 0; i < minD.length; i++) {
      recovery[0] += minD[i] > 0 ? Math.max(Math.round(minD[i] / 4), 1) : 0;
      recovery[1] += maxD[i] > 0 ? Math.max(Math.round(maxD[i] / 4), 1) : 0;
    }
    // This is incorrect if the opponent heals during your damage
    // Ex: Sitrus Berry procs in the middle of multi-hit move
    const maxHealing = Math.round(defender.curHP() / 8);
    recovery[0] = Math.min(recovery[0], maxHealing);
    recovery[1] = Math.min(recovery[1], maxHealing);
  }

  if (move.named('G-Max Finale')) {
    recovery[0] += Math.round(attacker.maxHP() / 6);
    recovery[1] += Math.round(attacker.maxHP() / 6);
  }

  if (move.flags?.fishing && attacker.hasAbility('Fishercat')) {
    recovery[0] += Math.round(attacker.maxHP() / 4);
    recovery[1] += Math.round(attacker.maxHP() / 4);
  }

  if (move.named('Pain Split')) {
    const average = Math.floor((attacker.curHP() + defender.curHP()) / 2);
    recovery[0] = recovery[1] = average - attacker.curHP();
  }

  if (move.drain) {
    // Parental Bond counts as multiple heals for drain moves, but not for Shell Bell
    // Currently no drain moves are multihit, however this covers for it.
    if (attacker.hasAbility('Parental Bond') || move.hits > 1) {
      [minD, maxD] = multiDamageRange(damage) as [number[], number[]];
    }
    const percentHealed = move.drain[0] / move.drain[1];
    const attackerHasBigRoot = attacker.hasItem('Big Root');
    let maxDrain = Math.round(defender.curHP() * percentHealed);
    if (attackerHasBigRoot) maxDrain = Math.trunc(maxDrain * 5324 / 4096);
    for (let i = 0; i < minD.length; i++) {
      const range = [minD[i], maxD[i]];
      for (const j in recovery) {
        let drained = Math.max(Math.round(range[j] * percentHealed), 1);
        if (attackerHasBigRoot) drained = Math.trunc(drained * 5324 / 4096);
        recovery[j] += Math.min(drained, maxDrain);
      }
    }
  }

  if (recovery[1] === 0) return {recovery, text};

  const minHealthRecovered = toDisplay(notation, recovery[0], attacker.maxHP());
  const maxHealthRecovered = toDisplay(notation, recovery[1], attacker.maxHP());
  const change = recovery[0] > 0 ? 'recovered' : 'lost';
  text = `${minHealthRecovered} - ${maxHealthRecovered}${notation} ${change}`;

  return {recovery, text};
}

// TODO: return recoil damage as exact HP
export function getRecoil(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  damage: Damage,
  notation = '%',
  field: Field
) {
  const [min, max] = damageRange(damage);

  let recoil: [number, number] | number = [0, 0];
  let text = '';

  const damageOverflow = min > defender.curHP() || max > defender.curHP();
  if (move.named('Blazeball')) {
    const miniBlazeball = new Move(gen, 'Mini Blazeball', {overrides: {flags: {bullet: 1}}});
    miniBlazeball.bp = 80;
    miniBlazeball.type = 'Fire';
    miniBlazeball.category = 'Special';
    let selfHitDamage = calculateIF(gen, attacker, attacker, miniBlazeball, field).damage;
    let minRecoilDamage, maxRecoilDamage;
    if (typeof selfHitDamage !== 'number') {
      selfHitDamage = selfHitDamage as number[];
      minRecoilDamage = toDisplay(notation, selfHitDamage[0], attacker.maxHP(), 1);
      maxRecoilDamage = toDisplay(notation, selfHitDamage[selfHitDamage.length - 1],
        attacker.maxHP(), 1);
      recoil = [minRecoilDamage, maxRecoilDamage];
      text += `${minRecoilDamage} - ${maxRecoilDamage}${notation} self damage`;
    }
  } else if (defender.hasAbility('Steel Drummer') && move.hasType('Steel')) {
    const selfHitDamage = calculateIF(gen, attacker, attacker, move, field).damage as number[];
    const minRecoilDamage = toDisplay(notation, selfHitDamage[0], attacker.maxHP(), 1);
    const maxRecoilDamage = toDisplay(notation, selfHitDamage[selfHitDamage.length - 1],
      attacker.maxHP(), 1);
    recoil = [minRecoilDamage, maxRecoilDamage];
    text += `${minRecoilDamage} - ${maxRecoilDamage}${notation} self damage`;
  }
  if (defender.hasAbility('Lawbender') && move.hasType('Dark')) {
    const earthPower = new Move(gen, 'Earth Power');
    let recoilDamage = calculateIF(gen, defender, attacker, earthPower, field).damage as number[];
    if (recoilDamage.length === undefined) {
      recoilDamage = [0, 0];
    }
    console.log(recoilDamage.length);
    console.log(recoilDamage);
    const minRecoilDamage = toDisplay(notation, recoilDamage[0], attacker.maxHP(), 1);
    const maxRecoilDamage = toDisplay(notation, recoilDamage[recoilDamage.length - 1],
      attacker.maxHP(), 1);
    recoil = [minRecoilDamage, maxRecoilDamage];
    text += `${minRecoilDamage} - ${maxRecoilDamage}${notation} law's retribution`;
  }
  if (move.recoil) {
    const mod = (move.recoil[0] / move.recoil[1]) * 100;
    let minRecoilDamage, maxRecoilDamage;
    if (damageOverflow) {
      minRecoilDamage =
        toDisplay(notation, defender.curHP() * mod, attacker.maxHP(), 100);
      maxRecoilDamage =
        toDisplay(notation, defender.curHP() * mod, attacker.maxHP(), 100);
    } else {
      minRecoilDamage = toDisplay(
        notation, Math.min(min, defender.curHP()) * mod, attacker.maxHP(), 100
      );
      maxRecoilDamage = toDisplay(
        notation, Math.min(max, defender.curHP()) * mod, attacker.maxHP(), 100
      );
    }
    if (!attacker.hasAbility('Pea Brain', 'Rock Head')) {
      recoil = [minRecoilDamage, maxRecoilDamage];
      text += `${minRecoilDamage} - ${maxRecoilDamage}${notation} recoil damage`;
    }
  } else if ((attacker.hasAbility('Head Barrage') && move.category === 'Special') ||
  attacker.hasAbility('Overload') && move.hasType('Dragon')) {
    const mod = (1 / 4) * 100;
    let minRecoilDamage, maxRecoilDamage;
    if (damageOverflow) {
      minRecoilDamage =
        toDisplay(notation, defender.curHP() * mod, attacker.maxHP(), 100);
      maxRecoilDamage =
        toDisplay(notation, defender.curHP() * mod, attacker.maxHP(), 100);
    } else {
      minRecoilDamage = toDisplay(
        notation, Math.min(min, defender.curHP()) * mod, attacker.maxHP(), 100
      );
      maxRecoilDamage = toDisplay(
        notation, Math.min(max, defender.curHP()) * mod, attacker.maxHP(), 100
      );
    }
    recoil = [minRecoilDamage, maxRecoilDamage];
    text += `${minRecoilDamage} - ${maxRecoilDamage}${notation} recoil damage`;
  } else if (move.hasCrashDamage) {
    const genMultiplier = [2].includes(gen.num) ? 12.5
      : ([1, 10].includes(gen.num)) ? 1 : 50;

    let minRecoilDamage, maxRecoilDamage;
    if (damageOverflow && ![2].includes(gen.num)) {
      minRecoilDamage =
        toDisplay(notation, defender.curHP() * genMultiplier, attacker.maxHP(), 100);
      maxRecoilDamage =
        toDisplay(notation, defender.curHP() * genMultiplier, attacker.maxHP(), 100);
    } else {
      minRecoilDamage = toDisplay(
        notation, Math.min(min, defender.maxHP()) * genMultiplier, attacker.maxHP(), 100
      );
      maxRecoilDamage = toDisplay(
        notation, Math.min(max, defender.maxHP()) * genMultiplier, attacker.maxHP(), 100
      );
    }

    recoil = [minRecoilDamage, maxRecoilDamage];
    switch (gen.num) {
    case 1:
    case 10:
      recoil = toDisplay(notation, 1, attacker.maxHP());
      text = '1hp damage on miss';
      break;
    case 2: case 3: case 4:
      if (defender.hasType('Ghost')) {
        if ([4].includes(gen.num)) {
          const gen4CrashDamage = Math.floor(((defender.maxHP() * 0.5) / attacker.maxHP()) * 100);
          recoil = notation === '%' ? gen4CrashDamage : Math.floor((gen4CrashDamage / 100) * 48);
          text = `${gen4CrashDamage}% crash damage`;
        } else {
          recoil = 0;
          text = 'no crash damage on Ghost types';
        }
      } else {
        text = `${minRecoilDamage} - ${maxRecoilDamage}${notation} crash damage on miss`;
      }
      break;
    default:
      recoil = notation === '%' ? 24 : 50;
      text += '50% crash damage';
    }
  } else if (move.struggleRecoil) {
    recoil = notation === '%' ? 12 : 25;
    text += '25% struggle damage';
    // Struggle recoil is actually rounded down in Gen 4 per DaWoblefet's research, but until we
    // return recoil damage as exact HP the best we can do is add some more text to this effect
    if ([4].includes(gen.num)) text += ' (rounded down)';
  } else if (move.mindBlownRecoil) {
    recoil = notation === '%' ? 24 : 50;
    text += '50% recoil damage';
  } else if (defender.hasAbility('Auctor Wile') && move.flags.punch) {
    recoil = notation === '%' ? 12 : 25;
    text += '25% Auctor Wile damage';
  }

  return {recoil, text};
}

export function getKOChance(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field,
  damageObj: Damage,
  err = true
) {
  const [damage, approximate] = combine(damageObj);
  if (isNaN(damage[0])) {
    error(err, 'damage[0] must be a number.');
    return {chance: 0, n: 0, text: ''};
  }
  if (damage[damage.length - 1] === 0) {
    error(err, 'damage[damage.length - 1] === 0.');
    return {chance: 0, n: 0, text: ''};
  }

  // Code doesn't really work if these aren't set.
  if (move.timesUsed === undefined) move.timesUsed = 1;
  if (move.timesUsedWithMetronome === undefined) move.timesUsedWithMetronome = 1;

  if (damage[0] >= defender.maxHP() && move.timesUsed === 1 && move.timesUsedWithMetronome === 1) {
    return {chance: 1, n: 1, text: 'guaranteed OHKO'};
  }

  const hazards = getHazards(gen, defender, field);
  const eot = getEndOfTurn(gen, attacker, defender, move, field);
  const toxicCounter =
    defender.hasStatus('tox') && !defender.hasAbility('Poison Heal') &&
    isImmuneToIndirect(defender, field) ? defender.toxicCounter : 0;

  // multi-hit moves have too many possibilities for brute-forcing to work, so reduce it
  // to an approximate distribution if greater than 3 hits
  const qualifier = approximate ? 'approx. ' : '';

  const hazardsText = hazards.texts.length > 0
    ? ' after ' + serializeText(hazards.texts)
    : '';
  const afterText =
    hazards.texts.length > 0 || eot.texts.length > 0
      ? ' after ' + serializeText(hazards.texts.concat(eot.texts))
      : '';
  const afterTextNoHazards = eot.texts.length > 0 ? ' after ' + serializeText(eot.texts) : '';

  function roundChance(chance: number) {
    // prevent displaying misleading 100% or 0% chances
    return Math.max(Math.min(Math.round(chance * 1000), 999), 1) / 10;
  }

  function KOChance(
    chanceWithoutEot: number | undefined,
    chanceWithEot: number | undefined,
    n: number,
    multipleTurns = false,
  ) {
    // chanceWithoutEot and chanceWithEot are calculated separately for OHKOs
    // because the difference between KOing at start of turn is very important in some cases
    // for 2HKOs and onward, only chanceWithEot is calculated,
    // so chanceWithoutEot will be set to 0 for the purposes of this function
    // all this really does is skip straight to that last else if block
    // using the number of hits we can determine the type of KO we are checking for
    // chance is the value that is returned by this function,
    // and is the higher of the two chance parameters
    const KOTurnText = n === 1 ? 'OHKO'
      : (multipleTurns ? `KO in ${n} turns` : `${n}HKO`);
    let text = qualifier;
    let chance = undefined;
    if (chanceWithoutEot === undefined || chanceWithEot === undefined) {
      text += `possible ${KOTurnText}`;
      // not a KO
    } else if (chanceWithoutEot + chanceWithEot === 0) {
      chance = 0;
      text += 'not a KO';
      // if the move OHKOing is guaranteed even without end of turn damage
    } else if (chanceWithoutEot === 1) {
      chance = chanceWithoutEot;
      text = 'guaranteed ';
      text += `OHKO${hazardsText}`;
    } else if (chanceWithoutEot > 0) {
      chance = chanceWithEot;
      // if the move OHKOing is possible, but eot damage guarantees the OHKO
      // I have it so that the text specifies the chance of the OHKO without eot damage,
      // because it might matter in some scenarios
      // eg. if your opponent has a move that can OHKO you but you're faster,
      // it might be important to get the OKKO before they can move
      if (chanceWithEot === 1) {
        text += `${roundChance(chanceWithoutEot)}% chance to ${KOTurnText}${hazardsText} ` +
          `(guaranteed ${KOTurnText}${afterTextNoHazards})`;
        // if the move OHKOing is possible, and eot damage increases the odds of the KO
      } else if (chanceWithEot > chanceWithoutEot) {
        text += `${roundChance(chanceWithoutEot)}% chance to ${KOTurnText}${hazardsText} ` +
          `(${qualifier}${roundChance(chanceWithEot)}% chance to ` +
          `${KOTurnText}${afterTextNoHazards})`;
        // if the move KOing is possible, and eot damage does not increase the odds of the KO
      } else if (chanceWithoutEot > 0) {
        text += `${roundChance(chanceWithoutEot)}% chance to ${KOTurnText}${hazardsText}`;
      }
    } else if (chanceWithoutEot === 0) {
      chance = chanceWithEot;
      // if the move KOing is not possible, but eot damage guarantees the OHKO
      if (chanceWithEot === 1) {
        text = 'guaranteed ';
        text += `${KOTurnText}${afterText}`;
        // if the move KOing is not possible, but eot damage might KO
      } else if (chanceWithEot > 0) {
        text += `${roundChance(chanceWithEot)}% chance to ${KOTurnText}${afterText}`;
      }
    }
    return {chance, n, text};
  }

  if ((move.timesUsed === 1 && move.timesUsedWithMetronome === 1) || move.isZ) {
    const chance = computeKOChance(
      damage, defender.curHP() - hazards.damage, 0, 1, 1, defender.maxHP(), 0
    );
    const chanceWithEot = computeKOChance(
      damage, defender.curHP() - hazards.damage, eot.damage, 1, 1, defender.maxHP(), toxicCounter
    );

    // checks if either chance is greater than 0
    if (chance + chanceWithEot > 0) return KOChance(chance, chanceWithEot, 1);

    for (let i = 2; i <= 4; i++) {
      const chance = computeKOChance(
        damage, defender.curHP() - hazards.damage, eot.damage, i, 1, defender.maxHP(), toxicCounter
      );
      if (chance > 0) return KOChance(0, chance, i);
    }

    for (let i = 5; i <= 9; i++) {
      if (
        predictTotal(damage[0], eot.damage, i, 1, toxicCounter, defender.maxHP()) >=
        defender.curHP() - hazards.damage
      ) {
        return KOChance(0, 1, i);
      } else if (
        predictTotal(damage[damage.length - 1], eot.damage, i, 1, toxicCounter, defender.maxHP()) >=
        defender.curHP() - hazards.damage
      ) {
        // possible but no concrete chance
        return KOChance(undefined, undefined, i);
      }
    }
  } else {
    const chance = computeKOChance(
      damage, defender.maxHP() - hazards.damage,
      eot.damage,
      move.hits || 1,
      move.timesUsed || 1,
      defender.maxHP(),
      toxicCounter
    );
    if (chance > 0) return KOChance(0, chance, move.timesUsed, chance === 1);

    if (predictTotal(
      damage[0],
      eot.damage,
      1,
      move.timesUsed,
      toxicCounter,
      defender.maxHP()
    ) >=
      defender.curHP() - hazards.damage
    ) {
      return KOChance(0, 1, move.timesUsed, true);
    } else if (
      predictTotal(
        damage[damage.length - 1],
        eot.damage,
        1,
        move.timesUsed,
        toxicCounter,
        defender.maxHP()
      ) >=
      defender.curHP() - hazards.damage
    ) {
      // possible but no real idea
      return KOChance(undefined, undefined, move.timesUsed, true);
    }
    return KOChance(0, 0, move.timesUsed);
  }

  return {chance: 0, n: 0, text: ''};
}

function combine(damage: Damage): [number[], boolean] {
  // Fixed Damage
  if (typeof damage === 'number') return [[damage], false];

  // Standard Damage (16 or 39 rolls)
  if (damage.length >= 16 && typeof damage[0] === 'number') {
    return [damage as number[], false];
  }
  // Fixed Multi-hit Damage (currently only parental bond)
  if (typeof damage[0] === 'number' && typeof damage[1] === 'number') {
    return [[damage[0] + damage[1]], false];
  }
  // Multi-hit Damage

  // Reduce Distribution to be at most 256 elements, maintains min and max
  function reduce(dist: number[], scaleValue: number): number[] {
    // should always be 16^2 or 39^2
    const new_length = dist.length / scaleValue;
    const reduced = [];
    reduced[0] = dist[0];
    reduced[new_length - 1] = dist[dist.length - 1];
    for (let i = 1; i < new_length - 1; i++) {
      reduced[i] = dist[Math.round(i * scaleValue + scaleValue / 2)];
    }
    return reduced;
  }

  function combineTwo(dist1: number[], dist2: number[]): number[] {
    const combined = dist1.flatMap(val1 => dist2.map(val2 => val1 + val2)).sort((a, b) => a - b);
    return combined;
  }

  // Combine n distributions to return an approximation of sum
  // Perfectly accurate for <= 3 hits, within 1% otherwise (Max 0.5% off for 7 hits)
  function combineDistributions(dists: number[][]): [number[], boolean] {
    let combined = [0];
    const numRolls = dists[0].length;
    // Usually returns numRolls^2 values, but allow for perfect accuracy for exactly 3 hits
    const numAccuracy = (numRolls === 16 && dists.length === 3) ? 3 : 2;
    let approximate = false;
    for (let i = 0; i < dists.length; i++) {
      const distribution = dists[i];
      combined = combineTwo(combined, distribution);
      if (i >= numAccuracy) {
        combined = reduce(combined, distribution.length);
        approximate = true;
      }
    }
    return [combined, approximate];
  }

  const d = damage as number[][];
  return combineDistributions(d);
}

const TRAPPING = [
  'Bind', 'Clamp', 'Fire Spin', 'Infestation', 'Magma Storm', 'Sand Tomb',
  'Thunder Cage', 'Whirlpool', 'Wrap', 'G-Max Sandblast', 'G-Max Centiferno',
];

export function getHazards(gen: Generation, defender: Pokemon, field: Field) {
  let damage = 0;
  const texts: string[] = [];
  const defenderSide = field.defenderSide;

  if (defender.hasItem('Heavy-Duty Boots')) {
    return {damage, texts};
  }
  if (defenderSide.isSR && !isImmuneToRocks(defender, field)) {
    const rockType = gen.types.get('rock' as ID)!;
    const effectiveness =
      defender.teraType && defender.teraType !== 'Stellar'
        ? rockType.effectiveness[defender.teraType]!
        : rockType.effectiveness[defender.types[0]]! *
          (defender.types[1] ? rockType.effectiveness[defender.types[1]]! : 1);
    if (defender.hasAbility('Fervent Scales', 'Dragon\'s Gale')) {
      damage += Math.floor((effectiveness * defender.maxHP()) / 16);
    } else {
      damage += Math.floor((effectiveness * defender.maxHP()) / 8);
    }
    texts.push('Stealth Rock');
  }
  if (defenderSide.steelsurge && !isImmuneToHazards(defender, field)) {
    const steelType = gen.types.get('steel' as ID)!;
    const effectiveness =
      defender.teraType && defender.teraType !== 'Stellar'
        ? steelType.effectiveness[defender.teraType]!
        : steelType.effectiveness[defender.types[0]]! *
        (defender.types[1] ? steelType.effectiveness[defender.types[1]]! : 1);
    damage += Math.floor((effectiveness * defender.maxHP()) / 8);
    texts.push('Steelsurge');
  }

  if (!isImmuneToSpikes(defender, field)) {
    if (defenderSide.spikes === 1) {
      if (defender.hasAbility('Fervent Scales', 'Dragon\'s Gale')) {
        damage += Math.floor((defender.maxHP()) / 16);
      } else {
        damage += Math.floor((defender.maxHP()) / 8);
      }
      if ([2].includes(gen.num)) {
        texts.push('Spikes');
      } else {
        texts.push('1 layer of Spikes');
      }
    } else if (defenderSide.spikes === 2) {
      if (defender.hasAbility('Fervent Scales', 'Dragon\'s Gale')) {
        damage += Math.floor((defender.maxHP()) / 12);
      } else {
        damage += Math.floor((defender.maxHP()) / 6);
      }
      texts.push('2 layers of Spikes');
    } else if (defenderSide.spikes === 3) {
      if (defender.hasAbility('Fervent Scales', 'Dragon\'s Gale')) {
        damage += Math.floor((defender.maxHP()) / 8);
      } else {
        damage += Math.floor((defender.maxHP()) / 4);
      }
      texts.push('3 layers of Spikes');
    }
  }

  if (defenderSide.isBlastblighted) {
    if (!isImmuneToIndirect(defender, field)) {
      if (defender.hasAbility('Fervent Scales')) {
        damage += Math.floor((defender.maxHP()) / 12);
      } else {
        damage += Math.floor((defender.maxHP()) / 6);
      }
      texts.push('Blastblight');
    }
  }

  if (isNaN(damage)) {
    damage = 0;
  }

  return {damage, texts};
}

function getEndOfTurn(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field
) {
  let damage = 0;
  const texts = [];

  const loseItem = move.named('Knock Off') && !defender.hasAbility('Sticky Hold');
  // psychic noise should suppress all recovery effects
  const healBlock = move.named('Psychic Noise') &&
    !(
      // suppression conditions
      attacker.hasAbility('Sheer Force') ||
      defender.hasItem('Covert Cloak') ||
      defender.hasAbility('Shield Dust', 'Aroma Veil')
    );
  if (field.hasWeather('Sun', 'Harsh Sunshine')) {
    if (defender.hasAbility('Dry Skin', 'Solar Power', 'Solar Wrath', 'Ghoul Gobbler')) {
      damage -= Math.floor(defender.maxHP() / 8);
      texts.push(defender.ability + ' damage');
    } else if (defender.hasAbility('Oilmucus')) {
      damage += Math.floor(defender.maxHP() / 8);
      texts.push('Oilmucus Recovery');
    } else if (defender.hasAbility('Magma Armor') && gen.num === 11) {
      damage += Math.floor(defender.maxHP() / 8);
      texts.push('Magma Armor Recovery');
    }
  } else if (field.hasWeather('Rain', 'Heavy Rain') && !healBlock) {
    if (defender.hasAbility('Dry Skin')) {
      damage += Math.floor(defender.maxHP() / 8);
      texts.push('Dry Skin recovery');
    } else if (defender.hasAbility('Healthy Drink', 'Rain Dish')) {
      damage += Math.floor(defender.maxHP() / ([4].includes(gen.num) ? 8 : 16));
      texts.push('Rain Dish recovery');
    } else if (defender.hasAbility('Oilmucus')) {
      damage -= Math.floor(defender.maxHP() / 8);
      texts.push('Oilmucus damage');
    } else if (defender.hasAbility('Magma Armor') && gen.num === 11) {
      damage -= Math.floor(defender.maxHP() / 8);
      texts.push('Magma Armor damage');
    }
  } else if (field.hasWeather('Dust Devil', 'Sand')) {
    if (!isImmuneToSand(defender, field)) {
      if (defender.hasAbility('Fervent Scales')) {
        damage -= Math.floor(defender.maxHP() / ([2].includes(gen.num) ? 16 : 32));
      } else {
        damage -= Math.floor(defender.maxHP() / ([2].includes(gen.num) ? 8 : 16));
      }
      texts.push(`${field.weather} damage`);
    }
  } else if (field.hasWeather('Absolute Zero', 'Snow', 'Hail')) {
    if (field.hasWeather('Absolute Zero', 'Hail') && !isImmuneToHail(defender, field)) {
      if (defender.hasAbility('Fervent Scales')) {
        damage += Math.floor((defender.maxHP()) / 32);
      } else {
        damage += Math.floor((defender.maxHP()) / 16);
      }
      texts.push(`${field.weather} damage`);
    } else if (defender.hasAbility('Abominable', 'Cryowarning', 'Ice Body') && !healBlock) {
      damage += Math.floor((defender.maxHP()) / ([4, 23].includes(gen.num) ? 8 : 16));
      texts.push(`${defender.ability} recovery`);
    } else if (defender.hasAbility('Snow Seethe')) {
      damage -= Math.floor(defender.maxHP() / 8);
      texts.push('Snow Seethe damage');
    }
  } else if (field.hasWeather('Acid') || defender.hasAbility('Lemonga Sour')) {
    if (!isImmuneToAcid(defender, field)) {
      damage -= Math.floor(defender.maxHP() / 16);
      texts.push('acid rain damage');
    } else if (defender.hasType('Lemon')) {
      damage += Math.floor(defender.maxHP() / 16);
      texts.push('acid rain healing');
    }
  } else if (field.hasWeather('Grave')) {
    if (attacker.hasAbility('Necrodancer')) {
      damage -= Math.floor(defender.maxHP() / 16);
      texts.push('necrodancer damage');
    }
    if (!isImmuneToGrave(defender, field)) {
      damage -= Math.floor(defender.maxHP() / 16);
      texts.push('zombies damage');
    } else if (defender.hasAbility('Ghoul Gobbler')) {
      damage += Math.floor(defender.maxHP() / 8);
      texts.push('zombie healing');
    }
  }

  if (defender.hasItem('Leftovers') && !loseItem && !healBlock) {
    damage += Math.floor(defender.maxHP() / 16);
    texts.push('Leftovers recovery');
  } else if (defender.hasAbility('Honeyed Web') && !healBlock) {
    damage += Math.floor(defender.maxHP() / 8);
    texts.push('Honeyed Web recovery');
  } else if (defender.hasItem('Black Sludge') && !loseItem) {
    if (defender.hasType('Poison')) {
      if (!healBlock) {
        damage += Math.floor(defender.maxHP() / 16);
        texts.push('Black Sludge recovery');
      }
    } else if (!defender.hasAbility('Klutz') && !isImmuneToIndirect(defender, field)) {
      if (defender.hasAbility('Fervent Scales')) {
        damage += Math.floor((defender.maxHP()) / 16);
      } else {
        damage += Math.floor((defender.maxHP()) / 8);
      }
      texts.push('Black Sludge damage');
    }
  } else if (defender.hasItem('Sticky Barb') && !loseItem &&
    !defender.hasAbility('Klutz') && !isImmuneToIndirect(defender, field)) {
    if (defender.hasAbility('Fervent Scales')) {
      damage += Math.floor((defender.maxHP()) / 16);
    } else {
      damage += Math.floor((defender.maxHP()) / 8);
    }
    texts.push('Sticky Barb damage');
  }

  if (defender.hasAbility('Pathogenic') && !defender.hasType('Poison')) {
    damage -= Math.floor(defender.maxHP() / 8);
    texts.push('Pathogenic damage');
  }
  if (defender.hasAbility('Oceanic Veil')) {
    damage += Math.floor(defender.maxHP() / 16);
    texts.push('Oceanic Veil recovery');
  }

  if (field.defenderSide.isSeeded) {
    if (!isImmuneToIndirect(defender, field)) {
      // 1/16 in gen 1, 1/8 in gen 2 onwards
      if (defender.hasAbility('Fervent Scales')) {
        damage -= Math.floor(defender.maxHP() / (![1, 10].includes(gen.num) ? 16 : 32));
      } else {
        damage -= Math.floor(defender.maxHP() / (![1, 10].includes(gen.num) ? 8 : 16));
      }
      texts.push('Leech Seed damage');
    }
  }

  if (field.attackerSide.isSeeded && !isImmuneToIndirect(attacker, field)) {
    let recovery = Math.floor(attacker.maxHP() / (![1, 10].includes(gen.num) ? 8 : 16));
    if (defender.hasItem('Big Root')) recovery = Math.trunc(recovery * 5324 / 4096);
    if (attacker.hasAbility('Liquid Ooze')) {
      if (attacker.hasAbility('Fervent Scales')) {
        damage -= recovery / 2;
      } else {
        damage -= recovery;
      }
      texts.push('Liquid Ooze damage');
    } else if (!healBlock) {
      damage += recovery;
      texts.push('Leech Seed recovery');
    }
  }

  if (field.hasTerrain('Grassy')) {
    if (isGrounded(defender, field) && !healBlock) {
      damage += Math.floor(defender.maxHP() / 16);
      texts.push('Grassy Terrain recovery');
    }
  } else if (field.hasTerrain('Psychic') && defender.hasAbility('Delusion')) {
    if (isGrounded(defender, field) && !healBlock) {
      damage += Math.floor(defender.maxHP() / 8);
      texts.push('Delusion recovery');
    }
  }

  if (defender.hasStatus('psn')) {
    if (defender.hasAbility('Poison Heal')) {
      if (!healBlock) {
        damage += Math.floor(defender.maxHP() / 8);
        texts.push('Poison Heal');
      }
    } else if (defender.hasAbility('Prototoxin')) {
      if (!healBlock) {
        damage += Math.floor(defender.maxHP() / 8);
        texts.push('Prototoxin Heal');
      }
    } else if (!isImmuneToIndirect(defender, field)) {
      if (defender.hasAbility('Fervent Scales')) {
        damage -= Math.floor(defender.maxHP() / ([1, 10].includes(gen.num) ? 32 : 16));
      } else {
        damage -= Math.floor(defender.maxHP() / ([1, 10].includes(gen.num) ? 16 : 8));
      }
      texts.push('poison damage');
    }
  } else if (defender.hasStatus('tox')) {
    if (defender.hasAbility('Poison Heal')) {
      if (!healBlock) {
        damage += Math.floor(defender.maxHP() / 8);
        texts.push('Poison Heal');
      }
    } else if (defender.hasAbility('Prototoxin')) {
      if (!healBlock) {
        damage += Math.floor(defender.maxHP() / 8);
        texts.push('Prototoxin Heal');
      }
    } else if (!isImmuneToIndirect(defender, field)) {
      texts.push('toxic damage');
    }
  } else if (defender.hasStatus('brn')) {
    if (defender.hasAbility('Heatproof') || defender.hasAbility('Fervent Scales')) {
      damage -= Math.floor(defender.maxHP() / (![2, 3, 4, 5, 6, 11].includes(gen.num) ? 32 : 16));
      texts.push('reduced burn damage');
    } else if (!defender.hasAbility('Black Flame') && isImmuneToIndirect(defender, field)) {
      damage -= Math.floor(defender.maxHP() / (![2, 3, 4, 5, 6, 11].includes(gen.num) ? 16 : 8));
      texts.push('burn damage');
    }
  } else if (defender.hasStatus('dgb')) {
    if (!defender.hasType('Fairy') && !defender.hasAbility('Black Flame') &&
      !isImmuneToIndirect(defender, field)) {
      if (defender.hasAbility('Fervent Scales')) {
        damage -= Math.floor(defender.maxHP() / 32);
      } else {
        damage -= Math.floor(defender.maxHP() / 16);
      }
      texts.push('dragonblight damage');
    }
  } else if (defender.hasStatus('frb')) {
    if (!isImmuneToIndirect(defender, field)) {
      if (defender.hasAbility('Fervent Scales')) {
        damage -= Math.floor(defender.maxHP() / 32);
      } else {
        damage -= Math.floor(defender.maxHP() / 16);
      }
      texts.push('frostbite damage');
    }
  } else if (defender.hasStatus('frz') && [11].includes(gen.num)) {
    if (!isImmuneToIndirect(defender, field)) {
      if (field.hasWeather('Snow')) {
        damage -= Math.floor(defender.maxHP() / 8);
      } else {
        damage -= Math.floor(defender.maxHP() / 16);
      }
      texts.push('freeze damage');
    }
  } else if (
    (defender.hasStatus('slp') || defender.hasAbility('Comatose')) &&
    attacker.hasAbility('Bad Dreams') &&
    !isImmuneToIndirect(defender, field)
  ) {
    if (defender.hasAbility('Fervent Scales')) {
      damage -= Math.floor(defender.maxHP() / 16);
    } else {
      damage -= Math.floor(defender.maxHP() / 8);
    }
    texts.push('Bad Dreams');
  } else if (defender.hasStatus('par') && attacker.hasAbility('Crystalblight')) {
    if (!isImmuneToIndirect(defender, field)) {
      if (defender.hasAbility('Fervent Scales')) {
        damage -= Math.floor(defender.maxHP() / 32);
      } else {
        damage -= Math.floor(defender.maxHP() / 16);
      }
      texts.push('crystalblight damage');
    }
  }

  if (!isImmuneToIndirect(defender, field) && TRAPPING.includes(move.name) &&
  ![1, 10].includes(gen.num)) {
    if (attacker.hasItem('Binding Band')) {
      if (defender.hasAbility('Fervent Scales')) {
        damage -= [2, 3, 4, 5].includes(gen.num) ? Math.floor(defender.maxHP() / 12)
          : Math.floor(defender.maxHP() / 16);
      } else {
        damage -= [2, 3, 4, 5].includes(gen.num) ? Math.floor(defender.maxHP() / 6)
          : Math.floor(defender.maxHP() / 8);
      }
      texts.push('trapping damage');
    } else {
      if (defender.hasAbility('Fervent Scales')) {
        damage -= [1, 2, 3, 10].includes(gen.num) ? Math.floor(defender.maxHP() / 16)
          : Math.floor(defender.maxHP() / 32);
      } else {
        damage -= [1, 2, 3, 10].includes(gen.num) ? Math.floor(defender.maxHP() / 8)
          : Math.floor(defender.maxHP() / 16);
      }
      texts.push('trapping damage');
    }
  }
  if (field.defenderSide.isSaltCured && !isImmuneToIndirect(defender, field)) {
    const isWaterOrSteel = defender.hasType('Water', 'Steel');
    const divisor = gen.num === 0 ? isWaterOrSteel ? 8 : 16 : isWaterOrSteel ? 4 : 8;
    if (defender.hasAbility('Fervent Scales')) {
      damage -= Math.floor(defender.maxHP() / (divisor * 2));
    } else {
      damage -= Math.floor(defender.maxHP() / divisor);
    }
    texts.push('Salt Cure');
  }
  if (!defender.hasType('Fire') && !isImmuneToIndirect(defender, field) &&
      (move.named('Fire Pledge (Grass Pledge Boosted)', 'Grass Pledge (Fire Pledge Boosted)'))) {
    if (defender.hasAbility('Fervent Scales')) {
      damage -= Math.floor(defender.maxHP() / 16);
    } else {
      damage -= Math.floor(defender.maxHP() / 8);
    }
    texts.push('Sea of Fire damage');
  }

  if (!isImmuneToIndirect(defender, field) && !defender.hasType('Grass') &&
      (field.defenderSide.vinelash || move.named('G-Max Vine Lash'))) {
    if (defender.hasAbility('Fervent Scales')) {
      damage -= Math.floor(defender.maxHP() / 12);
    } else {
      damage -= Math.floor(defender.maxHP() / 6);
    }
    texts.push('Vine Lash damage');
  }

  if (!isImmuneToIndirect(defender, field) && !defender.hasType('Fire') &&
      (field.defenderSide.wildfire || move.named('G-Max Wildfire'))) {
    if (defender.hasAbility('Fervent Scales')) {
      damage -= Math.floor(defender.maxHP() / 12);
    } else {
      damage -= Math.floor(defender.maxHP() / 6);
    }
    texts.push('Wildfire damage');
  }

  if (!isImmuneToIndirect(defender, field) && !defender.hasType('Water') &&
      (field.defenderSide.cannonade || move.named('G-Max Cannonade'))) {
    if (defender.hasAbility('Fervent Scales')) {
      damage -= Math.floor(defender.maxHP() / 12);
    } else {
      damage -= Math.floor(defender.maxHP() / 6);
    }
    texts.push('Cannonade damage');
  }

  if (!isImmuneToIndirect(defender, field) && !defender.hasType('Rock') &&
      (field.defenderSide.volcalith || move.named('G-Max Volcalith'))) {
    if (defender.hasAbility('Fervent Scales')) {
      damage -= Math.floor(defender.maxHP() / 12);
    } else {
      damage -= Math.floor(defender.maxHP() / 6);
    }
    texts.push('Volcalith damage');
  }

  return {damage, texts};
}

function computeKOChance(
  damage: number[],
  hp: number,
  eot: number,
  hits: number,
  timesUsed: number,
  maxHP: number,
  toxicCounter: number
) {
  let toxicDamage = 0;
  if (toxicCounter > 0) {
    toxicDamage = Math.floor((toxicCounter * maxHP) / 16);
    toxicCounter++;
  }
  const n = damage.length;
  if (hits === 1) {
    // ignore end of turn healing for the hit that KOs
    // so that the pokemon doesnt "revive" from being KO'd
    // since recovery happens before toxic damage (and therefore always reduces toxic damage),
    // if the net healing is greater than zero, toxicDamage should also be set to zero.
    if (eot - toxicDamage > 0) {
      eot = 0;
      toxicDamage = 0;
    }
    for (let i = 0; i < n; i++) {
      if (damage[n - 1] - eot + toxicDamage < hp) return 0;
      if (damage[i] - eot + toxicDamage >= hp) {
        return (n - i) / n;
      }
    }
  }

  let sum = 0;
  let lastc = 0;
  for (let i = 0; i < n; i++) {
    let c;
    if (i === 0 || damage[i] !== damage[i - 1]) {
      c = computeKOChance(
        damage,
        hp - damage[i] + eot - toxicDamage,
        eot,
        hits - 1,
        timesUsed,
        maxHP,
        toxicCounter
      );
    } else {
      c = lastc;
    }
    if (c === 1) {
      sum += n - i;
      break;
    } else {
      sum += c;
    }
    lastc = c;
  }
  return sum / n;
}

function predictTotal(
  damage: number,
  eot: number,
  hits: number,
  timesUsed: number,
  toxicCounter: number,
  maxHP: number
) {
  let toxicDamage = 0;
  // hits - 1 is used in this for loop, as well as in the total = ...  calcs later
  // the last turn of eot damage is calculated separately
  // since if the damage is less than 0 (healing)
  // we want to exclude that from the calculations
  // since on the last turn the pokemon has been ko'd by the attack
  // and should not be able to heal after fainting
  let lastTurnEot = eot;
  if (toxicCounter > 0) {
    for (let i = 0; i < hits - 1; i++) {
      toxicDamage += Math.floor(((toxicCounter + i) * maxHP) / 16);
    }
    lastTurnEot -= Math.floor(((toxicCounter + (hits - 1)) * maxHP) / 16);
  }
  let total = 0;
  if (hits > 1 && timesUsed === 1) {
    total = damage * hits - eot * (hits - 1) + toxicDamage;
  } else {
    total = damage - eot * (hits - 1) + toxicDamage;
  }
  // if the net eot health gain is negative for the last turn, include it in the total
  if (lastTurnEot < 0) total -= lastTurnEot;
  return total;
}

function squashMultihit(gen: Generation, d: number[], hits: number, err = true) {
  if (d.length === 1) {
    return [d[0] * hits];
  } else if ([1, 10].includes(gen.num)) {
    const r = [];
    for (let i = 0; i < d.length; i++) {
      r[i] = d[i] * hits;
    }
    return r;
  } else if (d.length === 16) {
    switch (hits) {
    case 2:
      return [
        2 * d[0], d[2] + d[3], d[4] + d[4], d[4] + d[5], d[5] + d[6], d[6] + d[6],
        d[6] + d[7], d[7] + d[7], d[8] + d[8], d[8] + d[9], d[9] + d[9], d[9] + d[10],
        d[10] + d[11], d[11] + d[11], d[12] + d[13], 2 * d[15],
      ];
    case 3:
      return [
        3 * d[0], d[3] + d[3] + d[4], d[4] + d[4] + d[5], d[5] + d[5] + d[6],
        d[5] + d[6] + d[6], d[6] + d[6] + d[7], d[6] + d[7] + d[7], d[7] + d[7] + d[8],
        d[7] + d[8] + d[8], d[8] + d[8] + d[9], d[8] + d[9] + d[9], d[9] + d[9] + d[10],
        d[9] + d[10] + d[10], d[10] + d[11] + d[11], d[11] + d[12] + d[12], 3 * d[15],
      ];
    case 4:
      return [
        4 * d[0], 4 * d[4], d[4] + d[5] + d[5] + d[5], d[5] + d[5] + d[6] + d[6],
        4 * d[6], d[6] + d[6] + d[7] + d[7], 4 * d[7], d[7] + d[7] + d[7] + d[8],
        d[7] + d[8] + d[8] + d[8], 4 * d[8], d[8] + d[8] + d[9] + d[9], 4 * d[9],
        d[9] + d[9] + d[10] + d[10], d[10] + d[10] + d[10] + d[11], 4 * d[11], 4 * d[15],
      ];
    case 5:
      return [
        5 * d[0], d[4] + d[4] + d[4] + d[5] + d[5], d[5] + d[5] + d[5] + d[5] + d[6],
        d[5] + d[6] + d[6] + d[6] + d[6], d[6] + d[6] + d[6] + d[6] + d[7],
        d[6] + d[6] + d[7] + d[7] + d[7], 5 * d[7], d[7] + d[7] + d[7] + d[8] + d[8],
        d[7] + d[7] + d[8] + d[8] + d[8], 5 * d[8], d[8] + d[8] + d[8] + d[9] + d[9],
        d[8] + d[9] + d[9] + d[9] + d[9], d[9] + d[9] + d[9] + d[9] + d[10],
        d[9] + d[10] + d[10] + d[10] + d[10], d[10] + d[10] + d[11] + d[11] + d[11], 5 * d[15],
      ];
    case 10:
      return [
        10 * d[0], 10 * d[4], 3 * d[4] + 7 * d[5], 5 * d[5] + 5 * d[6], 10 * d[6],
        5 * d[6] + 5 * d[7], 10 * d[7], 7 * d[7] + 3 * d[8], 3 * d[7] + 7 * d[8], 10 * d[8],
        5 * d[8] + 5 * d[9], 4 * d[9], 5 * d[9] + 5 * d[10], 7 * d[10] + 3 * d[11], 10 * d[11],
        10 * d[15],
      ];
    default:
      error(err, `Unexpected # of hits: ${hits}`);
      return d;
    }
  } else if (d.length === 39) {
    switch (hits) {
    case 2:
      return [
        2 * d[0], 2 * d[7], 2 * d[10], 2 * d[12], 2 * d[14], d[15] + d[16],
        2 * d[17], d[18] + d[19], d[19] + d[20], 2 * d[21], d[22] + d[23],
        2 * d[24], 2 * d[26], 2 * d[28], 2 * d[31], 2 * d[38],
      ];
    case 3:
      return [
        3 * d[0], 3 * d[9], 3 * d[12], 3 * d[13], 3 * d[15], 3 * d[16],
        3 * d[17], 3 * d[18], 3 * d[20], 3 * d[21], 3 * d[22], 3 * d[23],
        3 * d[25], 3 * d[26], 3 * d[29], 3 * d[38],
      ];
    case 4:
      return [
        4 * d[0], 2 * d[10] + 2 * d[11], 4 * d[13], 4 * d[14], 2 * d[15] + 2 * d[16],
        2 * d[16] + 2 * d[17], 2 * d[17] + 2 * d[18], 2 * d[18] + 2 * d[19],
        2 * d[19] + 2 * d[20], 2 * d[20] + 2 * d[21], 2 * d[21] + 2 * d[22],
        2 * d[22] + 2 * d[23], 4 * d[24], 4 * d[25], 2 * d[27] + 2 * d[28], 4 * d[38],
      ];
    case 5:
      return [
        5 * d[0], 5 * d[11], 5 * d[13], 5 * d[15], 5 * d[16], 5 * d[17],
        5 * d[18], 5 * d[19], 5 * d[19], 5 * d[20], 5 * d[21], 5 * d[22],
        5 * d[23], 5 * d[25], 5 * d[27], 5 * d[38],
      ];
    case 10:
      return [
        10 * d[0], 10 * d[11], 10 * d[13], 10 * d[15], 10 * d[16], 10 * d[17],
        10 * d[18], 10 * d[19], 10 * d[19], 10 * d[20], 10 * d[21], 10 * d[22],
        10 * d[23], 10 * d[25], 10 * d[27], 10 * d[38],
      ];
    default:
      error(err, `Unexpected # of hits: ${hits}`);
      return d;
    }
  } else if (d.length === 256) {
    if (hits > 1) {
      error(err, `Unexpected # of hits for Parental Bond: ${hits}`);
    }
    // FIXME: Come up with a better Parental Bond approximation
    const r: number[] = [];
    for (let i = 0; i < 16; i++) {
      let val = 0;
      for (let j = 0; j < 16; j++) {
        val += d[i + j];
      }
      r[i] = Math.round(val / 16);
    }
    return r;
  } else {
    error(err, `Unexpected # of possible damage values: ${d.length}`);
    return d;
  }
}

function buildDescription(description: RawDesc, attacker: Pokemon, defender: Pokemon) {
  const [attackerLevel, defenderLevel] = getDescriptionLevels(attacker, defender);
  if (description.isCuddle) {
    return description.attackerName + ' cuddles ' + description.defenderName +
      ' :D -- possibly the best move ever';
  } else if (description.isHoldHands) {
    return description.attackerName + ' holds ' + description.defenderName + "'s hand" +
      ' :D -- possibly the best move ever';
  } else if (description.isKitchenSink) {
    return description.attackerName + ' explodes.';
  }
  let output = '';
  if (description.attackBoost) {
    if (description.attackBoost > 0) {
      output += '+';
    }
    output += description.attackBoost + ' ';
  }
  output = appendIfSet(output, attackerLevel);
  output = appendIfSet(output, description.attackEVs);
  output = appendIfSet(output, description.attackerItem);
  if (description.isDragonCharged) {
    output += 'dragon charged ';
  }
  if (description.isCharged) {
    output += 'charged ';
  }
  output = appendIfSet(output, description.attackerAbility);
  output = appendIfSet(output, description.rivalry);
  if (description.isBurned) {
    output += 'burned ';
  }
  if (description.isFrostbitten) {
    output += 'frostbitten ';
  }
  if (description.isBaseballed) {
    output += 'baseballed ';
  }
  if (description.pp) {
    output += ` ${description.pp === -1 ? 0 : description.pp} PP `;
  }
  if (description.alliesFainted) {
    output += Math.min(5, description.alliesFainted) +
      ` ${description.alliesFainted === 1 ? 'ally' : 'allies'} fainted `;
  }
  if (description.foesFainted) {
    output += Math.min(5, description.foesFainted) +
      ` ${description.foesFainted === 1 ? 'foe' : 'foes'} fainted `;
  }
  if (description.numTrumps) {
    output += ` ${description.numTrumps === -1 ? 0 : description.numTrumps} trump cards `;
  }
  if (description.foeBoosts) {
    output += description.foeBoosts + ` foe ${description.foeBoosts === 1 ? 'boost' : 'boosts'} `;
  }
  if (description.isAttackerSigma) {
    output += 'Sigma ';
  }
  if (description.attackerTera) {
    output += `Tera ${description.attackerTera} `;
  }

  if (description.isStellarFirstUse) {
    output += '(First Use) ';
  }

  if (description.isBeadsOfRuin) {
    output += 'Beads of Ruin ';
  }
  if (description.isSwordOfRuin) {
    output += 'Sword of Ruin ';
  }

  if (description.isPoultryOfRuin) {
    output += 'Poultry of Ruin ';
  }
  if (description.isDogOfRuin) {
    output += 'Dog of Ruin ';
  }

  if (description.isAttackerBig) {
    output += 'Big ';
  }

  output += description.attackerName + ' ';
  if (description.isHelpingHand) {
    output += 'Helping Hand ';
  }
  if (description.isFlowerGiftAttacker) {
    output += 'with an ally\'s Flower Gift ';
  }
  if (description.isPowerTrickAttacker) {
    output += 'with Power Trick ';
  }
  if (description.isSteelySpiritAttacker) {
    output += 'with an ally\'s Steely Spirit ';
  }
  if (description.isBattery) {
    output += 'Battery boosted ';
  }
  if (description.isPowerSpot) {
    output += 'Power Spot boosted ';
  }
  if (description.isSwitching) {
    output += 'switching boosted ';
  }
  output += description.moveName + ' ';
  if (description.moveBP && description.moveType) {
    output += '(' + description.moveBP + ' BP ' + description.moveType + ') ';
  } else if (description.moveBP) {
    output += '(' + description.moveBP + ' BP) ';
  } else if (description.moveType) {
    output += '(' + description.moveType + ') ';
  }
  if (description.hits) {
    output += '(' + description.hits + ' hits) ';
  }
  output = appendIfSet(output, description.moveTurns);
  output += 'vs. ';
  if (description.defenseBoost) {
    if (description.defenseBoost > 0) {
      output += '+';
    }
    output += description.defenseBoost + ' ';
  }
  output = appendIfSet(output, defenderLevel);
  output = appendIfSet(output, description.HPEVs);
  if (description.defenseEVs) {
    output += '/ ' + description.defenseEVs + ' ';
  }
  output = appendIfSet(output, description.defenderItem);
  output = appendIfSet(output, description.defenderAbility);
  if (description.isBestWishesFrozen) {
    output += 'Frozen ';
  }
  if (description.isTabletsOfRuin) {
    output += 'Tablets of Ruin ';
  }
  if (description.isVesselOfRuin) {
    output += 'Vessel of Ruin ';
  }
  if (description.isLoveOfRuin) {
    output += 'Love of Ruin ';
  }
  if (description.isAutomatonOfRuin) {
    output += 'Automaton of Ruin ';
  }
  if (description.isBlottedOut) {
    output += 'Blotted Out ';
  }
  if (description.isProtected) {
    output += 'protected ';
  }
  if (description.isDefenderDynamaxed === 'gmax') {
    output += 'Gigantamax ';
  } else if (description.isDefenderDynamaxed) {
    output += 'Dynamax ';
  }
  if (description.isDrowsy) {
    output += 'drowsy ';
  }
  if (description.isDefenderSigma) {
    output += 'Sigma ';
  }
  if (description.isSerious) {
    output += 'Serious ';
  }
  if (description.defenderTera) {
    output += `Tera ${description.defenderTera} `;
  }
  if (description.isDefenderBig) {
    output += 'Big ';
  }
  output += description.defenderName;
  if (description.weather && description.terrain) {
    output += ' in ' + description.weather + ' and ' + description.terrain + ' Terrain';
  } else if (description.weather) {
    if (description.weather === 'Grave') {
      output += ' in ' + 'a Graveyard';
    } else if (description.weather === 'Acid') {
      output += ' in ' + 'Acid Rain';
    } else {
      output += ' in ' + description.weather;
    }
  } else if (description.terrain) {
    output += ' in ' + description.terrain + ' Terrain';
  }
  if (description.isReflect) {
    output += ' through Reflect';
  } else if (description.isLightScreen) {
    output += ' through Light Screen';
  }
  if (description.isFlowerGiftDefender) {
    output += ' with an ally\'s Flower Gift';
  }
  if (description.isPowerTrickDefender) {
    output += ' with Power Trick';
  }
  if (description.isFriendGuard) {
    output += ' with an ally\'s Friend Guard';
  }
  if (description.isDefenseDown) {
    output += ' with Defenses Down';
  }
  if (description.isAuroraVeil) {
    output += ' with an ally\'s Aurora Veil';
  }
  if (description.isCritical) {
    output += ' on a critical hit';
  }
  if (description.isWonderRoom) {
    output += ' in Wonder Room';
  }
  return output;
}

function getDescriptionLevels(attacker: Pokemon, defender: Pokemon) {
  if (attacker.level !== defender.level) {
    return [
      attacker.level === 100 ? '' : `Lvl ${attacker.level}`,
      defender.level === 100 ? '' : `Lvl ${defender.level}`,
    ];
  }
  // There's an argument for showing any level thats not 100, but VGC and LC players
  // probably would rather not see level cruft in their calcs
  const elide = [100, 50, 5].includes(attacker.level);
  const level = elide ? '' : `Lvl ${attacker.level}`;
  return [level, level];
}

function serializeText(arr: string[]) {
  if (arr.length === 0) {
    return '';
  } else if (arr.length === 1) {
    return arr[0];
  } else if (arr.length === 2) {
    return arr[0] + ' and ' + arr[1];
  } else {
    let text = '';
    for (let i = 0; i < arr.length - 1; i++) {
      text += arr[i] + ', ';
    }
    return text + 'and ' + arr[arr.length - 1];
  }
}

function appendIfSet(str: string, toAppend?: string) {
  return toAppend ? `${str}${toAppend} ` : str;
}

function toDisplay(notation: string, a: number, b: number, f = 1) {
  return notation === '%' ? Math.floor((a * (1000 / f)) / b) / 10 : Math.floor((a * (48 / f)) / b);
}
