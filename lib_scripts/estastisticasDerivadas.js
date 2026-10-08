/**
 * ====================================================================
 * MODULO: estatisticasDerivadas.js
 * Utilitários de cálculo para atributos derivados baseados no sistema S.P.E.C.I.A.L.
 * ====================================================================
 */

/**
 * Utilitário interno para garantir inteiros seguros sem NaN ou decimais indesejados.
 * @param {*} value - Valor de entrada
 * @param {number} fallbackDefault - Valor retornado em caso de falha ou campo vazio
 * @returns {number}
 */
function parseSafeInt(value, fallbackDefault = 0) {
  if (value === null || value === undefined || value === "") return fallbackDefault;
  const strVal = String(value).split(".")[0].split(",")[0].trim();
  const num = parseInt(strVal, 10);
  return isNaN(num) ? fallbackDefault : Math.floor(num);
}

/**
 * Calcula a Iniciativa Base do personagem.
 * Fórmula: Percepção (PER) + Agilidade (AGI).
 * 
 * @param {number} perception - Valor do atributo Percepção (PER).
 * @param {number} agility - Valor do atributo Agilidade (AGI).
 * @returns {number} Valor total da iniciativa.
 */
export function calcularIniciativa(perception, agility) {
  const per = parseSafeInt(perception, 5);
  const agi = parseSafeInt(agility, 5);
  return per + agi;
}

/**
 * Calcula o valor de Defesa do personagem baseado na Agilidade.
 * Regra: Se Agilidade >= 9, a defesa é 2; caso contrário, é 1.
 * 
 * @param {number} agility - Valor do atributo Agilidade (AGI).
 * @returns {number} 1 ou 2 pontos de defesa.
 */
export function calcularDefesa(agility) {
  const agi = parseSafeInt(agility, 5);
  return agi >= 9 ? 2 : 1;
}

/**
 * Determina o bônus de dados de combate (DC) em ataques corpo-a-corpo baseado na Força (STR).
 * Tiers:
 *  - STR <= 6: +0 DC (tier 0)
 *  - STR 7 a 8: +1 DC (tier 1)
 *  - STR 9 a 10: +2 DC (tier 2)
 *  - STR >= 11: +3 DC (tier 3)
 * 
 * @param {number} strength - Valor do atributo Força (STR).
 * @returns {{ bonus: number, label: string, tier: number, activeTierId: string }}
 */
export function calcularBonusMelee(strength) {
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
 * Calcula a Capacidade Total de Carga (Carry Weight) em libras (lbs).
 * Fórmula: Base + (Multiplicador * Força).
 * 
 * @param {number} strength - Valor de Força (STR).
 * @param {number} [baseCarry=100] - Carga base padrão (mínimo 1).
 * @param {number} [weightMult=10] - Multiplicador de peso por ponto de Força (mínimo 0).
 * @returns {number} Capacidade máxima em libras.
 */
export function calcularCapacidadeCarga(strength, baseCarry = 100, weightMult = 10) {
  const str = parseSafeInt(strength, 5);
  const base = Math.max(1, parseSafeInt(baseCarry, 100));
  const mult = Math.max(0, parseSafeInt(weightMult, 10));
  return base + (mult * str);
}

/**
 * Calcula os Pontos de Vida (HP Base) do personagem com suporte a multiplicadores condicionais.
 * Fórmula base: (END * multEnd) + (LCK * multLck) + (Nível - 1).
 * 
 * @param {Object} params - Parâmetros para cálculo de HP.
 * @param {number} params.endurance - Valor do atributo Resistência (END).
 * @param {number} params.luck - Valor do atributo Sorte (LCK).
 * @param {number} [params.level=1] - Nível do personagem (mínimo 1).
 * @param {"none"|"end"|"lck"|"both"} [params.multMode="none"] - Modo de multiplicador selecionado.
 * @param {number} [params.multEnd=1] - Multiplicador para o atributo END (usado se mode for 'end' ou 'both').
 * @param {number} [params.multLck=1] - Multiplicador para o atributo LCK (usado se mode for 'lck' ou 'both').
 * @returns {{ totalHp: number, formulaLabel: string }}
 */
export function calcularHpBase({
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
 * Calcula a Contribuição de Pontos de Ação (AP) derivada do Carisma (regra caseira).
 * Divide o valor de Carisma pelo divisor informado, retornando os pontos e o resto da divisão.
 * 
 * @param {number} charisma - Valor do atributo Carisma (CHA).
 * @param {number} [apDivisor=2] - Divisor de AP (mínimo 1, padrão 2).
 * @returns {{ apContribution: number, remainder: number, displayText: string }}
 */
export function calcularContribuicaoAp(charisma, apDivisor = 2) {
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
 * Calcula todas as estatísticas derivadas simultaneamente a partir de um objeto com atributos e opções.
 * 
 * @param {Object} params
 * @param {number} params.strength - Força (STR)
 * @param {number} params.perception - Percepção (PER)
 * @param {number} params.endurance - Resistência (END)
 * @param {number} params.charisma - Carisma (CHA)
 * @param {number} params.intelligence - Inteligência (INT)
 * @param {number} params.agility - Agilidade (AGI)
 * @param {number} params.luck - Sorte (LCK)
 * @param {Object} [params.options] - Configurações extras opcionais
 * @returns {Object} Objeto consolidado com todas as derivadas calculadas
 */
export function calcularTodasDerivadas({
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
    options.baseCarry ?? 100, 
    options.weightMult ?? 10
  );
  const hp = calcularHpBase({
    endurance,
    luck,
    level: options.hpLevel ?? 1,
    multMode: options.hpMultMode ?? "none",
    multEnd: options.hpMultEnd ?? 1,
    multLck: options.hpMultLck ?? 1
  });
  const ap = calcularContribuicaoAp(charisma, options.apDivisor ?? 2);

  return {
    iniciativa: initiative,
    defesa: defense,
    bonusMelee: melee,
    capacidadeCargaLbs: carry,
    hp: hp,
    ap: ap
  };
}

// Compatibilidade para uso direto via tag <script> em navegadores legados (sem type="module")
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