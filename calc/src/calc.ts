import {Field} from './field';
import type {Generation} from './data/interface';
import type {Move} from './move';
import type {Pokemon} from './pokemon';
import type {Result} from './result';

import {calculateRBYGSC} from './mechanics/gen12';
import {calculateADV} from './mechanics/gen3';
import {calculateDPP} from './mechanics/gen4';
import {calculateBWXY} from './mechanics/gen56';
import {calculateSMSSSV} from './mechanics/gen789';
import {calculateTS} from './mechanics/tiersovereign';
import {calculatePM} from './mechanics/paleomons';
import {calculateMH} from './mechanics/monsterhunter';
import {calculateTH} from './mechanics/touhoumons';
import {calculateBWFYB} from './mechanics/bestwishes';

const MECHANICS = [
  () => {},
  calculateRBYGSC,
  calculateRBYGSC,
  calculateADV,
  calculateDPP,
  calculateBWXY,
  calculateBWXY,
  calculateSMSSSV,
  calculateSMSSSV,
  calculateSMSSSV,
  calculateRBYGSC, // Jumpstarted
  calculateBWFYB, // Best Wishes
  calculateTH, // Touhoumons
  calculateMH, // Monster Hunter
  calculateSMSSSV, // Six by Six
  calculateTS, // Tier Sovereign
  calculatePM, // Paleomons
  calculateSMSSSV, // DNU
  calculateSMSSSV, // BC A
  calculateSMSSSV, // BC C
];

export function calculate(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field?: Field,
) {
  return MECHANICS[gen.num](
    gen,
    attacker.clone(),
    defender.clone(),
    move.clone(),
    field ? field.clone() : new Field()
  ) as Result;
}
