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

const RBY: {[name: string]: SpeciesData} = {
  Abomasnow: {
    types: ['Grass', 'Ice'],
    bs: {hp: 90, at: 92, df: 75, sp: 60, sl: 85},
    weightkg: 135.5,
  },
  Abra: {
    types: ['Psychic'],
    bs: {hp: 25, at: 20, df: 15, sp: 90, sl: 105},
    weightkg: 19.5,
    nfe: true,
  },
  Aerodactyl: {
    types: ['Rock', 'Flying'],
    bs: {hp: 80, at: 105, df: 65, sp: 130, sl: 60},
    weightkg: 59,
  },
  Alakazam: {
    types: ['Psychic'],
    bs: {hp: 55, at: 50, df: 45, sp: 120, sl: 135},
    weightkg: 48,
  },
  Arbok: {
    types: ['Poison'],
    bs: {hp: 60, at: 85, df: 69, sp: 80, sl: 65},
    weightkg: 65
  },
  Arcanine: {
    types: ['Fire'],
    bs: {hp: 90, at: 110, df: 80, sp: 95, sl: 80},
    weightkg: 155,
  },
  Articuno: {
    types: ['Ice', 'Flying'],
    bs: {hp: 90, at: 85, df: 100, sp: 85, sl: 125},
    weightkg: 55.4,
  },
  'Articuno-Galar': {
    types: ['Psychic', 'Flying'],
    bs: {hp: 90, at: 85, df: 85, sp: 95, sl: 125},
    weightkg: 50.9,
  },
  Audino: {
    types: ['Normal'],
    bs: {hp: 103, at: 60, df: 86, sp: 50, sl: 86},
    weightkg: 31,
  },
  Beedrill: {
    types: ['Bug', 'Poison'],
    bs: {hp: 65, at: 80, df: 40, sp: 75, sl: 45},
    weightkg: 29.5,
  },
  Bellsprout: {
    types: ['Grass', 'Poison'],
    bs: {hp: 50, at: 75, df: 35, sp: 40, sl: 70},
    weightkg: 4,
    nfe: true,
  },
  Blastoise: {
    types: ['Water'],
    bs: {hp: 79, at: 83, df: 100, sp: 78, sl: 85},
    weightkg: 85.5,
  },
  Bulbasaur: {
    types: ['Grass', 'Poison'],
    bs: {hp: 45, at: 49, df: 49, sp: 45, sl: 65},
    weightkg: 6.9,
    nfe: true,
  },
  Butterfree: {
    types: ['Bug', 'Flying'],
    bs: {hp: 60, at: 45, df: 50, sp: 70, sl: 80},
    weightkg: 32,
  },
  Caterpie: {
    types: ['Bug'],
    bs: {hp: 45, at: 30, df: 35, sp: 45, sl: 20},
    weightkg: 2.9,
    nfe: true,
  },
  Chansey: {
    types: ['Normal'],
    bs: {hp: 250, at: 5, df: 5, sp: 50, sl: 105},
    weightkg: 34.6,
  },
  Charizard: {
    types: ['Fire', 'Flying'],
    bs: {hp: 78, at: 84, df: 78, sp: 100, sl: 85},
    weightkg: 90.5,
  },
  Charmander: {
    types: ['Fire'],
    bs: {hp: 39, at: 52, df: 43, sp: 65, sl: 50},
    weightkg: 8.5,
    nfe: true,
  },
  Charmeleon: {
    types: ['Fire'],
    bs: {hp: 58, at: 64, df: 58, sp: 80, sl: 65},
    weightkg: 19,
    nfe: true,
  },
  Clefable: {
    types: ['Normal'],
    bs: {hp: 95, at: 70, df: 73, sp: 60, sl: 85},
    weightkg: 40
  },
  Clefairy: {
    types: ['Normal'],
    bs: {hp: 70, at: 45, df: 48, sp: 35, sl: 60},
    weightkg: 7.5,
    nfe: true,
  },
  Cloyster: {
    types: ['Water', 'Ice'],
    bs: {hp: 50, at: 95, df: 180, sp: 70, sl: 85},
    weightkg: 132.5,
  },
  Cubone: {
    types: ['Ground'],
    bs: {hp: 50, at: 50, df: 95, sp: 35, sl: 40},
    weightkg: 6.5,
    nfe: true,
  },
  Dewgong: {
    types: ['Water', 'Ice'],
    bs: {hp: 90, at: 70, df: 80, sp: 70, sl: 95},
    weightkg: 120,
  },
  Dhelmise: {
    types: ['Ghost', 'Grass'],
    bs: {hp: 70, at: 131, df: 100, sp: 40, sl: 86},
    weightkg: 210,
  },
  Diancie: {
    types: ['Rock', 'Normal'],
    bs: {hp: 50, at: 100, df: 150, sp: 50, sl: 150},
    weightkg: 8.8,
  },
  'Diancie-Mega': {
    types: ['Rock', 'Normal'],
    bs: {hp: 50, at: 160, df: 110, sp: 110, sl: 160},
    weightkg: 27.8,
  },
  Diglett: {
    types: ['Ground'],
    bs: {hp: 10, at: 55, df: 25, sp: 95, sl: 45},
    weightkg: 0.8,
    nfe: true,
  },
  Ditto: {
    types: ['Normal'],
    bs: {hp: 48, at: 48, df: 48, sp: 48, sl: 48},
    weightkg: 4
  },
  Dodrio: {
    types: ['Normal', 'Flying'],
    bs: {hp: 60, at: 110, df: 70, sp: 100, sl: 60},
    weightkg: 85.2,
  },
  Doduo: {
    types: ['Normal', 'Flying'],
    bs: {hp: 35, at: 85, df: 45, sp: 75, sl: 35},
    weightkg: 39.2,
    nfe: true,
  },
  Dragonair: {
    types: ['Dragon'],
    bs: {hp: 61, at: 84, df: 65, sp: 70, sl: 70},
    weightkg: 16.5,
    nfe: true,
  },
  Dragonite: {
    types: ['Dragon', 'Flying'],
    bs: {hp: 91, at: 134, df: 95, sp: 80, sl: 100},
    weightkg: 210,
  },
  Dratini: {
    types: ['Dragon'],
    bs: {hp: 41, at: 64, df: 45, sp: 50, sl: 50},
    weightkg: 3.3,
    nfe: true,
  },
  Drowzee: {
    types: ['Psychic'],
    bs: {hp: 60, at: 48, df: 45, sp: 42, sl: 90},
    weightkg: 32.4,
    nfe: true,
  },
  Dugtrio: {
    types: ['Ground'],
    bs: {hp: 35, at: 80, df: 50, sp: 120, sl: 70},
    weightkg: 33.3,
  },
  Eevee: {
    types: ['Normal'],
    bs: {hp: 55, at: 55, df: 50, sp: 55, sl: 65},
    weightkg: 6.5,
    nfe: true,
  },
  Ekans: {
    types: ['Poison'],
    bs: {hp: 35, at: 60, df: 44, sp: 55, sl: 40},
    weightkg: 6.9,
    nfe: true,
  },
  Electabuzz: {
    types: ['Electric'],
    bs: {hp: 65, at: 83, df: 57, sp: 105, sl: 85},
    weightkg: 30,
    nfe: true,
  },
  Electivire: {
    types: ['Electric'],
    bs: {hp: 75, at: 123, df: 67, sp: 95, sl: 85},
    weightkg: 138.6,
  },
  Electrode: {
    types: ['Electric'],
    bs: {hp: 60, at: 50, df: 70, sp: 140, sl: 80},
    weightkg: 66.6,
  },
  Exeggcute: {
    types: ['Grass', 'Psychic'],
    bs: {hp: 60, at: 40, df: 80, sp: 40, sl: 60},
    weightkg: 2.5,
    nfe: true,
  },
  Exeggutor: {
    types: ['Grass', 'Psychic'],
    bs: {hp: 95, at: 95, df: 85, sp: 55, sl: 125},
    weightkg: 120,
  },
  'Farfetch\u2019d': {
    types: ['Normal', 'Flying'],
    bs: {hp: 52, at: 65, df: 55, sp: 60, sl: 58},
    weightkg: 15,
  },
  Fearow: {
    types: ['Normal', 'Flying'],
    bs: {hp: 65, at: 90, df: 65, sp: 100, sl: 61},
    weightkg: 38,
  },
  Flareon: {
    types: ['Fire'],
    bs: {hp: 65, at: 130, df: 60, sp: 65, sl: 110},
    weightkg: 25
  },
  Flygon: {
    types: ['Ground', 'Dragon'],
    bs: {hp: 80, at: 100, df: 80, sp: 100, sl: 80},
    weightkg: 82,
  },
  Gastly: {
    types: ['Ghost', 'Poison'],
    bs: {hp: 30, at: 35, df: 30, sp: 80, sl: 100},
    weightkg: 0.1,
    nfe: true,
  },
  Gengar: {
    types: ['Ghost', 'Poison'],
    bs: {hp: 60, at: 65, df: 60, sp: 110, sl: 130},
    weightkg: 40.5,
  },
  Geodude: {
    types: ['Rock', 'Ground'],
    bs: {hp: 40, at: 80, df: 100, sp: 20, sl: 30},
    weightkg: 20,
    nfe: true,
  },
  Gloom: {
    types: ['Grass', 'Poison'],
    bs: {hp: 60, at: 65, df: 70, sp: 40, sl: 85},
    weightkg: 8.6,
    nfe: true,
  },
  Golbat: {
    types: ['Poison', 'Flying'],
    bs: {hp: 75, at: 80, df: 70, sp: 90, sl: 75},
    weightkg: 55,
  },
  Goldeen: {
    types: ['Water'],
    bs: {hp: 45, at: 67, df: 60, sp: 63, sl: 50},
    weightkg: 15,
    nfe: true,
  },
  Golduck: {
    types: ['Water'],
    bs: {hp: 80, at: 82, df: 78, sp: 85, sl: 80},
    weightkg: 76.6
  },
  Golem: {
    types: ['Rock', 'Ground'],
    bs: {hp: 80, at: 110, df: 130, sp: 45, sl: 55},
    weightkg: 300,
  },
  Graveler: {
    types: ['Rock', 'Ground'],
    bs: {hp: 55, at: 95, df: 115, sp: 35, sl: 45},
    weightkg: 105,
    nfe: true,
  },
  Grimer: {
    types: ['Poison'],
    bs: {hp: 80, at: 80, df: 50, sp: 25, sl: 40},
    weightkg: 30,
    nfe: true,
  },
  Growlithe: {
    types: ['Fire'],
    bs: {hp: 55, at: 70, df: 45, sp: 60, sl: 50},
    weightkg: 19,
    nfe: true,
  },
  Gyarados: {
    types: ['Water', 'Flying'],
    bs: {hp: 95, at: 125, df: 79, sp: 81, sl: 100},
    weightkg: 235,
  },
  Hariyama: {
    types: ['Fighting'],
    bs: {hp: 144, at: 120, df: 60, sp: 50, sl: 40},
    weightkg: 253.8,
  },
  Haunter: {
    types: ['Ghost', 'Poison'],
    bs: {hp: 45, at: 50, df: 45, sp: 95, sl: 115},
    weightkg: 0.1,
    nfe: true,
  },
  Hitmonchan: {
    types: ['Fighting'],
    bs: {hp: 50, at: 105, df: 79, sp: 76, sl: 35},
    weightkg: 50.2,
  },
  Hitmonlee: {
    types: ['Fighting'],
    bs: {hp: 50, at: 120, df: 53, sp: 87, sl: 35},
    weightkg: 49.8,
  },
  Horsea: {
    types: ['Water'],
    bs: {hp: 30, at: 40, df: 70, sp: 60, sl: 70},
    weightkg: 8,
    nfe: true,
  },
  Hypno: {
    types: ['Psychic'],
    bs: {hp: 85, at: 73, df: 70, sp: 67, sl: 115},
    weightkg: 75.6,
  },
  Ivysaur: {
    types: ['Grass', 'Poison'],
    bs: {hp: 60, at: 62, df: 63, sp: 60, sl: 80},
    weightkg: 13,
    nfe: true,
  },
  Jigglypuff: {
    types: ['Normal'],
    bs: {hp: 115, at: 45, df: 20, sp: 20, sl: 25},
    weightkg: 5.5,
    nfe: true,
  },
  Jolteon: {
    types: ['Electric'],
    bs: {hp: 65, at: 65, df: 60, sp: 130, sl: 110},
    weightkg: 24.5,
  },
  Jynx: {
    types: ['Ice', 'Psychic'],
    bs: {hp: 65, at: 50, df: 35, sp: 95, sl: 95},
    weightkg: 40.6,
  },
  Kabuto: {
    types: ['Rock', 'Water'],
    bs: {hp: 30, at: 80, df: 90, sp: 55, sl: 45},
    weightkg: 11.5,
    nfe: true,
  },
  Kabutops: {
    types: ['Rock', 'Water'],
    bs: {hp: 60, at: 115, df: 105, sp: 80, sl: 70},
    weightkg: 40.5,
  },
  Kadabra: {
    types: ['Psychic'],
    bs: {hp: 40, at: 35, df: 30, sp: 105, sl: 120},
    weightkg: 56.5,
    nfe: true,
  },
  Kakuna: {
    types: ['Bug', 'Poison'],
    bs: {hp: 45, at: 25, df: 50, sp: 35, sl: 25},
    weightkg: 10,
    nfe: true,
  },
  Kangaskhan: {
    types: ['Normal'],
    bs: {hp: 105, at: 95, df: 80, sp: 90, sl: 40},
    weightkg: 80,
  },
  Kingler: {
    types: ['Water'],
    bs: {hp: 55, at: 130, df: 115, sp: 75, sl: 50},
    weightkg: 60
  },
  Koffing: {
    types: ['Poison'],
    bs: {hp: 40, at: 65, df: 95, sp: 35, sl: 60},
    weightkg: 1,
    nfe: true,
  },
  Krabby: {
    types: ['Water'],
    bs: {hp: 30, at: 105, df: 90, sp: 50, sl: 25},
    weightkg: 6.5,
    nfe: true,
  },
  Lapras: {
    types: ['Water', 'Ice'],
    bs: {hp: 130, at: 85, df: 80, sp: 60, sl: 95},
    weightkg: 220,
  },
  Lickitung: {
    types: ['Normal'],
    bs: {hp: 90, at: 55, df: 75, sp: 30, sl: 60},
    weightkg: 65.5,
  },
  Machamp: {
    types: ['Fighting'],
    bs: {hp: 90, at: 130, df: 80, sp: 55, sl: 65},
    weightkg: 130,
  },
  Machoke: {
    types: ['Fighting'],
    bs: {hp: 80, at: 100, df: 70, sp: 45, sl: 50},
    weightkg: 70.5,
    nfe: true,
  },
  Machop: {
    types: ['Fighting'],
    bs: {hp: 70, at: 80, df: 50, sp: 35, sl: 35},
    weightkg: 19.5,
    nfe: true,
  },
  Magikarp: {
    types: ['Water'],
    bs: {hp: 20, at: 10, df: 55, sp: 80, sl: 20},
    weightkg: 10,
    nfe: true,
  },
  Magmar: {
    types: ['Fire'],
    bs: {hp: 65, at: 95, df: 57, sp: 93, sl: 85},
    weightkg: 44.5,
    nfe: true,
  },
  Magmortar: {
    types: ['Fire'],
    bs: {hp: 75, at: 95, df: 67, sp: 83, sl: 125},
    weightkg: 68,
  },
  Magnemite: {
    types: ['Electric'],
    bs: {hp: 25, at: 35, df: 70, sp: 45, sl: 95},
    weightkg: 6,
    nfe: true,
  },
  Magneton: {
    types: ['Electric'],
    bs: {hp: 50, at: 60, df: 95, sp: 70, sl: 120},
    weightkg: 60,
  },
  Mankey: {
    types: ['Fighting'],
    bs: {hp: 40, at: 80, df: 35, sp: 70, sl: 35},
    weightkg: 28,
    nfe: true,
  },
  Marowak: {
    types: ['Ground'],
    bs: {hp: 60, at: 80, df: 110, sp: 45, sl: 50},
    weightkg: 45
  },
  Meowth: {
    types: ['Normal'],
    bs: {hp: 40, at: 45, df: 35, sp: 90, sl: 40},
    weightkg: 4.2,
    nfe: true,
  },
  Metapod: {
    types: ['Bug'],
    bs: {hp: 50, at: 20, df: 55, sp: 30, sl: 25},
    weightkg: 9.9,
    nfe: true,
  },
  Mew: {
    types: ['Psychic'],
    bs: {hp: 100, at: 100, df: 100, sp: 100, sl: 100},
    weightkg: 4,
  },
  Mewtwo: {
    types: ['Psychic'],
    bs: {hp: 106, at: 110, df: 90, sp: 130, sl: 154},
    weightkg: 122,
  },
  Moltres: {
    types: ['Fire', 'Flying'],
    bs: {hp: 90, at: 100, df: 90, sp: 90, sl: 125},
    weightkg: 60,
  },
  'Moltres-Galar': {
    types: ['Ghost', 'Flying'],
    bs: {hp: 90, at: 85, df: 90, sp: 90, sl: 125},
    weightkg: 66,
  },
  'Mr. Mime': {
    types: ['Psychic'],
    bs: {hp: 40, at: 45, df: 65, sp: 90, sl: 100},
    weightkg: 54.5,
  },
  Muk: {
    types: ['Poison'],
    bs: {hp: 105, at: 105, df: 75, sp: 50, sl: 65},
    weightkg: 30
  },
  Nidoking: {
    types: ['Poison', 'Ground'],
    bs: {hp: 81, at: 92, df: 77, sp: 85, sl: 75},
    weightkg: 62,
  },
  Nidoqueen: {
    types: ['Poison', 'Ground'],
      bs: {hp: 90, at: 82, df: 87, sp: 76, sl: 75},
    weightkg: 60,
  },
  'Nidoran-F': {
    types: ['Poison'],
    bs: {hp: 55, at: 47, df: 52, sp: 41, sl: 40},
    weightkg: 7,
    nfe: true,
  },
  'Nidoran-M': {
    types: ['Poison'],
    bs: {hp: 46, at: 57, df: 40, sp: 50, sl: 40},
    weightkg: 9,
    nfe: true,
  },
  Nidorina: {
    types: ['Poison'],
    bs: {hp: 70, at: 62, df: 67, sp: 56, sl: 55},
    weightkg: 20,
    nfe: true,
  },
  Nidorino: {
    types: ['Poison'],
    bs: {hp: 61, at: 72, df: 57, sp: 65, sl: 55},
    weightkg: 19.5,
    nfe: true,
  },
  Nihilego: {
    types: ['Rock', 'Poison'],
    bs: {hp: 109, at: 53, df: 47, sp: 103, sl: 131},
    weightkg: 55.5,
  },
  Ninetales: {
    types: ['Fire'],
    bs: {hp: 73, at: 76, df: 75, sp: 100, sl: 100},
    weightkg: 19.9,
  },
  Oddish: {
    types: ['Grass', 'Poison'],
    bs: {hp: 45, at: 50, df: 55, sp: 30, sl: 75},
    weightkg: 5.4,
    nfe: true,
  },
  Omanyte: {
    types: ['Rock', 'Water'],
    bs: {hp: 35, at: 40, df: 100, sp: 35, sl: 90},
    weightkg: 7.5,
    nfe: true,
  },
  Omastar: {
    types: ['Rock', 'Water'],
    bs: {hp: 70, at: 60, df: 125, sp: 55, sl: 115},
    weightkg: 35,
  },
  Onix: {
    types: ['Rock', 'Ground'],
    bs: {hp: 35, at: 45, df: 160, sp: 70, sl: 30},
    weightkg: 210,
  },
  Orbeetle: {
    types: ['Bug', 'Psychic'],
    bs: {hp: 60, at: 45, df: 110, sp: 90, sl: 80},
    weightkg: 40.8,
  },
  Paras: {
    types: ['Bug', 'Grass'],
    bs: {hp: 35, at: 70, df: 55, sp: 25, sl: 55},
    weightkg: 5.4,
      nfe: true,
  },
  Parasect: {
    types: ['Bug', 'Grass'],
    bs: {hp: 60, at: 95, df: 80, sp: 30, sl: 80},
    weightkg: 29.5,
  },
  Persian: {
    types: ['Normal'],
    bs: {hp: 65, at: 70, df: 60, sp: 115, sl: 65},
    weightkg: 32
  },
  Pidgeot: {
    types: ['Normal', 'Flying'],
    bs: {hp: 83, at: 80, df: 75, sp: 91, sl: 70},
    weightkg: 39.5,
  },
  Pidgeotto: {
    types: ['Normal', 'Flying'],
    bs: {hp: 63, at: 60, df: 55, sp: 71, sl: 50},
    weightkg: 30,
    nfe: true,
  },
  Pidgey: {
    types: ['Normal', 'Flying'],
    bs: {hp: 40, at: 45, df: 40, sp: 56, sl: 35},
    weightkg: 1.8,
    nfe: true,
  },
  Pikachu: {
    types: ['Electric'],
    bs: {hp: 35, at: 55, df: 30, sp: 90, sl: 50},
    weightkg: 6,
    nfe: true,
  },
  Pinsir: {
    types: ['Bug'],
    bs: {hp: 65, at: 125, df: 100, sp: 85, sl: 55},
    weightkg: 55
  },
  Poliwag: {
    types: ['Water'],
    bs: {hp: 40, at: 50, df: 40, sp: 90, sl: 40},
    weightkg: 12.4,
    nfe: true,
  },
  Poliwhirl: {
    types: ['Water'],
    bs: {hp: 65, at: 65, df: 65, sp: 90, sl: 50},
    weightkg: 20,
    nfe: true,
  },
  Poliwrath: {
    types: ['Water', 'Fighting'],
    bs: {hp: 90, at: 85, df: 95, sp: 70, sl: 70},
    weightkg: 54,
  },
  Ponyta: {
    types: ['Fire'],
    bs: {hp: 50, at: 85, df: 55, sp: 90, sl: 65},
    weightkg: 30,
    nfe: true,
  },
  Porygon: {
    types: ['Normal'],
    bs: {hp: 65, at: 60, df: 70, sp: 40, sl: 75},
    weightkg: 36.5,
  },
  Primeape: {
    types: ['Fighting'],
    bs: {hp: 65, at: 105, df: 60, sp: 95, sl: 60},
    weightkg: 32,
  },
  Psyduck: {
    types: ['Water'],
    bs: {hp: 50, at: 52, df: 48, sp: 55, sl: 50},
    weightkg: 19.6,
      nfe: true,
  },
  Raichu: {
    types: ['Electric'],
    bs: {hp: 60, at: 90, df: 55, sp: 100, sl: 90},
    weightkg: 30,
  },
  Rapidash: {
    types: ['Fire'],
    bs: {hp: 65, at: 100, df: 70, sp: 105, sl: 80},
    weightkg: 95
  },
  Raticate: {
    types: ['Normal'],
    bs: {hp: 55, at: 81, df: 60, sp: 97, sl: 50},
    weightkg: 18.5,
  },
  Rattata: {
    types: ['Normal'],
    bs: {hp: 30, at: 56, df: 35, sp: 72, sl: 25},
    weightkg: 3.5,
    nfe: true,
  },
  Rhydon: {
    types: ['Ground', 'Rock'],
    bs: {hp: 105, at: 130, df: 120, sp: 40, sl: 45},
    weightkg: 120,
  },
  Rhyhorn: {
    types: ['Ground', 'Rock'],
    bs: {hp: 80, at: 85, df: 95, sp: 25, sl: 30},
    weightkg: 115,
    nfe: true,
  },
  Samurott: {
    types: ['Water'],
    bs: {hp: 95, at: 100, df: 85, sp: 70, sl: 108},
    weightkg: 94.6,
  },
  Sandshrew: {
    types: ['Ground'],
    bs: {hp: 50, at: 75, df: 85, sp: 40, sl: 30},
    weightkg: 12,
    nfe: true,
  },
  Sandslash: {
    types: ['Ground'],
    bs: {hp: 75, at: 100, df: 110, sp: 65, sl: 55},
    weightkg: 29.5,
  },
  Scyther: {
    types: ['Bug', 'Flying'],
    bs: {hp: 70, at: 110, df: 80, sp: 105, sl: 55},
    weightkg: 56,
  },
  Seadra: {
    types: ['Water'],
    bs: {hp: 55, at: 65, df: 95, sp: 85, sl: 95},
    weightkg: 25
  },
  Seaking: {
    types: ['Water'],
    bs: {hp: 80, at: 92, df: 65, sp: 68, sl: 80},
    weightkg: 39
  },
  Seel: {
    types: ['Water'],
    bs: {hp: 65, at: 45, df: 55, sp: 45, sl: 70},
    weightkg: 90,
    nfe: true,
  },
  Shellder: {
    types: ['Water'],
    bs: {hp: 30, at: 65, df: 100, sp: 40, sl: 45},
    weightkg: 4,
    nfe: true,
  },
  Skeledirge: {
    types: ['Fire', 'Ghost'],
    bs: {hp: 104, at: 75, df: 100, sp: 66, sl: 110},
    weightkg: 326.5
  },
  Slowbro: {
    types: ['Water', 'Psychic'],
    bs: {hp: 95, at: 75, df: 110, sp: 30, sl: 80},
    weightkg: 78.5,
  },
  Slowpoke: {
    types: ['Water', 'Psychic'],
    bs: {hp: 90, at: 65, df: 65, sp: 15, sl: 40},
    weightkg: 36,
    nfe: true,
  },
  Snorlax: {
    types: ['Normal'],
    bs: {hp: 160, at: 110, df: 65, sp: 30, sl: 65},
    weightkg: 460,
  },
  Spearow: {
    types: ['Normal', 'Flying'],
    bs: {hp: 40, at: 60, df: 30, sp: 70, sl: 31},
    weightkg: 2,
    nfe: true,
  },
  Squirtle: {
    types: ['Water'],
    bs: {hp: 44, at: 48, df: 65, sp: 43, sl: 50},
    weightkg: 9,
    nfe: true,
  },
  Starmie: {
    types: ['Water', 'Psychic'],
    bs: {hp: 60, at: 75, df: 85, sp: 115, sl: 100},
    weightkg: 80,
  },
  Staryu: {
    types: ['Water'],
    bs: {hp: 30, at: 45, df: 55, sp: 85, sl: 70},
    weightkg: 34.5,
    nfe: true,
  },
  Tangela: {
    types: ['Grass'],
    bs: {hp: 65, at: 55, df: 115, sp: 60, sl: 100},
    weightkg: 35,
  },
  Tauros: {
    types: ['Normal'],
    bs: {hp: 75, at: 100, df: 95, sp: 110, sl: 70},
    weightkg: 88.4,
  },
  Tentacool: {
    types: ['Water', 'Poison'],
    bs: {hp: 40, at: 40, df: 35, sp: 70, sl: 100},
    weightkg: 45.5,
      nfe: true,
  },
  Tentacruel: {
    types: ['Water', 'Poison'],
    bs: {hp: 80, at: 70, df: 65, sp: 100, sl: 120},
    weightkg: 55,
  },
  Torterra: {
    types: ['Grass', 'Ground'],
    bs: {hp: 95, at: 109, df: 105, sp: 56, sl: 85},
    weightkg: 310,
  },
  Vaporeon: {
    types: ['Water'],
    bs: {hp: 130, at: 65, df: 60, sp: 65, sl: 110},
    weightkg: 29,
  },
  Venomoth: {
    types: ['Bug', 'Poison'],
    bs: {hp: 70, at: 65, df: 60, sp: 90, sl: 90},
    weightkg: 12.5,
  },
  Venonat: {
    types: ['Bug', 'Poison'],
    bs: {hp: 60, at: 55, df: 50, sp: 45, sl: 40},
    weightkg: 30,
    nfe: true,
  },
  Venusaur: {
    types: ['Grass', 'Poison'],
    bs: {hp: 80, at: 82, df: 83, sp: 80, sl: 100},
    weightkg: 100,
  },
  Victreebel: {
    types: ['Grass', 'Poison'],
    bs: {hp: 80, at: 105, df: 65, sp: 70, sl: 100},
    weightkg: 15.5,
  },
  Vileplume: {
    types: ['Grass', 'Poison'],
    bs: {hp: 75, at: 80, df: 85, sp: 50, sl: 100},
    weightkg: 18.6,
  },
  Volcarona: {
    types: ['Bug', 'Fire'],
    bs: {hp: 85, at: 60, df: 65, sp: 100, sl: 105},
    weightkg: 46
  },
  Voltorb: {
    types: ['Electric'],
    bs: {hp: 40, at: 30, df: 50, sp: 100, sl: 55},
    weightkg: 10.4,
    nfe: true,
  },
  Vulpix: {
    types: ['Fire'],
    bs: {hp: 38, at: 41, df: 40, sp: 65, sl: 65},
    weightkg: 9.9,
    nfe: true,
  },
  Wartortle: {
    types: ['Water'],
    bs: {hp: 59, at: 63, df: 80, sp: 58, sl: 65},
    weightkg: 22.5,
    nfe: true,
  },
  Weedle: {
    types: ['Bug', 'Poison'],
    bs: {hp: 40, at: 35, df: 30, sp: 50, sl: 20},
    weightkg: 3.2,
    nfe: true,
  },
  Weepinbell: {
    types: ['Grass', 'Poison'],
    bs: {hp: 65, at: 90, df: 50, sp: 55, sl: 85},
    weightkg: 6.4,
    nfe: true,
  },
  Weezing: {
    types: ['Poison'],
    bs: {hp: 65, at: 90, df: 120, sp: 60, sl: 85},
    weightkg: 9.5,
  },
  Wigglytuff: {
    types: ['Normal'],
    bs: {hp: 140, at: 70, df: 45, sp: 45, sl: 50},
    weightkg: 12,
  },
  Zapdos: {
    types: ['Electric', 'Flying'],
    bs: {hp: 90, at: 90, df: 85, sp: 100, sl: 125},
    weightkg: 52.6,
  },
  'Zapdos-Galar': {
    types: ['Fighting', 'Flying'],
    bs: {hp: 90, at: 125, df: 90, sp: 100, sl: 90},
    weightkg: 58.2,
  },
  Zubat: {
    types: ['Poison', 'Flying'],
    bs: {hp: 40, at: 45, df: 35, sp: 55, sl: 40},
    weightkg: 7.5,
    nfe: true,
  },
};
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
const SV_PATCH: {[name: string]: DeepPartial<SpeciesData>} = {}
const SV: {[name: string]: SpeciesData} = {
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
