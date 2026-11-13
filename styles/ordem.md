Você deve escrever um novo modulo. Essse modulo deve ser um Gerenciador de rodadas e turnos

# Requesitos funcionais

## Suporte ao modulo de criador de NPC

Ele deve poder ler e entrepertar os json que foram gerados pelo gerador de NPC

## Listagem e gestão de membros de um combate.
Deve  ter possuir uma visualização da ordem de iniciativa de todos os membros.
A exibição na interface deve ser um retangulo com os dados

"Iniciativa", "Nome do ator" "Tipo (Aliado, inimigo, neutro)" "HP/HP max"

A cor do retangulo deve ser diferente para cada

### Informações extras
Ao clicar nesses retangulos, ele se abre com mais dados, podendo conter os dados do json gerado pelo gerador de NPC.

Clicar denovo faz o retangulo colapsar e voltar ao tamanho normal.

#### Partes dos corpos e lesão

Mostra as partes do corpo, coom todos os seus dados de DR, cada parte deve ter um campo int que deve suportar 0-X lesões. E junto com uma caixa de confirmação "Remendado?"

### Criar novos e organizar

Ao criar um novo ator, ele abre um popup que deve conter um das duas opções
- Carregar json com os dados do NPC
- Criar um ator vazio

O pop deve contar um link que abre o gerenciador de npcs numa nova guia

Devem ficar em ordem de iniciativa (Maior primeiro)

Tambem deve ser possui duplicar e criar novos
### Ator vazio
"Ator vazio" deve ter apenas os dados:
-Iniciativa
-Nome
-Tipo de ator

O retangulo que foi registrado como ator vazio, Não pode ser aberto ao ser clicado em cima.


## Reorganizar

Se a iniciativa for a mesma, pode reorganizar por segurar e arrastar, mas respeitando as iniciativas mais altas e baixas

Deve incluir uma check mark que permite organizar ingorando TODAS as iniciativas

## Indexar rodadas

Deve ter um botao de "Avançar turno" e "Retroceder turno", deve ter uma seta indicando qual ator é turno. Avançar o turno para o final. Volta para oo primeiro e aumenta a rodada em 1.

## Editar HP
Se tiver HP, pode editar o HP e HP max. se o HP max for reduzido para baxio do valor original deve ter um indicador de radiação. Se a vida exceder, deve ser marcvado como "Vida maxima adicional"

## Sytle
Usar o pip_boy_theme.js

Cor rosa ffc0cb

Usar as outras libs SE FOR NECESSARIO