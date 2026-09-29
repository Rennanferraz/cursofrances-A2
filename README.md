# ATELIER FRANÇAIS A2 · PROJET RENAN
### Piloto funcional U19 — Le passé composé vs l’imparfait   
> Versão 0.2.0-pilote-u19 · 28/09/2026

## COMEÇAR
1. Extraia o ZIP para uma pasta do seu computador.
2. Abra index.html em um navegador. Não é necessário instalar o Node,
   Tailwind, Python, servidor ou plataforma para estudar.
3. Na tela inicial, escolha “Commencer l’unité 19”.
   O botão passa a retomar sua última etapa quando você já iniciou.

O HTML também pode ser utilizado sozinho. Seu conteúdo, estilos, questões
com gabaritos e lógica estão incorporados no próprio arquivo.
Mantenha o nome e a pasta do HTML para reduzir alterações no armazenamento.
Não é necessário abrir os arquivos da pasta source para estudar.

## ESCOPO DESTA ENTREGA
O mapa apresenta os nomes, a ordem e os objetivos das 36 unidades da base.
Somente a U19 está implementada na nova experiência. As outras 35 abrem
uma prévia com seus objetivos, não aulas nem exercícios nesta interface.
Nenhuma unidade anterior é marcada como concluída automaticamente.
O conteúdo das demais unidades não foi apagado: A2.zip continua original.

## A UNIDADE PILOTO
- 10 fichas com conceito essencial, exemplos e aprofundamento “Aller plus loin”.
- 16 exemplos, 12 itens de vocabulário, diálogo e leitura da unidade original.
- 46 questões distintas, todas de múltipla escolha, com quatro alternativas.
  Distribuição: 10 checkpoints + 20 do banco + 6 de contexto + 4 de som/leitura
  + 6 de aplicação. Os drills reutilizam o banco; não aumentam esse total.
- 3 focos de drills, cada rodada com 6 questões e sem cronômetro.
- Feedback preparado no conteúdo, não gerado por IA.
- Revisão das questões erradas e favoritos de fichas teóricas.
- Texto ampliado (A+) e modo foco.
- Navegação em francês; explicações e apoios em português do Brasil.

O mapa inicial se divide em blocos expansíveis. Clique em um número da visão
“Tout le parcours, en un regard” para localizar a unidade na linha do tempo.
A busca considera títulos, objetivos e número da unidade, sem exigir acentos.

## COMO GUARDAR E TRANSFERIR O PROGRESSO
O aplicativo tenta salvar no armazenamento local do navegador, sem conta
ou envio de respostas para um servidor. Se esse recurso estiver bloqueado,
exibe um aviso e continua em memória enquanto a página estiver aberta.

1. Clique em “Sauvegarde”, no cabeçalho.
2. Clique em “Exporter”. Um arquivo Atelier_A2_progresso_DATA.json será criado.
3. Guarde essa cópia em uma pasta permanente ou transfira-a ao outro computador.
4. Abra o MESMO piloto no navegador de destino.
5. Em “Sauvegarde”, escolha “Importer” e selecione o JSON.
6. Confira o resumo e confirme “Remplacer ma progression”.

A importação de uma cópia do piloto SUBSTITUI seu estado atual no destino;
ela não mescla automaticamente dois históricos. Você pode cancelar ou
exportar o estado atual antes de confirmar. A transferência não é automática.
Respostas, favoritos, fichas estudadas, alternativas selecionadas, séries em
andamento e posição são preservados no formato de backup do piloto.

Importe somente cópias de progresso, nunca pilot-data.json ou course.json.
O importador valida formato, versão, perguntas, alternativas e séries.
Arquivos inválidos ou maiores que 3 MB são recusados sem substituição.

## ARQUIVOS DE PROGRESSO DA VERSÃO 0.2
O importador também reconhece o formato original 0.2. Os resultados e
rascunhos anteriores são guardados como histórico separado no novo backup.
Eles NÃO são convertidos em respostas individuais nem conclusão das etapas
novas. O armazenamento e o HTML antigos não são alterados.
Backups antigos podem conter textos pessoais; guarde-os com cuidado.

## O QUE O PROGRESSO SIGNIFICA
As 6 etapas têm pesos iguais. O percentual é de percurso, não de domínio.
Comprendre: 10 leituras declaradas + 10 checkpoints respondidos.
Voir & écouter: 4 perguntas respondidas; o vídeo é opcional.
En contexte: 6 perguntas respondidas.
S’exercer: 20 perguntas respondidas.
Automatiser: ao menos uma rodada de 6 concluída até “Voir le résultat”.
Mettre en pratique: 6 perguntas respondidas.
O desempenho aparece separadamente, com a primeira e a última tentativa.
Não há certificado de proficiência, nota de pronúncia ou correção de redação.

## INTERNET, FONTES, VÍDEO E VOZ
Explicações e exercícios não exigem conexão. A família Inter é solicitada ao
Google Fonts quando há internet; sem ela, o navegador usa fontes de sistema
sem serifa. Não há arquivos de fonte distribuídos neste pacote.

Há uma cápsula provisória do canal Français Authentique. O YouTube só é
carregado após clique e depende de conexão e das permissões do player.
Em um HTML local, o vídeo pode ser bloqueado. O link “Ouvrir sur YouTube”
permanece disponível. O vídeo não é necessário para responder às questões.
A seleção provisória está identificada no aplicativo e em source/pilot-data.json.

Os botões de escuta usam síntese de voz do navegador, não áudio gravado.
A disponibilidade e a qualidade das vozes francesas dependem do aparelho.
Algumas vozes necessitam internet. Sem voz, a transcrição fica disponível.
Nesse caso, a atividade funciona como compreensão escrita. O aplicativo não
usa o microfone nem avalia a fala do aluno. A voz do coordenador não está
incluída nesta entrega.

## CUIDADOS COM O SALVAMENTO
O comportamento de armazenamento em arquivos file:// depende do navegador.
Modo anônimo, limpeza de dados, bloqueios, troca de nome ou pasta do HTML
podem remover ou separar os dados. Exporte antes de mudar de ambiente.
Evite estudar simultaneamente em duas abas. Ao detectar conflito, a interface
avisa e interrompe a gravação para proteger o estado da outra aba.

## CONFIRA NO SEU COMPUTADOR
Faça uma questão, feche e reabra o mesmo HTML e confira a retomada.
Depois exporte e importe em outro navegador, conferindo o resumo antes de
substituir. Esse teste local completa a validação das particularidades do
seu ambiente; não use somente o salvamento automático como cópia de segurança.

## TESTES E LIMITES DA VALIDAÇÃO
A pasta tests contém evidências e o relatório detalhado. Foram exercitados
navegação, 46 questões, feedback, drills, revisão, exportação/importação,
rejeição de dados inválidos e larguras de 320, 390, 768 e 1440 px em Chromium.

Neste ambiente, políticas do navegador bloqueiam a abertura de URLs locais.
A interface foi testada com o HTML injetado em uma página em branco; os
cenários de persistência usaram um substituto explícito de Web Storage.
A exportação por download e a seleção de arquivo para importação foram reais.
O caminho de armazenamento indisponível também foi exercitado sem esse
substituto. Isso não valida a persistência nativa file:// no seu aparelho.
Não houve execução em Firefox/Safari/Edge, aparelho móvel físico, reprodução
real do YouTube ou validação acústica das vozes francesas instaladas.
As capturas usam fonte sem serifa de contingência, pois a rede externa foi
bloqueada no teste. Nenhum resultado de teste vem pré-carregado no HTML.

O conteúdo e os distratores são uma adaptação editorial para o piloto.
A aprovação pedagógica final cabe ao coordenador antes de publicar o curso.
