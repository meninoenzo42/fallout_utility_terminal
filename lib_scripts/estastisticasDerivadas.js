/**
 * ====================================================================
 * MODULO: estastisticasDerivadas.js
 * Utilitários de cálculo para atributos derivados baseados no sistema S.P.E.C.I.A.L.
 * ====================================================================
 */

function parseSafeInt(value, fallbackDefault = 0) {
  if (value === null || value === undefined || value === "") return fallbackDefault;
  const strVal = String(value).split(".")[0].split(",")[0].trim();
  const num = parseInt(strVal, 10);
  return isNaN(num) ? fallbackDefault : Math.floor(num);
}

function calcularIniciativa(perception, agility) {
  const per = parseSafeInt(perception, 5);
  const agi = parseSafeInt(agility, 5);
  return per + agi;
}

function calcularDefesa(agility) {
  const agi = parseSafeInt(agility, 5);
  return agi >= 9 ? 2 : 1;
}

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

function calcularCapacidadeCarga(strength, baseCarry = 100, weightMult = 10) {
  const str = parseSafeInt(strength, 5);
  const base = Math.max(1, parseSafeInt(baseCarry, 100));
  const mult = Math.max(0, parseSafeInt(weightMult, 10));
  return base + (mult * str);
}

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
  const initiative = calcularIniciativa(perception, agility);
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

// Expõe globalmente no navegador
if (typeof window !== "undefined") {
  window.SpecialDerived = {
    calcularIniciativa,
    calcularDefesa,
    calcularBonusMelee,
    calcularCapacidadeCarga,
    calcularHpBase,
    calcularContribuicaoAp,
    calcularTodasDerivadas
  };
}

// Suporte para Node.js / CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calcularIniciativa,
    calcularDefesa,
    calcularBonusMelee,
    calcularCapacidadeCarga,
    calcularHpBase,
    calcularContribuicaoAp,
    calcularTodasDerivadas
  };
}
