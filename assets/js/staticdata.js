/* ==================================================================
   staticdata.js — offline datasets for Colors and Geography modules.
   All names in Portuguese (the learning target).
   ================================================================== */
'use strict';

/* 20 colors: Portuguese name + hex for the visual swatch. */
const COLORS = [
  { name: 'vermelho',  hex: '#E53935' },
  { name: 'azul',      hex: '#1E88E5' },
  { name: 'verde',     hex: '#43A047' },
  { name: 'amarelo',   hex: '#FDD835' },
  { name: 'laranja',   hex: '#FB8C00' },
  { name: 'roxo',      hex: '#8E24AA' },
  { name: 'rosa',      hex: '#EC407A' },
  { name: 'preto',     hex: '#1A1A1A' },
  { name: 'branco',    hex: '#FFFFFF' },
  { name: 'cinza',     hex: '#9E9E9E' },
  { name: 'marrom',    hex: '#6D4C41' },
  { name: 'bege',      hex: '#D7C9A8' },
  { name: 'dourado',   hex: '#C9A227' },
  { name: 'prateado',  hex: '#B0BEC5' },
  { name: 'ciano',     hex: '#00ACC1' },
  { name: 'lilás',     hex: '#B39DDB' },
  { name: 'vinho',     hex: '#7B1F2B' },
  { name: 'turquesa',  hex: '#1ABC9C' },
  { name: 'salmão',    hex: '#FA8072' },
  { name: 'índigo',    hex: '#3F51B5' },
];

/* 20 countries with continent + capital (Portuguese spellings). */
const COUNTRIES = [
  { country: 'Brasil',         continent: 'América do Sul',   capital: 'Brasília' },
  { country: 'Argentina',      continent: 'América do Sul',   capital: 'Buenos Aires' },
  { country: 'Chile',          continent: 'América do Sul',   capital: 'Santiago' },
  { country: 'Colômbia',       continent: 'América do Sul',   capital: 'Bogotá' },
  { country: 'Portugal',       continent: 'Europa',           capital: 'Lisboa' },
  { country: 'Espanha',        continent: 'Europa',           capital: 'Madri' },
  { country: 'França',         continent: 'Europa',           capital: 'Paris' },
  { country: 'Itália',         continent: 'Europa',           capital: 'Roma' },
  { country: 'Alemanha',       continent: 'Europa',           capital: 'Berlim' },
  { country: 'Reino Unido',    continent: 'Europa',           capital: 'Londres' },
  { country: 'Rússia',         continent: 'Europa',           capital: 'Moscou' },
  { country: 'Estados Unidos', continent: 'América do Norte', capital: 'Washington' },
  { country: 'México',         continent: 'América do Norte', capital: 'Cidade do México' },
  { country: 'Canadá',         continent: 'América do Norte', capital: 'Otava' },
  { country: 'Japão',          continent: 'Ásia',             capital: 'Tóquio' },
  { country: 'China',          continent: 'Ásia',             capital: 'Pequim' },
  { country: 'Coreia do Sul',  continent: 'Ásia',             capital: 'Seul' },
  { country: 'Índia',          continent: 'Ásia',             capital: 'Nova Délhi' },
  { country: 'Egito',          continent: 'África',           capital: 'Cairo' },
  { country: 'Austrália',      continent: 'Oceania',          capital: 'Camberra' },
];

const CONTINENTS = ['América do Sul', 'América do Norte', 'Europa', 'Ásia', 'África', 'Oceania'];

/* 5 Brazilian states + their capitals. */
const BR_STATES = [
  { state: 'São Paulo',      capital: 'São Paulo' },
  { state: 'Rio de Janeiro', capital: 'Rio de Janeiro' },
  { state: 'Bahia',          capital: 'Salvador' },
  { state: 'Minas Gerais',   capital: 'Belo Horizonte' },
  { state: 'Amazonas',       capital: 'Manaus' },
];

/* Decoys for the "pick a Brazilian state" question (non-states). */
const NOT_BR_STATES = ['Lisboa', 'Buenos Aires', 'Santiago', 'Bogotá', 'Montevidéu', 'Assunção'];
