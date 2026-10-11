/**
 * Classe que representa uma Mutação Lendária (Legendary Ability)
 * para Criaturas Lendárias e Personagens Major no Fallout 2d20 RPG.
 */
class MutacaoLendaria {
  /**
   * @param {Object} config
   * @param {string} config.nome - Nome da habilidade lendária.
   * @param {string} config.descricao - Descrição/flavor text da criatura/habilidade.
   * @param {string} config.passivo - Efeito constante que sempre se aplica.
   * @param {string} config.ativo - Efeito da mutação ativado abaixo de 50% de HP.
   * @param {boolean} [config.somentePersonagem=false] - Se a habilidade é exclusiva para personagens.
   * @param {Object} [config.opcoesPersonalizadas={}] - Parâmetros opcionais (ex: ataque escolhido, tag skill, etc).
   */
  constructor({
    nome = "",
    descricao = "",
    passivo = "",
    ativo = "",
    somentePersonagem = false,
    opcoesPersonalizadas = {}
  } = {}) {
    this.nome = nome;
    this.descricao = descricao;
    this.passivo = passivo;
    this.ativo = ativo;
    this.somentePersonagem = somentePersonagem;
    this.opcoesPersonalizadas = { ...opcoesPersonalizadas };

    // Controle de estado em combate
    this.mutou = false;
  }

  /**
   * Verifica se a criatura/personagem deve mutar com base no HP atual e HP máximo.
   * A mutação ocorre a primeira vez em que a criatura fica abaixo de 50% do HP máximo.
   * @param {number} hpAtual 
   * @param {number} hpMaximo 
   * @returns {boolean} Retorna true se a mutação acabou de ser engatilhada.
   */
  verificarMutacao(hpAtual, hpMaximo) {
    if (this.mutou) {
      return false; // Não pode mutar uma segunda vez
    }

    if (hpAtual < (hpMaximo / 2)) {
      this.mutou = true;
      return true;
    }

    return false;
  }

  /**
   * Reseta o estado da mutação (útil entre combates/cenas).
   */
  resetarMutacao() {
    this.mutou = false;
  }

  /**
   * Retorna representação em objeto para persistência/JSON.
   */
  toJSON() {
    return {
      nome: this.nome,
      descricao: this.descricao,
      passivo: this.passivo,
      ativo: this.ativo,
      somentePersonagem: this.somentePersonagem,
      opcoesPersonalizadas: this.opcoesPersonalizadas,
      mutou: this.mutou
    };
  }

  /**
   * Cria uma instância de MutacaoLendaria a partir de um objeto plano/JSON.
   */
  static fromJSON(json) {
    const mutacao = new MutacaoLendaria(json);
    mutacao.mutou = Boolean(json.mutou);
    return mutacao;
  }
}

/**
 * Catálogo com todas as Mutações Lendárias oficiais.
 */
const CATALOGO_MUTACOES_LENDARIAS = Object.freeze({
  CRUEL: new MutacaoLendaria({
    nome: "Cruel",
    descricao: "A criatura é especialmente cruel e parece se alimentar da dor e do terror alheio. Mais comum em carnívoros inteligentes, super mutantes e humanos.",
    passivo: "A criatura ganha 1 ponto de Sorte (mesmo que normalmente não possua pontos de Sorte) toda vez que inflige um acerto crítico.",
    ativo: "Ao mutar, adiciona o efeito de dano Vicious a todos os seus ataques. Se algum ataque já possuir Vicious, aumente o dano daquele ataque em +2 DC.",
    somentePersonagem: false
  }),

  EXPLOSIVE: new MutacaoLendaria({
    nome: "Explosive",
    descricao: "Comum em robôs lendários que se desviaram de sua programação. Extremamente volátil e propensa a detonar de maneira espetacular ao ser derrotada.",
    passivo: "Esta habilidade não concede efeitos sob circunstâncias normais.",
    ativo: "Ao mutar, entra em estado autodestrutivo: todos os ataques corpo a corpo ganham o efeito de dano Radioactive. Ao chegar a 0 HP, explode causando 12 DC de dano Energy Radioactive em alcance Close. Testes de saque/butchery aumentam em +2 na dificuldade.",
    somentePersonagem: false
  }),

  LEGENDARY_DAMAGE: new MutacaoLendaria({
    nome: "Legendary Damage",
    descricao: "Garras afiadas, lâminas rápidas ou pontaria mortal. A criatura ou personagem é notória pela letalidade dos seus golpes.",
    passivo: "Selecione um dos ataques da criatura. Esse ataque inflige +3 DC de dano. Se for uma arma à distância com Fire Rate 1+, pode usar a habilidade Let Rip (ou equivalente) mais uma vez por cena.",
    ativo: "Ao mutar, seus ataques tornam-se mais rápidos: ao gastar AP para fazer uma ação maior extra com o ataque escolhido, gasta apenas 1 AP em vez de 2 (sem aumento de dificuldade se for outro ataque). Se for arma de fogo (FR 1+), recupera 1 uso de Let Rip.",
    somentePersonagem: false
  }),

  LEGENDARY_PROFICIENCY: new MutacaoLendaria({
    nome: "Legendary Proficiency",
    descricao: "Exclusivo para personagens. O personagem é lendário por sua maestria técnica em um campo específico de atuação.",
    passivo: "Escolha uma das Tag Skills do personagem. Sempre que realizar um teste com essa perícia, obtém 1 sucesso automático além dos rolados nos dados.",
    ativo: "Ao mutar, para de se conter: testes utilizando a Tag Skill escolhida agora recebem 2 sucessos automáticos em vez de 1.",
    somentePersonagem: true
  }),

  RADIOACTIVE: new MutacaoLendaria({
    nome: "Radioactive",
    descricao: "Corpo e sangue pesadamente irradiados. Comum em insetos, animais brilhantes, glowing ones, super mutantes e robôs com reatores nucleares.",
    passivo: "A criatura é imune a dano de Radiação. Além disso, todos os seus ataques corpo a corpo ganham o efeito de dano Radioactive.",
    ativo: "Ao mutar, seu corpo danificado vaza radiação extrema: qualquer criatura a alcance Close no início do seu turno sofre 5 DC Piercing 1 de dano de Radiação.",
    somentePersonagem: false
  }),

  RAGE_HEAL: new MutacaoLendaria({
    nome: "Rage Heal",
    descricao: "Movido por fúria e adrenalina pura, precisa ser abatido rapidamente antes que se recupere dos ferimentos.",
    passivo: "A criatura recupera 3 HP no início de cada um dos seus turnos.",
    ativo: "Ao mutar, recupera imediatamente todo o seu HP de volta ao valor máximo.",
    somentePersonagem: false
  }),

  SCARRED: new MutacaoLendaria({
    nome: "Scarred",
    descricao: "O corpo é uma massa deformada de cicatrizes e tecidos endurecidos que sobreviveu a ferimentos inimagináveis.",
    passivo: "O DR Físico e o DR de Energia da criatura aumentam em +2 cada.",
    ativo: "Ao mutar, role 1 DC para cada Lesão (Injury) que sofreu; para cada Efeito rolado, aquela Lesão é curada. Pelo resto da cena, seus DRs Físico e de Energia aumentam em mais +2 adicionais.",
    somentePersonagem: false
  }),

  STALKER: new MutacaoLendaria({
    nome: "Stalker",
    descricao: "Furtivo, paciente e calculista, ataca quando tem vantagem absoluta usando sombras e camuflagem.",
    passivo: "Ganha 1 sucesso automático em testes de Sneak e +2 de Iniciativa. Enquanto estiver em sombras, escuridão ou cobertura, sua Defesa aumenta em +1.",
    ativo: "Ao mutar, torna-se completamente invisível como se tivesse ativado um Stealth Boy.",
    somentePersonagem: false
  }),

  TOXIC: new MutacaoLendaria({
    nome: "Toxic",
    descricao: "Suas presas, ferrões ou garras contêm veneno altamente virulento que consome as vítimas após o ataque.",
    passivo: "Ataques corpo a corpo ganham o efeito Persistent (Poison). Escolha um efeito adicional entre Radioactive, Stun ou Vicious: o dano de veneno persistente também herda o efeito escolhido.",
    ativo: "Ao mutar, exala vapores tóxicos: qualquer um em alcance Reach no início do seu turno sofre 5 DC de dano Poison (contendo também o efeito de dano escolhido).",
    somentePersonagem: false
  }),

  TYRANT: new MutacaoLendaria({
    nome: "Tyrant",
    descricao: "Mais implacável que um alfa ou chefe comum, domina e comanda outros de sua espécie com autoridade absoluta.",
    passivo: "Acompanhado por criaturas Normais da mesma espécie: +1 criatura se for do mesmo nível, +2 se forem 1-2 níveis abaixo, ou +3 se forem 3+ níveis abaixo.",
    ativo: "Ao mutar, reforços adicionais chegam ao combate; a quantidade e o nível dos reforços seguem a mesma regra dos acompanhantes iniciais.",
    somentePersonagem: false
  })
});

// Suporte para exportação (Node.js/ES Modules) ou inclusão direta no navegador via tag <script>
if (typeof module !== "undefined" && module.exports) {
  module.exports = { MutacaoLendaria, CATALOGO_MUTACOES_LENDARIAS };
}