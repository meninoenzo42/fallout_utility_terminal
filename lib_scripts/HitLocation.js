/**
 * Módulo de Gestão de Hit Locations (Partes do Corpo) - Fallout RPG
 * Integra-se diretamente com TipoDeDano de generalUtil_3.js.
 */

// Garante referência segura caso generalUtil_3.js seja carregado antes no escopo global
const TiposDanoMap = (typeof TipoDeDano !== "undefined")
  ? TipoDeDano
  : Object.freeze({
      FISICO: "Físico",
      ENERGIA: "Energia",
      VENENO: "Veneno",
      RADIACAO: "Radiação",
      OUTRO: "Outro"
    });

class Hit_Location {
  /**
   * @param {Object} params
   * @param {string} params.nome - Nome da parte do corpo (ex: "Cabeça", "Tronco")
   * @param {number} [params.quantidadeLesoes=0] - Quantidade de lesões (inteiro >= 0)
   * @param {boolean} [params.estaRemendado=false] - Indica se está remendado/estabilizado
   * @param {number[]} [params.facesDado=[]] - Array de inteiros (1 a 20) que representam a parte no d20
   * @param {Object} [params.dr={}] - Mapa inicial de Resistências de Dano (aceita inteiros >= 0, Infinity ou "Imune")
   */
  constructor({
    nome = "Parte Sem Nome",
    quantidadeLesoes = 0,
    estaRemendado = false,
    facesDado = [],
    dr = {}
  } = {}) {
    this._nome = "";
    this._quantidadeLesoes = 0;
    this._estaRemendado = false;
    this._facesDado = [];

    // Armazena as DRs indexadas pelas constantes de TipoDeDano (valores: int >= 0 ou Infinity)
    this._dr = {
      [TiposDanoMap.FISICO]: 0,
      [TiposDanoMap.ENERGIA]: 0,
      [TiposDanoMap.RADIACAO]: 0,
      [TiposDanoMap.VENENO]: 0
    };

    // Aplica valores iniciais através dos setters para garantir sanitização
    this.nome = nome;
    this.quantidadeLesoes = quantidadeLesoes;
    this.estaRemendado = estaRemendado;
    this.facesDado = facesDado;

    this.drFisica = dr[TiposDanoMap.FISICO] ?? dr.fisica ?? 0;
    this.drEnergia = dr[TiposDanoMap.ENERGIA] ?? dr.energia ?? 0;
    this.drRadiacao = dr[TiposDanoMap.RADIACAO] ?? dr.radiacao ?? 0;
    this.drVeneno = dr[TiposDanoMap.VENENO] ?? dr.veneno ?? 0;
  }

  /* =======================================================
     1. NOME
     ======================================================= */
  get nome() {
    return this._nome;
  }

  set nome(valor) {
    if (typeof valor !== "string" || valor.trim() === "") {
      throw new Error("O nome da Hit_Location deve ser uma string não vazia.");
    }
    this._nome = valor.trim();
  }

  /* =======================================================
     2. QUANTIDADE DE LESÕES (int 0-N)
     ======================================================= */
  get quantidadeLesoes() {
    return this._quantidadeLesoes;
  }

  set quantidadeLesoes(valor) {
    const num = Math.floor(Number(valor));
    if (isNaN(num) || num < 0) {
      throw new Error("A quantidade de lesões deve ser um número inteiro maior ou igual a 0.");
    }
    this._quantidadeLesoes = num;
  }

  /* =======================================================
     3. ESTÁ REMENDADO (bool)
     ======================================================= */
  get estaRemendado() {
    return this._estaRemendado;
  }

  set estaRemendado(valor) {
    this._estaRemendado = Boolean(valor);
  }

  /* =======================================================
     4. FACES DO DADO (Array[int] de 1 a 20)
     ======================================================= */
  get facesDado() {
    return [...this._facesDado];
  }

  set facesDado(faces) {
    if (!Array.isArray(faces)) {
      throw new Error("facesDado deve ser um Array de números inteiros.");
    }

    const facesValidas = faces.map(f => {
      const n = Math.floor(Number(f));
      if (isNaN(n) || n < 1 || n > 20) {
        throw new Error(`Face de dado inválida (${f}). Deve ser um inteiro entre 1 e 20.`);
      }
      return n;
    });

    this._facesDado = [...new Set(facesValidas)].sort((a, b) => a - b);
  }

  /* =======================================================
     5 a 8. RESISTÊNCIAS DE DANO (DR)
     Aceitam inteiros >= 0, Infinity ou "Imune"
     ======================================================= */
  // 5 - DR Física
  get drFisica() {
    return this._dr[TiposDanoMap.FISICO];
  }

  set drFisica(valor) {
    this._dr[TiposDanoMap.FISICO] = this._validarDR(valor);
  }

  // 6 - DR Energia
  get drEnergia() {
    return this._dr[TiposDanoMap.ENERGIA];
  }

  set drEnergia(valor) {
    this._dr[TiposDanoMap.ENERGIA] = this._validarDR(valor);
  }

  // 7 - DR Radiação
  get drRadiacao() {
    return this._dr[TiposDanoMap.RADIACAO];
  }

  set drRadiacao(valor) {
    this._dr[TiposDanoMap.RADIACAO] = this._validarDR(valor);
  }

  // 8 - DR Veneno
  get drVeneno() {
    return this._dr[TiposDanoMap.VENENO];
  }

  set drVeneno(valor) {
    this._dr[TiposDanoMap.VENENO] = this._validarDR(valor);
  }

  /* =======================================================
     MÉTODOS DE IMUNIDADE E DR POR TipoDeDano
     ======================================================= */

  /**
   * Determina se esta parte do corpo é imune a um determinado TipoDeDano.
   * @param {string} tipoDeDano - Uma das constantes de TipoDeDano
   * @returns {boolean}
   */
  ehImune(tipoDeDano) {
    if (tipoDeDano === TiposDanoMap.OUTRO) return false;
    if (!(tipoDeDano in this._dr)) {
      throw new Error(`Tipo de dano desconhecido: ${tipoDeDano}`);
    }
    return this._dr[tipoDeDano] === Infinity;
  }

  /**
   * Define ou remove a imunidade de um TipoDeDano específico.
   * @param {string} tipoDeDano - Uma das constantes de TipoDeDano
   * @param {boolean} imune - true para tornar imune (DR = Infinity), false para zerar a DR
   * @param {number} [drFallback=0] - Valor numérico de DR caso imune seja false
   */
  setImunidade(tipoDeDano, imune = true, drFallback = 0) {
    if (!(tipoDeDano in this._dr)) {
      throw new Error(`Tipo de dano desconhecido ou não suportado para imunidade: ${tipoDeDano}`);
    }
    this._dr[tipoDeDano] = imune ? Infinity : this._validarDR(drFallback);
  }

  /**
   * Obtém o valor de DR usando diretamente a enumeração TipoDeDano.
   * Retorna Infinity se a parte for imune.
   * @param {string} tipoDeDano
   * @returns {number}
   */
  getDRPorTipo(tipoDeDano) {
    if (tipoDeDano === TiposDanoMap.OUTRO) return 0;
    if (!(tipoDeDano in this._dr)) {
      throw new Error(`Tipo de dano desconhecido ou não suportado para DR: ${tipoDeDano}`);
    }
    return this._dr[tipoDeDano];
  }

  /**
   * Define o valor de DR usando diretamente a enumeração TipoDeDano.
   * Aceita inteiro >= 0, Infinity ou "Imune".
   * @param {string} tipoDeDano
   * @param {number|string} valor
   */
  setDRPorTipo(tipoDeDano, valor) {
    if (!(tipoDeDano in this._dr)) {
      throw new Error(`Tipo de dano desconhecido ou não suportado para DR: ${tipoDeDano}`);
    }
    this._dr[tipoDeDano] = this._validarDR(valor);
  }

  /**
   * Retorna a DR formatada para exibição na UI ("Imune" ou o número).
   * @param {string} tipoDeDano
   * @returns {string}
   */
  getDRFormatada(tipoDeDano) {
    return this.ehImune(tipoDeDano) ? "Imune" : String(this.getDRPorTipo(tipoDeDano));
  }

  /**
   * Verifica se um determinado resultado de d20 acerta esta parte do corpo.
   * @param {number} resultadoD20
   * @returns {boolean}
   */
  contemFace(resultadoD20) {
    return this._facesDado.includes(Math.floor(Number(resultadoD20)));
  }

  /**
   * Formata o intervalo de faces do dado para exibição (ex: [3, 4, 5, 6, 7, 8] -> "3–8").
   * @returns {string}
   */
  get facesFormatadas() {
    if (this._facesDado.length === 0) return "—";
    if (this._facesDado.length === 1) return `${this._facesDado[0]}`;

    const min = this._facesDado[0];
    const max = this._facesDado[this._facesDado.length - 1];
    const isContiguo = (max - min + 1) === this._facesDado.length;

    return isContiguo ? `${min}–${max}` : this._facesDado.join(", ");
  }

  _validarDR(valor) {
    if (
      valor === Infinity ||
      (typeof valor === "string" && ["imune", "immune", "infinity"].includes(valor.trim().toLowerCase()))
    ) {
      return Infinity;
    }

    const num = Math.floor(Number(valor));
    if (isNaN(num) || num < 0) {
      throw new Error("O valor de DR deve ser um número inteiro >= 0 ou Infinity/'Imune'.");
    }
    return num;
  }

  toJSON() {
    const serializeDR = (v) => (v === Infinity ? "Imune" : v);
    return {
      nome: this._nome,
      quantidadeLesoes: this._quantidadeLesoes,
      estaRemendado: this._estaRemendado,
      facesDado: [...this._facesDado],
      dr: {
        [TiposDanoMap.FISICO]: serializeDR(this._dr[TiposDanoMap.FISICO]),
        [TiposDanoMap.ENERGIA]: serializeDR(this._dr[TiposDanoMap.ENERGIA]),
        [TiposDanoMap.RADIACAO]: serializeDR(this._dr[TiposDanoMap.RADIACAO]),
        [TiposDanoMap.VENENO]: serializeDR(this._dr[TiposDanoMap.VENENO])
      }
    };
  }
}

/**
 * Gerenciador para as 1-N Hit Locations de um personagem.
 */
class GerenciadorHitLocations {
  /**
   * @param {Hit_Location[]} [partesIniciais=[]]
   */
  constructor(partesIniciais = []) {
    /** @type {Hit_Location[]} */
    this._partes = [];
    partesIniciais.forEach(p => this.adicionarParte(p));
  }

  get partes() {
    return [...this._partes];
  }

  get totalLesoes() {
    return this._partes.reduce((acc, parte) => acc + parte.quantidadeLesoes, 0);
  }

  adicionarParte(parteOuConfig) {
    const novaParte = (parteOuConfig instanceof Hit_Location)
      ? parteOuConfig
      : new Hit_Location(parteOuConfig);

    const nomeDuplicado = this._partes.some(
      p => p.nome.toLowerCase() === novaParte.nome.toLowerCase()
    );
    if (nomeDuplicado) {
      throw new Error(`Já existe uma Hit_Location cadastrada com o nome "${novaParte.nome}".`);
    }

    for (const face of novaParte.facesDado) {
      const conflito = this.buscarPorFaceDado(face);
      if (conflito) {
        throw new Error(
          `A face ${face} do d20 já está atribuída à parte "${conflito.nome}".`
        );
      }
    }

    this._partes.push(novaParte);
    return novaParte;
  }

  removerParte(nome, exigirMinimoUm = true) {
    if (exigirMinimoUm && this._partes.length <= 1) {
      throw new Error("Um personagem deve possuir no mínimo 1 Hit_Location.");
    }
    const index = this._partes.findIndex(p => p.nome.toLowerCase() === nome.toLowerCase());
    if (index === -1) return false;
    this._partes.splice(index, 1);
    return true;
  }

  buscarPorNome(nome) {
    return this._partes.find(p => p.nome.toLowerCase() === nome.toLowerCase()) || null;
  }

  buscarPorFaceDado(resultadoD20) {
    return this._partes.find(p => p.contemFace(resultadoD20)) || null;
  }

  validarCoberturaD20() {
    const todasFaces = new Set();
    this._partes.forEach(p => p.facesDado.forEach(f => todasFaces.add(f)));

    const faltando = [];
    for (let i = 1; i <= 20; i++) {
      if (!todasFaces.has(i)) faltando.push(i);
    }

    return {
      completo: faltando.length === 0,
      facesFaltando: faltando
    };
  }

  static criarPadraoHumanoide() {
    return new GerenciadorHitLocations([
      { nome: "Cabeça", facesDado: [1, 2] },
      { nome: "Tronco", facesDado: [3, 4, 5, 6, 7, 8] },
      { nome: "Braço Esquerdo", facesDado: [9, 10, 11] },
      { nome: "Braço Direito", facesDado: [12, 13, 14] },
      { nome: "Perna Esquerda", facesDado: [15, 16, 17] },
      { nome: "Perna Direita", facesDado: [18, 19, 20] }
    ]);
  }
}

if (typeof window !== "undefined") {
  window.Hit_Location = Hit_Location;
  window.GerenciadorHitLocations = GerenciadorHitLocations;
}