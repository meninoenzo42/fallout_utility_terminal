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
        // Exemplo de validação: garantindo que o peso não seja negativo
        if (novoPeso < 0) {
            console.warn(`[Item: ${this._nome}] Aviso: O peso não pode ser negativo. Ajustando para 0.`);
            this._peso = 0.0;
        } else {
            this._peso = parseFloat(novoPeso);
        }
    }

    set raridade(novaRaridade) {
        // Garantindo que a raridade seja tratada como um número inteiro
        this._raridade = Math.floor(novaRaridade);
    }

    set valor(novoValor) {
        // Garantindo que o valor seja tratado como um número inteiro
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
