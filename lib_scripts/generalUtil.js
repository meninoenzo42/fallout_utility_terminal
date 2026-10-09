/**
 * Enumeração simulada em JavaScript para representar os tipos de dano.
 * Utiliza Object.freeze para garantir que os valores sejam imutáveis (constantes).
 */
const TipoDeDano = Object.freeze({
    FISICO: "Físico",
    ENERGIA: "Energia",
    VENENO: "Veneno",
    RADIACAO: "Radiação",
    OUTRO: "Outro"
});
