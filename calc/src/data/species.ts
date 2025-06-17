import type * as I from './interface';
import {type DeepPartial, toID, extend, assignWithout} from '../util';

export interface SpeciesData {
  readonly types: [I.TypeName] | [I.TypeName, I.TypeName];
  // TODO: replace with baseStats
  readonly bs: {
    hp: number;
    at: number;
    df: number;
    sa?: number;
    sd?: number;
    sp: number;
    sl?: number;
  };
  readonly weightkg: number; // weight
  readonly nfe?: boolean;
  readonly gender?: I.GenderName;
  readonly otherFormes?: string[];
  readonly baseSpecies?: string;
  readonly abilities?: {0: string}; // ability
}

const RBY: {[name: string]: SpeciesData} = {};
const GSC_PATCH: {[name: string]: DeepPartial<SpeciesData>} = {};
const GSC: {[name: string]: SpeciesData} = extend(true, {}, RBY, GSC_PATCH);
const ADV_PATCH: {[name: string]: DeepPartial<SpeciesData>} = {};
const ADV: {[name: string]: SpeciesData} = extend(true, {}, GSC, ADV_PATCH);
const DPP_PATCH: {[name: string]: DeepPartial<SpeciesData>} = {};
const DPP: {[name: string]: SpeciesData} = extend(true, {}, ADV, DPP_PATCH);
const BW_PATCH: {[name: string]: DeepPartial<SpeciesData>} = {};
const BW: {[name: string]: SpeciesData} = extend(true, {}, DPP, BW_PATCH);
const XY_PATCH: {[name: string]: DeepPartial<SpeciesData>} = {};
const XY: {[name: string]: SpeciesData} = extend(true, {}, BW, XY_PATCH);
const SM_PATCH: {[name: string]: DeepPartial<SpeciesData>} = {};
const SM: {[name: string]: SpeciesData} = extend(true, {}, XY, SM_PATCH);
const SS_PATCH: {[name: string]: DeepPartial<SpeciesData>} = {};
const SS: {[name: string]: SpeciesData} = extend(true, {}, SM, SS_PATCH);
const PLA_PATCH: {[name: string]: DeepPartial<SpeciesData>} = {};
const SV_PATCH: {[name: string]: DeepPartial<SpeciesData>} = {
  Arachnode: {
    types: ['Electric'],
    bs: {hp: 105, at: 30, df: 75, sa: 85, sd: 100, sp: 60},
    weightkg: 61.5,
    abilities: {0: 'Clear Body'},
  },
  Arsenstorm: {
    types: ['Poison', 'Ground'],
    bs: {hp: 110, at: 50, df: 65, sa: 80, sd: 90, sp: 55},
    weightkg: 15,
    abilities: {0: 'Neutralizing Gas'}
  },
  Badjur: {
    types: ['Normal'],
    bs: {hp: 100, at: 100, df: 75, sa: 60, sd: 75, sp: 80},
    weightkg: 16,
    abilities: {0: 'Poison Heal'}
  },
  Blobbiam: {
    types: ['Water', 'Fairy'],
    bs: {hp: 110, at: 100, df: 110, sa: 20, sd: 80, sp: 75},
    weightkg: 12,
    abilities: {0: 'Volt Absorb'}
  },
  Brasspecter: {
    types: ['Steel', 'Ghost'],
    bs: {hp: 100, at: 90, df: 100, sa: 40, sd: 95, sp: 35},
    weightkg: 40,
    abilities: {0: 'Tough Claws'}
  },
  Bugswarm: {
    types: ['Fire', 'Bug'],
    bs: {hp: 100, at: 85, df: 70, sa: 70, sd: 70, sp: 60},
    weightkg: 420,
    abilities: {0: 'Triage'}
  },
  Bulionage: {
    types: ['Dark', 'Water'],
    bs: {hp: 95, at: 100, df: 85, sa: 40, sd: 120, sp: 50},
    weightkg: 300,
    abilities: {0: 'Strong Jaw'}
  },
  Capricorrie: {
    types: ['Ice', 'Ground'],
    bs: {hp: 100, at: 110, df: 80, sa: 50, sd: 70, sp: 90},
    weightkg: 146,
    abilities: {0: 'Snow Warning'}
  },
  Copperhead: {
    types: ['Ground', 'Steel'],
    bs: {hp: 95, at: 80, df: 120, sa: 50, sd: 90, sp: 50},
    weightkg: 101.9,
    abilities: {0: "Water Absorb"}
  },
  Craggon: {
    types: ['Dragon', 'Ground'],
    bs: {hp: 120, at: 81, df: 81, sa: 82, sd: 81, sp: 100},
    weightkg: 404,
    abilities: {0: 'Natural Cure'}
  },
  Crystuit: {
    types: ['Rock', 'Electric'],
    bs: {hp: 70, at: 50, df: 80, sa: 105, sd: 70, sp: 110},
    weightkg: 420.6,
    abilities: {0: 'Sturdy'}
  },
  Drakkanon: {
    types: ['Fighting', 'Dragon'],
    bs: {hp: 80, at: 50, df: 75, sa: 100, sd: 85, sp: 93},
    weightkg: 59,
    abilities: {0: 'Mega Launcher'}
  },
  Eolikopter: {
    types: ['Flying', 'Electric'],
    bs: {hp: 90, at: 50, df: 80, sa: 100, sd: 70, sp: 110},
    weightkg: 400,
    abilities: {0: 'Cloud Nine'}
  },
  Faeruin: {
    types: ['Ghost', 'Fairy'],
    bs: {hp: 90, at: 96, df: 70, sa: 50, sd: 80, sp: 93},
    weightkg: 33,
    abilities: {0: 'Prankster'}
  },
  Fettogre: {
    types: ['Ghost', 'Fighting'],
    bs: {hp: 70, at: 45, df: 140, sa: 45, sd: 80, sp: 55},
    weightkg: 200,
    abilities: {0: 'Immunity'}
  },
  Florustitia: {
    types: ['Grass', 'Fighting'],
    bs: {hp: 70, at: 85, df: 60, sa: 40, sd: 95, sp: 100},
    weightkg: 110,
    abilities: {0: 'Sharpness'}
  },
  Freightmare: {
    types: ['Ghost', 'Steel'],
    bs: {hp: 100, at: 40, df: 80, sa: 100, sd: 85, sp: 74},
    weightkg: 720,
    abilities: {0: 'Sand Rush'}
  },
  Frostengu: {
    types: ['Fighting', 'Ice'],
    bs: {hp: 50, at: 110, df: 50, sa: 100, sd: 50, sp: 87},
    weightkg: 68,
    abilities: {0: 'No Guard'}
  },
  Goblantern: {
    types: ['Fire', 'Grass'],
    bs: {hp: 90, at: 40, df: 80, sa: 100, sd: 80, sp: 77},
    weightkg: 3,
    abilities: {0: 'Prankster'}
  },
  Hippaint: {
    types: ['Water', 'Ground'],
    bs: {hp: 70, at: 40, df: 70, sa: 105, sd: 85, sp: 80},
    weightkg: 90,
    abilities: {0: 'Pastel Veil'}
  },
  'Jack-o-swarm': {
    types: ['Steel', 'Flying'],
    bs: {hp: 90, at: 50, df: 95, sa: 70, sd: 90, sp: 70},
    weightkg: 74.8,
    abilities: {0: 'Pickpocket'}
  },
  Jokerpent: {
    types: ['Dragon', 'Poison'],
    bs: {hp: 110, at: 70, df: 100, sa: 30, sd: 95, sp: 20},
    weightkg: 67,
    abilities: {0: 'Unaware'}
  },
  Kadraoke: {
    types: ['Psychic', 'Dragon'],
    bs: {hp: 90, at: 30, df: 80, sa: 85, sd: 100, sp: 85},
    weightkg: 19.7,
    abilities: {0: 'Punk Rock'}
  },
  Karmalice: {
    types: ['Ice', 'Electric'],
    bs: {hp: 70, at: 55, df: 40, sa: 105, sd: 55, sp: 111},
    weightkg: 690,
    abilities: {0: 'Refrigerate'}
  },
  Lavalisk: {
    types: ['Poison', 'Fire'],
    bs: {hp: 100, at: 105, df: 80, sa: 40, sd: 80, sp: 65},
    weightkg: 150,
    abilities: {0: 'Mold Breaker'}
  },
  Llanfairwyrm: {
    types: ['Dragon'],
    bs: {hp: 85, at: 120, df: 90, sa: 55, sd: 90, sp: 70},
    weightkg: 600,
    abilities: {0: 'Rough Skin'}
  },
  Martorse: {
    types: ['Ground', 'Fire'],
    bs: {hp: 75, at: 90, df: 70, sa: 35, sd: 90, sp: 105},
    weightkg: 173,
    abilities: {0: 'Trace'}
  },
  Massassin: {
    types: ['Fighting', 'Dark'],
    bs: {hp: 100, at: 100, df: 80, sa: 50, sd: 80, sp: 15},
    weightkg: 888,
    abilities: {0: 'Quark Drive'}
  },
  Mohawtter: {
    types: ['Water', 'Grass'],
    bs: {hp: 85, at: 50, df: 70, sa: 70, sd: 110, sp: 55},
    weightkg: 32,
    abilities: {0: 'Tablets of Ruin'}
  },
  'Mon Mothra': {
    types: ['Fairy', 'Bug'],
    bs: {hp: 80, at: 50, df: 70, sa: 100, sd: 70, sp: 90},
    weightkg: 50,
    abilities: {0: 'Fluffy'}
  },
  Parasike: {
    types: ['Psychic', 'Bug'],
    bs: {hp: 50, at: 85, df: 75, sa: 50, sd: 55, sp: 109},
    weightkg: 0.8,
    abilities: {0: 'Strong Jaw'}
  },
  Pinaturbo: {
    types: ['Fire'],
    bs: {hp: 70, at: 70, df: 60, sa: 100, sd: 95, sp: 115},
    weightkg: 126,
    abilities: {0: 'Mold Breaker'}
  },
  Piss: {
    types: ['Normal'],
    bs: {hp: 70, at: 95, df: 60, sa: 50, sd: 60, sp: 95},
    weightkg: 382,
    abilities: {0: 'Magic Guard'}
  },
  Primordialith: {
    types: ['Rock'],
    bs: {hp: 100, at: 100, df: 100, sa: 35, sd: 90, sp: 30},
    weightkg: 90,
    abilities: {0: 'Sand Stream'}
  },
  Reversadusa: {
    types: ['Psychic', 'Dark'],
    bs: {hp: 70, at: 50, df: 70, sa: 70, sd: 70, sp: 110},
    weightkg: 55.2,
    abilities: {0: 'Contrary'}
  },
  Sculptera: {
    types: ['Rock', 'Dragon'],
    bs: {hp: 100, at: 105, df: 70, sa: 40, sd: 85, sp: 85},
    weightkg: 729,
    abilities: {0: 'Skill Link'}
  },
  Searytch: {
    types: ['Fairy', 'Fire'],
    bs: {hp: 85, at: 30, df: 75, sa: 90, sd: 100, sp: 50},
    weightkg: 52,
    abilities: {0: 'Stamina'}
  },
  'Sleet Shell': {
    types: ['Ice', 'Steel'],
    bs: {hp: 83, at: 95, df: 107, sa: 47, sd: 71, sp: 103},
    weightkg: 674.5,
    abilities: {0: 'Protosynthesis'}
  },
  Snabterra: {
    types: ['Bug', 'Ground'],
    bs: {hp: 85, at: 100, df: 85, sa: 40, sd: 80, sp: 85},
    weightkg: 600,
    abilities: {0: 'Compound Eyes'}
  },
  "Socknbusk'n": {
    types: ['Normal', 'Fighting'],
    bs: {hp: 95, at: 95, df: 75, sa: 40, sd: 70, sp: 110},
    weightkg: 65,
    abilities: {0: 'Scrappy'}
  },
  Thaumaton: {
    types: ['Poison', 'Steel'],
    bs: {hp: 95, at: 70, df: 70, sa: 100, sd: 100, sp: 75},
    weightkg: 666,
    abilities: {0: 'Unburden'}
  },
  Versalyre: {
    types: ['Flying'],
    bs: {hp: 70, at: 110, df: 65, sa: 30, sd: 70, sp: 90},
    weightkg: 2,
    abilities: {0: 'Protean'}
  },
  Vipult: {
    types: ['Poison', 'Dark'],
    bs: {hp: 100, at: 65, df: 70, sa: 100, sd: 100, sp: 70},
    weightkg: 23,
    abilities: {0: 'Intimidate'}
  },
  Wizhazard: {
    types: ['Psychic', 'Steel'],
    bs: {hp: 90, at: 40, df: 90, sa: 100, sd: 70, sp: 60},
    weightkg: 69,
    abilities: {0: 'Magic Bounce'}
  },
  Yamateraph: {
    types: ['Normal', 'Fairy'],
    bs: {hp: 90, at: 110, df: 80, sa: 15, sd: 80, sp: 105},
    weightkg: 255,
    abilities: {0: 'Psychic Surge'}
  },
};
const SV: {[name: string]: SpeciesData} = extend(true, {}, SS, SV_PATCH, PLA_PATCH);

export const SPECIES = [{}, RBY, GSC, ADV, DPP, BW, XY, SM, SS, SV];

export class Species implements I.Species {
  private readonly gen: I.GenerationNum;

  constructor(gen: I.GenerationNum) {
    this.gen = gen;
  }

  get(id: I.ID) {
    return SPECIES_BY_ID[this.gen][id];
  }

  *[Symbol.iterator]() {
    for (const id in SPECIES_BY_ID[this.gen]) {
      yield this.get(id as I.ID)!;
    }
  }
}

class Specie implements I.Specie {
  readonly kind: 'Species';
  readonly id: I.ID;
  readonly name: I.SpeciesName;
  readonly types!: [I.TypeName] | [I.TypeName, I.TypeName];
  readonly baseStats: Readonly<I.StatsTable>;
  readonly weightkg!: number; // weight
  readonly nfe?: boolean;
  readonly gender?: I.GenderName;
  readonly otherFormes?: I.SpeciesName[];
  readonly baseSpecies?: I.SpeciesName;
  readonly abilities?: {0: I.AbilityName}; // ability

  private static readonly EXCLUDE = new Set(['bs', 'otherFormes']);

  constructor(name: string, data: SpeciesData) {
    this.kind = 'Species';
    this.id = toID(name);
    this.name = name as I.SpeciesName;

    const baseStats: Partial<I.StatsTable> = {};
    baseStats.hp = data.bs.hp;
    baseStats.atk = data.bs.at;
    baseStats.def = data.bs.df;
    baseStats.spa = gen >= 2 ? data.bs.sa : data.bs.sl;
    baseStats.spd = gen >= 2 ? data.bs.sd : data.bs.sl;
    baseStats.spe = data.bs.sp;
    this.baseStats = baseStats as I.StatsTable;
    // Hack for getting Gmax pokemon out of existence in Gen 9+
    if (data.otherFormes) {
      this.otherFormes = data.otherFormes as I.SpeciesName[];
      if (gen >= 9 && !['toxtricity', 'urshifu'].includes(this.id)) {
        this.otherFormes = this.otherFormes.filter(f => !f.endsWith('-Gmax'));
        if (!this.otherFormes.length) this.otherFormes = undefined;
        if (this.otherFormes) this.otherFormes = [...new Set(this.otherFormes)];
      }
    }

    assignWithout(this, data, Specie.EXCLUDE);
  }
}
const SPECIES_BY_ID: Array<{[id: string]: Specie}> = [];

let gen = 0;
for (const species of SPECIES) {
  const map: {[id: string]: Specie} = {};
  for (const specie in species) {
    if (gen >= 2 && species[specie].bs.sl) delete species[specie].bs.sl;
    const m = new Specie(specie, species[specie]);
    map[m.id] = m;
  }
  SPECIES_BY_ID.push(map);
  gen++;
}
