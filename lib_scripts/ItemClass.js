/**
 * Classe base para representar um Item genérico.
 * Projetada para ser a fundação de um sistema de inventário, podendo ser 
 * facilmente estendida por outras classes (ex: Armas, Consumiveis, Armaduras).
 */
class Item {
    /**
     * Cria uma nova instância de Item.
     * 
     * @param {string} nome - O nome do item.
     * @param {number} peso - O peso do item (float).
     * @param {number} raridade - O nível de raridade do item (int).
     * @param {number} valor - O valor base do item (int).
     */
    constructor(nome = "Item Desconhecido", peso = 0.0, raridade = 0, valor = 0) {
        this._nome = nome;
        this._peso = peso;
        this._raridade = raridade;
        this._valor = valor;
    }

    // ==========================================
    // GETTERS
    // ==========================================

    get nome() {
        return this._nome;
    }

    get peso() {
        return this._peso;
    }

    get raridade() {
        return this._raridade;
    }

    get valor() {
        return this._valor;
    }

    // ==========================================
    // SETTERS
    // ==========================================

    set nome(novoNome) {
        this._nome = novoNome;
    }

    set peso(novoPeso) {
        if (novoPeso < 0) {
            console.warn(`[Item: ${this._nome}] Aviso: O peso não pode ser negativo. Ajustando para 0.`);
            this._peso = 0.0;
        } else {
            this._peso = parseFloat(novoPeso);
        }
    }

    set raridade(novaRaridade) {
        this._raridade = Math.floor(novaRaridade);
    }

    set valor(novoValor) {
        this._valor = Math.floor(novoValor);
    }

    // ==========================================
    // MÉTODOS DE INSTÂNCIA
    // ==========================================

    /**
     * Método genérico para descrever os atributos do item.
     * Preparado para ser sobrescrito (Override) nas classes filhas.
     * 
     * @returns {string} Uma string formatada com os dados do item.
     */
    obterDescricao() {
        return `Item: ${this.nome} | Peso: ${this.peso} | Raridade: ${this.raridade} | Valor: ${this.valor}`;
    }
}

/**
 * Classe Arma que herda de Item, representando armas equipáveis com atributos de combate.
 * Compatível com sistemas de RPG baseados em tabelas de atributos (ex: Fallout 2d20).
 */
class Arma extends Item {
    /**
     * Cria uma nova instância de Arma.
     * 
     * @param {string} nome - Nome da arma.
     * @param {number} peso - Peso da arma (float).
     * @param {number} raridade - Raridade da arma (int).
     * @param {number} valor - Valor base da arma (int).
     * @param {number} damage - Dano base da arma (int).
     * @param {number} fireRate - Cadência de tiro / Fire Rate (int).
     * @param {string} weaponType - Tipo da arma (String, ex: "Pistol", "Rifle").
     * @param {string} damageType - Tipo de dano (enum TipoDeDano).
     * @param {string[]} qualities - Qualidades da arma (Array[String]).
     * @param {string[]} effects - Efeitos especiais da arma (Array[String]).
     * @param {string} range - Alcance da arma (enum Alcance).
     */
    constructor(
        nome = "Arma Desconhecida",
        peso = 0.0,
        raridade = 0,
        valor = 0,
        damage = 0,
        fireRate = 0,
        weaponType = "Desconhecido",
        damageType = TipoDeDano.FISICO,
        qualities = [],
        effects = [],
        range = Alcance.CLOSE
    ) {
        super(nome, peso, raridade, valor);
        this._damage = Math.floor(damage);
        this._fireRate = Math.floor(fireRate);
        this._weaponType = weaponType;
        this._damageType = damageType;
        this._qualities = Array.isArray(qualities) ? qualities : [];
        this._effects = Array.isArray(effects) ? effects : [];
        this._range = range;
    }

    // ==========================================
    // GETTERS (ARMA)
    // ==========================================

    get damage() {
        return this._damage;
    }

    get fireRate() {
        return this._fireRate;
    }

    get weaponType() {
        return this._weaponType;
    }

    get damageType() {
        return this._damageType;
    }

    get qualities() {
        return this._qualities;
    }

    get effects() {
        return this._effects;
    }

    get range() {
        return this._range;
    }

    // ==========================================
    // SETTERS (ARMA)
    // ==========================================

    set damage(novoDamage) {
        this._damage = Math.floor(novoDamage);
    }

    set fireRate(novoFireRate) {
        this._fireRate = Math.max(0, Math.floor(novoFireRate));
    }

    set weaponType(novoWeaponType) {
        this._weaponType = novoWeaponType;
    }

    set damageType(novoDamageType) {
        this._damageType = novoDamageType;
    }

    set qualities(novasQualities) {
        this._qualities = Array.isArray(novasQualities) ? novasQualities : [];
    }

    set effects(novosEffects) {
        this._effects = Array.isArray(novosEffects) ? novosEffects : [];
    }

    set range(novoRange) {
        this._range = novoRange;
    }

    // ==========================================
    // MÉTODOS DE INSTÂNCIA (SOBREPOSIÇÃO)
    // ==========================================

    /**
     * Sobrescreve o método obterDescricao para incluir as propriedades de combate da arma.
     * 
     * @returns {string} Descrição detalhada da arma.
     */
    obterDescricao() {
        return `Arma: ${this.nome} | Tipo: ${this.weaponType} | Dano: ${this.damage} (${this.damageType}) | Cadência: ${this.fireRate} | Alcance: ${this.range} | Peso: ${this.peso} | Valor: ${this.valor}`;
    }
}
