/**
 * ====================================================================
 * MODULO: estastisticasDerivadas.js
 * Utilitários de cálculo para atributos derivados baseados no sistema S.P.E.C.I.A.L.
 * e regras complementares de criaturas e personagens (NPCs).
 * ====================================================================
 */

function parseSafeInt(value, fallbackDefault = 0) {
  if (value === null || value === undefined || value === "") return fallbackDefault;
  const strVal = String(value).split(".")[0].split(",")[0].trim();
  const num = parseInt(strVal, 10);
  return isNaN(num) ? fallbackDefault : Math.floor(num);
}

// ====================================================================
// FUNÇÕES BASE (S.P.E.C.I.A.L. & PERSONAGENS)
// ====================================================================

/**
 * Calcula a Iniciativa Base de um personagem (PER + AGI), aplicando
 * bónus adicionais de categorias como Notable (+2) ou Major (+4).
 */
function calcularIniciativa(perception, agility, bonusCategoria = 0) {
  const per = parseSafeInt(perception, 5);
  const agi = parseSafeInt(agility, 5);
  const bonus = parseSafeInt(bonusCategoria, 0);
  return per + agi + bonus;
}

/**
 * Calcula o valor de Defesa de um personagem (AGI >= 9 ? 2 : 1).
 */
function calcularDefesa(agility) {
  const agi = parseSafeInt(agility, 5);
  return agi >= 9 ? 2 : 1;
}

/**
 * Determina o bónus em Dados de Combate (DC) para ataques corpo a corpo com base na Força.
 */
function calcularBonusMelee(strength) {
  const str = parseSafeInt(strength, 5);
  let bonus = 0;
  let activeTierId = "melee-tier-0";
  let tier = 0;

  if (str >= 11) {
    bonus = 3;
    tier = 3;
    activeTierId = "melee-tier-3";
  } else if (str >= 9) {
    bonus = 2;
    tier = 2;
    activeTierId = "melee-tier-2";
  } else if (str >= 7) {
    bonus = 1;
    tier = 1;
    activeTierId = "melee-tier-1";
  } else {
    bonus = 0;
    tier = 0;
    activeTierId = "melee-tier-0";
  }

  return {
    bonus,
    label: `+${bonus} DC`,
    tier,
    activeTierId
  };
}

/**
 * Calcula a Capacidade de Carga total em libras (lbs).
 */
function calcularCapacidadeCarga(strength, baseCarry = 100, weightMult = 10) {
  const str = parseSafeInt(strength, 5);
  const base = Math.max(1, parseSafeInt(baseCarry, 100));
  const mult = Math.max(0, parseSafeInt(weightMult, 10));
  return base + (mult * str);
}

/**
 * Calcula os Pontos de Vida (HP Base) de um personagem com base em END, LCK e Nível.
 */
function calcularHpBase({
  endurance,
  luck,
  level = 1,
  multMode = "none",
  multEnd = 1,
  multLck = 1
}) {
  const end = parseSafeInt(endurance, 5);
  const lck = parseSafeInt(luck, 5);
  const lvl = Math.max(1, parseSafeInt(level, 1));

  const effectiveMultEnd = (multMode === "end" || multMode === "both") 
    ? Math.max(1, parseSafeInt(multEnd, 1)) 
    : 1;

  const effectiveMultLck = (multMode === "lck" || multMode === "both") 
    ? Math.max(1, parseSafeInt(multLck, 1)) 
    : 1;

  const endPartVal = end * effectiveMultEnd;
  const lckPartVal = lck * effectiveMultLck;
  const totalHp = endPartVal + lckPartVal + (lvl - 1);

  const endLabel = effectiveMultEnd !== 1 ? `(END * ${effectiveMultEnd})` : "END";
  const lckLabel = effectiveMultLck !== 1 ? `(LCK * ${effectiveMultLck})` : "LCK";
  const formulaLabel = `${endLabel} + ${lckLabel} + (Nível - 1)`;

  return {
    totalHp,
    formulaLabel
  };
}

/**
 * Calcula a contribuição de Pontos de Ação (AP) via Carisma.
 */
function calcularContribuicaoAp(charisma, apDivisor = 2) {
  const cha = parseSafeInt(charisma, 5);
  const divisor = Math.max(1, parseSafeInt(apDivisor, 2));

  const apContribution = Math.floor(cha / divisor);
  const remainder = cha % divisor;

  return {
    apContribution,
    remainder,
    displayText: `Contribuição: +${apContribution} AP (Sobra: ${remainder})`
  };
}

/**
 * Calcula o agregado de todas as derivadas de um personagem convencional.
 */
function calcularTodasDerivadas({
  strength = 5,
  perception = 5,
  endurance = 5,
  charisma = 5,
  intelligence = 5,
  agility = 5,
  luck = 5,
  options = {}
}) {
  const initiative = calcularIniciativa(perception, agility, options.bonusIniciativa || 0);
  const defense = calcularDefesa(agility);
  const melee = calcularBonusMelee(strength);
  const carry = calcularCapacidadeCarga(
    strength, 
    options.baseCarry !== undefined ? options.baseCarry : 100, 
    options.weightMult !== undefined ? options.weightMult : 10
  );
  const hp = calcularHpBase({
    endurance,
    luck,
    level: options.hpLevel !== undefined ? options.hpLevel : 1,
    multMode: options.hpMultMode || "none",
    multEnd: options.hpMultEnd !== undefined ? options.hpMultEnd : 1,
    multLck: options.hpMultLck !== undefined ? options.hpMultLck : 1
  });
  const ap = calcularContribuicaoAp(charisma, options.apDivisor !== undefined ? options.apDivisor : 2);

  return {
    iniciativa: initiative,
    defesa: defense,
    bonusMelee: melee,
    capacidadeCargaLbs: carry,
    hp: hp,
    ap: ap
  };
}

// ====================================================================
// FUNÇÕES DERIVADAS PARA NPCS E CRIATURAS
// ====================================================================

/**
 * Calcula a recompensa de XP concedida ao derrotar um NPC.
 * Fórmula: Base + (Multi * (Level - 1)), onde Base=10 e Multi=7.
 * Dobrado para Mighty/Notable e triplicado para Legendary/Major.
 */
function calcularXpNpc(level = 1, nature = "creature", type = "normal") {
  const lvl = Math.max(1, parseSafeInt(level, 1));
  const base = 10;
  const multi = 7;
  let factor = 1;

  if (nature === "creature") {
    if (type === "mighty") factor = 2;
    else if (type === "legendary") factor = 3;
  } else {
    if (type === "notable") factor = 2;
    else if (type === "major") factor = 3;
  }

  return (base * factor) + ((multi * factor) * (lvl - 1));
}

/**
 * Calcula o orçamento permitido de Body + Mind para uma Criatura.
 * Fórmula Normal: 8 + Math.ceil(Level / 2).
 * Mighty adiciona +2, Legendary adiciona +4 (+2 em ambos).
 */
function calcularOrcamentoAtributosCriatura(level = 1, type = "normal") {
  const lvl = Math.max(1, parseSafeInt(level, 1));
  let budget = 8 + Math.ceil(lvl / 2);

  if (type === "mighty") budget += 2;
  else if (type === "legendary") budget += 4;

  return budget;
}

/**
 * Calcula os Pontos de Vida (HP) de uma Criatura.
 * Base: Body + Level (+4 se Big, -2 se Little).
 * Mighty: 2x o total base. Legendary: 3x o total base.
 */
function calcularHpCriatura(body, level = 1, type = "normal", size = "normal") {
  const b = parseSafeInt(body, 4);
  const lvl = Math.max(1, parseSafeInt(level, 1));

  let baseHp = b + lvl;
  if (size === "big") baseHp += 4;
  else if (size === "little") baseHp = Math.max(1, baseHp - 2);

  if (type === "mighty") baseHp *= 2;
  else if (type === "legendary") baseHp *= 3;

  return baseHp;
}

/**
 * Calcula os Números-Alvo (Target Numbers - TN) para as três perícias de Criatura.
 */
function calcularTnPericiasCriatura(body, mind, skills = {}) {
  const b = parseSafeInt(body, 4);
  const m = parseSafeInt(mind, 4);

  return {
    melee: b + parseSafeInt(skills.melee, 0),
    guns: b + parseSafeInt(skills.guns, 0),
    other: m + parseSafeInt(skills.other, 0)
  };
}

/**
 * Calcula o total de derivadas de uma Criatura (HP, Iniciativa, Defesa, Melee, TNs e XP).
 */
function calcularDerivadasCriatura({
  body = 5,
  mind = 4,
  level = 1,
  type = "normal",
  size = "normal",
  skills = { melee: 1, guns: 0, other: 1 }
}) {
  const b = parseSafeInt(body, 4);
  const m = parseSafeInt(mind, 4);
  const lvl = Math.max(1, parseSafeInt(level, 1));

  const hp = calcularHpCriatura(b, lvl, type, size);
  const initiative = b + m;
  const defense = size === "little" ? 2 : 1;
  const melee = calcularBonusMelee(b);
  const tns = calcularTnPericiasCriatura(b, m, skills);
  const budget = calcularOrcamentoAtributosCriatura(lvl, type);
  const xp = calcularXpNpc(lvl, "creature", type);

  return {
    hp,
    iniciativa: initiative,
    defesa: defense,
    bonusMelee: melee,
    tns,
    orcamentoAtributos: budget,
    xpRecompensa: xp
  };
}

// ====================================================================
// EXPOSIÇÃO GLOBAL (NAVEGADOR) E COMMONJS (NODE)
// ====================================================================

const exportObject = {
  calcularIniciativa,
  calcularDefesa,
  calcularBonusMelee,
  calcularCapacidadeCarga,
  calcularHpBase,
  calcularContribuicaoAp,
  calcularTodasDerivadas,
  calcularXpNpc,
  calcularOrcamentoAtributosCriatura,
  calcularHpCriatura,
  calcularTnPericiasCriatura,
  calcularDerivadasCriatura
};

if (typeof window !== "undefined") {
  window.SpecialDerived = exportObject;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = exportObject;
}
