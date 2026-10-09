# Catálogo de ferramentas

Uma ficha por página. As funções citadas estão no `_logic.js` da ferramenta, salvo quando outro arquivo é indicado. Regras de negócio detalhadas em [`dominio.md`](dominio.md); problemas conhecidos em [`backlog-tecnico.md`](backlog-tecnico.md).

**Visão geral**

| Página | Seção (registro) | Prefixo de ids | Lê | Gera | Persistência |
|---|---|---|---|---|---|
| `edital.html` | sps · "Edital" | `ed` | PDF do formulário de abertura (SEI) | 6 blocos Athos, PDF | rascunho .json |
| `ponto_14.html` | sps · Ponto 14 | `p14` | PDF do formulário + Relatório de Inscritos (.xlsx/.csv) | 7 peças Athos, PDF | rascunho .json |
| `ponto_18.html` | sps · Ponto 18 | `p18` | Relatório de convocação para entrevistas (.xlsx) | documento + PDF, 7 blocos Athos, e-mails | rascunho .json |
| `ponto_20.html` | sps · Ponto 20 | `p20` | Classificação Final (.xlsx ou manual) + Inscritos (.xlsx) | tabela para copiar, CSV, textos | nenhuma |
| `ponto_26.html` | sps · Ponto 26 | (sem prefixo) | PDF do Edital de Classificação Final + Inscritos (.xlsx) | CSV de importação no Hércules | nenhuma |
| `residencia_convocacao.html` | residência | `cv` | PDF da Lista de dados + relatório de aprovados (.xlsx, opcional) | 6 blocos Athos, PDF | rascunho .json |
| `residencia_classificacao.html` | residência | `cf` | PDF da Lista de dados | 6 blocos Athos, PDF | rascunho .json |
| `residencia_hercules.html` | residência | `ed`/`li`/`rh` | PDF do Edital de Classificação Final + PDF da Lista de dados | CSV de importação no Hércules | nenhuma |
| `fluxo.html` | fluxo | `fx`/`fluxo-` | — (é o próprio documento) | PDF, cópia .json | **Supabase** + localStorage |
| `vagas_consulta.html` | gestão | `vg` | planilha de controle de vagas (.xlsx/.xlsm) | consulta na tela | **Supabase** + localStorage |
| `resultado_final.html` | externas · UE | `rf` | digitação | PDF real, CSV | localStorage + .json (sem nuvem desde a v3.24) |
| `index.html` | — | — | — | índice | — |
| `jogos.html`, `flappy.html`, `arkanoia.html` | (JOGOS) | — | — | — | localStorage (Flappy) |
| `residencia_ensalamento.html` | **fora do registro** | — | — | — | — |

---

## Estágio — Seção de Processo Seletivo (`sps`)

### Gerador do Edital de Abertura — `edital.html`

| | |
|---|---|
| **Arquivos** | `edital_logic.js`, `edital_modelos.js` (gerado), `edital_unidades_sei.js` (gerado) |
| **Bibliotecas** | `vendor/pdf.*`. ⚠ **Não carrega `core.js`**: tem cópias locais (`pdfParaTexto`, `esc`, `$`) |
| **Passos** | (1) Envie o formulário respondido (PDF do SEI) → (2) Confira e ajuste as respostas → (3) Texto final do edital |

**Como funciona**
- O texto sai de **40 modelos oficiais** (`EDITAL_PARAS`), filtrados por 6 eixos definidos em `AXES_DEF`:
  - tipo de estágio, obrigatório ou não (só existe para Graduação);
  - modalidade, presencial ou on-line;
  - nível: Médio, Graduação ou Pós;
  - entrevista, com ou sem;
  - consulta durante a prova;
  - webcam (só para prova on-line sem consulta).
- Os campos editáveis ficam em `FIELDS`, com valor padrão, grupo e visibilidade por eixo.
- `parseFormulario` lê o PDF do formulário por rótulos (`LABELS`).
- A sigla da unidade sugere o nome por extenso (`nomeUnidadePorExtenso`). A sugestão fica **marcada para conferência** até a pessoa editar o campo.
- Prazo e duração da prova são lidos de textos livres ("3 (três) horas", "das 9h às 12h") por `lerDuracao`. O que não for entendido fica em branco, com aviso.

**Saídas**
- 6 blocos para o Athos (HTML com estilos em linha), "Copiar tudo", PDF por impressão e rascunho .json (`{ferramenta:'edital_abertura', versao:1, …}`).
- A cópia usa um ouvinte de `copy` com HTML limpo, o que evita a faixa cinza no editor do SEI. É a referência para cópias novas.

**Armadilhas**
- O campo Número do edital vem com `EDITAL N° $$(numerar automaticamente)%%`, que o Athos substitui ao salvar.
- O bloco de data sai como "Curitiba, … ." (as outras ferramentas tiraram a cidade e o ponto; ver backlog).
- O assinante padrão está em `FIELDS.ASSINANTE_*`.

### Ponto 14 — Gerador do Edital de Ensalamento — `ponto_14.html`

| | |
|---|---|
| **Arquivos** | `ponto14_logic.js` (**ES5**: `var`/`function`; seções A–K) |
| **Bibliotecas** | `vendor/pdf.*`, `vendor/xlsx.min.js`, `core.js` |
| **Passos** | (1) Formulário de abertura (PDF do SEI) → (2) Relatório de inscritos (Fábrica de Provas) → (3) Confira e ajuste os dados → (4) Blocos para o Athos |

**Como funciona**
- Lê o formulário (`campoForm` + `normComMapa`, algoritmo diferente do Edital) para obter data, horário e local da prova.
- Filtra as inscrições **DEFERIDAS** e ordena em ordem alfabética (`localeCompare('pt-BR')`).
- Normaliza o endereço (`analisarEndereco`: logradouros, abreviaturas, UF, CEP; sem CEP, sai "CEP XXXXXX").
- Avisa quando o texto parece cortado (`pareceTruncado`).
- A tabela é editável, com arrastar e soltar.

**Saídas**
- 7 peças do Athos: 1, 2a "ENSALAMENTO", 2b unidade, 3 só o número SEI, 4 conteúdo, 5 data **sem cidade e sem ponto**, 6 assinatura.
- PDF (o cabeçalho é reconstruído) e rascunho .json (`ponto14-ensalamento`).

**Armadilhas**
- Ainda copia pelo método antigo (`copiarSelecaoViva` + `execCommand`), que pode gerar a faixa cinza no SEI.
- Usa `escapeHtml` dentro de `value="…"` e `aria-label`. Era bug latente com aspas, resolvido na v3.24 com o escape de aspas no core.
- O CSS `.ed-*` está duplicado do `edital.html`, com `.ed-j` alinhado à esquerda.
- Exporta por `module.exports` para testes em Node, mas os testes não estão no repositório.

### Ponto 18 — Convocação para Entrevista — `ponto_18.html`

| | |
|---|---|
| **Arquivos** | `ponto18_logic.js` (**ES5**; seções A–J), `tjpr_logo.js` |
| **Bibliotecas** | `vendor/xlsx.min.js`, `core.js` |
| **Passos** | (1) Relatório de convocação para entrevistas → (2) Alocar os convocados nos dias → (3) Dados da convocação → (4) Convocação gerada → (5) Blocos para publicar no Athos → (6) Lista de e-mails para o SEI |

**Como funciona**
- Lê o .xlsx (`lerPlanilha` + `localizarCabecalho`).
- Descarta reprovados, eliminados, desclassificados e ausentes.
- A reserva vem do grupo do cadastro (`mapReserva`, sobre `TJPRCore.reconhecerReserva`).
- **Modelo de dados:**
  - cada candidato guarda um `diaId`;
  - os dias são entidades próprias (quadro `.bloco-dia`; tudo começa em "A atribuir");
  - as colunas DATA e HORÁRIO são **derivadas** da alocação.
- Avisa quando há empate na menor nota convocada.
- Avisa quando falta o link da sala na modalidade on-line.

**Saídas**
- Documento com logotipo (PDF por impressão).
- 7 blocos do Athos (os blocos 2 a 4 em texto puro, `BLOCOS_TEXTO_PURO`).
- Lista de e-mails separada por `; ` e assunto do e-mail.
- Rascunho .json (`ponto18`, **versao 2**, com migração da 1). É a referência de rascunho.

**Referências para reaproveitar:** `ativarBotaoCalendario`, `ativarBotaoRelogio`, `embrulharComBotao`, `interpretarHora`/`fmtHora`, `copiarConteudoEm`.

### Ponto 20 — Edital de Classificação Final — `ponto_20.html`

| | |
|---|---|
| **Arquivos** | `ponto20_logic.js` (ES6, sem `'use strict'`) |
| **Bibliotecas** | `vendor/xlsx.min.js`, `core.js` |
| **Passos** | (1) Tabela 1, Classificação Final (.xlsx) **ou** "Informar classificação manualmente" → (2) Tabela 2, Relatório de inscritos → (3) Número do SEI → (4) Quantidade máxima de classificados (opcional) → (5) Entrevistas dispensadas (opcional) → resultados: Nome do documento, Classificação, Tabela, Data para colar no Athos, Assinatura |

**Como funciona**
- Cruza por **inscrição** e, na falta dela, por nome normalizado.
- Descarta REPROVADO, DESCLASSIFICADO e ELIMINADO.
- A reserva da Tabela 2 prevalece sobre a da Tabela 1. Os códigos 2.1.x vêm de `mapReserva`, sobre `TJPRCore.reconhecerReserva` (o reconhecimento único do portal).
- A coluna RESERVA só é suprimida quando está comprovadamente vazia.
- **Modo manual:**
  - aceita texto colado (PDF, Excel ou Word) ou digitação linha a linha;
  - só nome e nota são obrigatórios;
  - a ordem é a das linhas (arrastar, Alt+↑/↓ ou "Ordenar por nota");
  - empates são desempatados pelo **mais velho** (data de nascimento da Tabela 2), sempre com aviso.
- **Entrevistas dispensadas:** inclui o aviso padrão abaixo da tabela (prévia e "Copiar tabela") e confere se a nota FINAL é igual à da PROVA.

**Saídas**
- Tabela via `TJPRCore.copyTableToClipboard`.
- CSV `ponto20_classificacao_final_AAAA-MM-DD.csv` (BOM, `;`, CRLF).
- Textos para o Athos.

**Armadilhas**
- `escAttr` local não escapa `'`.
- Há duas funções de lista de avisos (`listaHtml`, `listaAviso`).

### Ponto 26 — Arquivo para importar no Hércules — `ponto_26.html`

| | |
|---|---|
| **Arquivos** | `ponto26_logic.js` (ES6, sem `'use strict'`, **CRLF**, ids sem prefixo) |
| **Bibliotecas** | `vendor/pdf.*`, `vendor/xlsx.min.js`, `core.js` |
| **Passos** | (1) PDF do Edital de Classificação Final, extraído sozinho, ou colagem manual → (2) Relatório de Inscritos (.xlsx; .csv legado aceito) → Processar |

**Como funciona**
- O PDF é lido por `TJPRCore.pdfToText` + `pdfTextToTabela1Lines`, que remonta nomes quebrados em duas linhas e aceita vários códigos de reserva por linha.
- Cruza **só por nome** (`normName`), embora a Tabela 1 tenha a inscrição.
- As INDEFERIDAS são descartadas.
- A reserva do **cadastro prevalece** (`reservaTextoParaCotas`); o código do edital serve para conferência (`codigoEditalParaCotas`). Reserva desconhecida vira "N", **com aviso**.
- O CPF é recomposto com 11 dígitos (`normalizarCPF`) e o telefone fixo recebe o celular.

**Saída:** CSV `tabela_final_classificacao_AAAA-MM-DD.csv` com 11 colunas (`OUT_COLS`): Classificação, CPF, Nome do candidato, Nota final, E-mail, Telefone celular, Telefone fixo, PNE, VS, AFRO, INDÍGENA.

**Armadilhas:** a descrição no registro ainda diz "(CSV)" para a entrada de cadastro, mas hoje a ferramenta lê .xlsx.

---

## Residência (`residencia`)

As três ferramentas compartilham utilitários copiados (`semAcento`, `chaveNome`, `paraNumero` com digitação rápida, leitura de PDF por coordenadas, leitura da "Lista de dados dos inscritos"). Os grupos de cota são `ac`, `ppp`, `pcd` e `ind`.

### Gerador do Edital de Convocação para Entrevista — `residencia_convocacao.html`

| | |
|---|---|
| **Arquivos** | `residencia_convocacao_logic.js` (ES6, `'use strict'`) |
| **Bibliotecas** | `vendor/pdf.*`, `vendor/xlsx.min.js`, `core.js` |
| **Passos** | (1) Lista de dados dos inscritos (PDF → quadro editável de 7 colunas; aceita o formato antigo de 6) + relatório de aprovados da Fábrica (.xlsx, opcional) → (2) Selecionar candidatos (todos começam desmarcados) → (3) Tabelas de convocação por cota → (4) Dados do edital → (5) Edital gerado |

**Regras**
- Todos entram na Ampla. O cotista aparece também na tabela da sua cota.
- Há uma única ordem de trabalho, e cada tabela é um recorte dela (`moverParaAoLadoDe`).
- A modalidade é mapeada por `reservaDaModalidade`, sobre `TJPRCore.reconhecerReserva`. A VS (2.1.4) **não** marca cota na Residência e gera aviso.
- **Desempate:** `reordenarPorNotaEIdade`, com a nota decrescente e, no empate, o mais velho pela data.
- O relatório da Fábrica é cruzado por nome (`cruzarComFabrica`): os aprovados já vêm marcados e com nota, e as pendências de monitoramento são sinalizadas.
- Excluir na tabela da Ampla remove o candidato de tudo; nas outras tabelas, só desmarca aquela cota.

**Saída:** 6 blocos do Athos (Times 11pt, estilos em linha), PDF e rascunho .json (`versao:2`). O Bloco 3 sai só com o número do processo.

### Gerador do Edital de Classificação Final — `residencia_classificacao.html`

| | |
|---|---|
| **Arquivos** | `residencia_classificacao_logic.js` |
| **Bibliotecas** | `vendor/pdf.*`, `core.js` |
| **Passos** | (1) Lista de dados → (2) Selecionar → (3) Tabelas de classificação → (4) Dados do edital → (5) Edital gerado |

- **Regras:** a estrutura é a mesma da Convocação, com três notas: prova, entrevista e final (`calcularMedia`). Se a nota final for editada e não bater com a média, ela aparece sinalizada (`notaFinalDivergente`). O desempate usa a nota final.
- **Saída:** 6 blocos (o preâmbulo vem sem a linha do Tribunal, porque o Athos já a imprime), PDF e rascunho .json.
- **Armadilha:** o HTML diz que o Bloco 1 "não sai no PDF", mas `imprimirPdf` e `copiarTudo` o incluem.

### Gerar arquivo para importar no Hércules (Residência) — `residencia_hercules.html`

| | |
|---|---|
| **Arquivos** | `residencia_hercules_logic.js` (expõe `window.RH`) |
| **Bibliotecas** | `vendor/pdf.*`, `core.js` |
| **Passos** | (1) Edital de Classificação Final (PDF) → (2) Lista de dados dos inscritos (PDF) → (3) Cruzar e gerar |

**Regras**
- O edital é lido por blocos de proximidade vertical (`reconhecerEdital`). A nota final é o decimal mais à direita.
- A **ordem de chamamento** (Decisão 11697384) é montada por `montarChamamento` a partir de `ORDEM_VAGAS`, conforme [`dominio.md`](dominio.md).
- O cruzamento é por `chaveNome`, com aproximação controlada (`acharAproximado`).
- As cotas S/N vêm da **modalidade** da Lista (`modalidadeParaCotas`, sobre `TJPRCore.reconhecerReserva`). VS é forçado para "N".
- O CPF é completado com zeros e o telefone fixo recebe o celular.

**Saída:** CSV com as mesmas 11 colunas do Ponto 26 (`COLS_CSV`) e grade de conferência editável (`rh-edit-table`). O CSV reproduz o que está na tela.

**Armadilha:** o leitor da Lista tem 6 colunas, **sem nascimento**. Colar o quadro de 7 colunas da Convocação desloca os dados.

### `residencia_ensalamento.html` (órfã)

Página reservada ("Em desenvolvimento"), **sem `_logic.js` e fora de `FERRAMENTAS`**: nenhum menu leva até ela. Antes de construir a ferramenta, decida com o usuário se ela deve existir.

---

## Fluxo de Processo Seletivo (`fluxo`)

### Editor do Fluxo — `fluxo.html`

| | |
|---|---|
| **Arquivos** | `fluxo_logic.js` (ES6; expõe `window.Fluxo`). Usa `body.pagina-larga` |
| **Bibliotecas** | nenhuma. ⚠ Não carrega `core.js` |

**Como funciona**
- O quadro **é** o documento: cada linha traz fase (com cor), atividade, responsáveis, número da etapa e as marcações **Ponto**, **Tag** e **Vinculação**.
- As células são `contenteditable` (colagem só em texto puro; Enter bloqueado).
- As linhas se movem com setas, arrasto ou Alt+setas. Excluir oferece "Desfazer".
- **Fonte da verdade:** a nuvem (`carregar` tenta a nuvem, depois a cópia local, depois o `QUADRO_SEMENTE`).
- **Gravação:** salva sozinho 1 segundo depois de cada mudança (`agendarGravacao`), além do botão Salvar. Vale a última gravação.
- **Saídas:** PDF A4 paisagem e cópia de segurança .json (restaurar sobrescreve o quadro para todos, com confirmação).
- **Contrato:** `{version:4, savedAt, rows:[{phase,color,activity,owners,stage,classifications}]}`, com chaves **em inglês** de propósito. Ver [`nuvem-supabase.md`](nuvem-supabase.md).

---

## Divisão de Gestão (`gestao`)

### Consulta de Vagas Disponíveis por Unidade — `vagas_consulta.html`

| | |
|---|---|
| **Arquivos** | `vagas_consulta_logic.js` (expõe `window.VagasConsulta`) |
| **Bibliotecas** | `vendor/xlsx.min.js`. ⚠ Não carrega `core.js` |

**Como funciona**
- **Busca:**
  - por sigla, comarca, tipo ou nome;
  - todos os termos precisam bater (AND);
  - a pontuação favorece a sigla exata;
  - filtros por entrância e por Gab/Sec;
  - paginação de 80 em 80;
  - comparação lado a lado das unidades marcadas.
- **Planilha de controle** (.xlsx/.xlsm):
  - aba `HERC_VPU` (Sigla e NomeUnidade);
  - aba `GERAL`, com 3 linhas de cabeçalho e os grupos DISPONIBILIZADAS, OCUPADAS, PROVIS_DISP e PROVIS_OCUP, cada um com EM, G e PG, além das colunas SIGLA, ENTRANCIA etc.;
  - se faltar uma coluna, aparece erro explícito.
- **Cálculo:** vagas livres = `max(0, disponibilizadas − ocupadas)`. `formatarPrazo` entende o número de série do Excel.
- **Atualização:** enviar a planilha **substitui tudo para todos**, depois da prévia e do "Confirmar".

---

## Unidades Externas (`externas`)

### Criação da tabela de resultado final — `resultado_final.html`

| | |
|---|---|
| **Arquivos** | `resultado_final_logic.js` (seções A–H; expõe `window.ResultadoFinal`), `tjpr_logo.js`, `edital_unidades_sei.js` |
| **Bibliotecas** | nenhuma. **Não carrega `core.js` de propósito**: foi pensada para poder ser hospedada sozinha. O CSS próprio (`rf-`) fica na página |
| **Passos** | Como deseja começar? (novo ou continuar) → (1) Informações básicas (unidade com autocompletar a partir de `UNIDADES_SEI`, SEI) → (2) Tabela de candidatos (sempre em edição) → (3) Finalizar preenchimento → (4) Documentos |

**Para que serve:** a comarca ou unidade que conduz o próprio processo seletivo informa as notas **sem** usar a Fábrica de Provas. O resultado sai no modelo do Relatório de Classificação Final, com colunas iguais às da Tabela 1 do Ponto 20.

**Regras**
- `RESERVAS`: rótulos por extenso que o reconhecimento do core (`TJPRCore.reconhecerReserva`, usado pelo Ponto 20) entende sem aviso.
- Avisos: nota final divergente, inscrição repetida, nota fora de 0–10, empate sem data.
- Ordenação por nota (desempate pela idade) ou alfabética.
- "Finalizar" valida (unidade, SEI completo, ao menos um candidato), trava a edição e libera os documentos. "Editar" destrava.

**Saídas**
- **PDF de verdade** (`construirPdf`) em formato documentado para leitura por máquina: cabeçalho fixo e colunas CLASSIFICAÇÃO | INSCRIÇÃO | NOME | E-MAIL | PROVA | ENTREVISTA | FINAL | RESERVA | NASCIMENTO.
- CSV aceito pelo Ponto 20.
- Rascunho no localStorage (`tjpr_resultado_final_rascunho_v1`, gravado 1 segundo depois de cada mudança) e em .json (`pacoteAtual`/`aplicarPacote`).

**Sem nuvem (desde a v3.24):** nada é enviado pela internet. Até a v3.23, cada preenchimento era gravado no Supabase (`resultado_final_unidades`), com uma área administrativa atrás de PIN. Isso saiu para não manter dados pessoais de candidatos numa base compartilhada. Ver [`nuvem-supabase.md`](nuvem-supabase.md) para a limpeza da base.

**Rodapé:** variante própria do aviso, voltada à unidade: "O documento gerado é um apoio de trabalho — a conferência das notas e da classificação é responsabilidade da unidade."

**Armadilhas**
- A `rf-tabela` está sem CSS de arrasto (BT-11).
- A página não carrega o `core.js`. Para atributos, use o `escAttr` local.

---

## Moldura e zona secreta

| Página | Notas |
|---|---|
| `index.html` | Índice por seções (`.tool-sections`). O cartão "Próxima ferramenta" da SPS é a porta secreta: 10 cliques seguidos (com menos de 1,5 s entre eles) levam a `jogos.html` |
| `jogos.html` + `jogos.js` | Grade de jogos (`.tool-grid[data-registro="jogos"]`) |
| `flappy.html` + `flappy_logic.js` | Flappy Bird em ASCII. Recordes no localStorage (`tjpr_flappy_scores`) |
| `arkanoia.html` | Iframe de um build Godot hospedado em outro repositório do GitHub Pages. O "ranking global" é do jogo externo, não deste projeto |

Os rodapés dos jogos repetem o aviso das ferramentas, que fala em "lançamento no Hércules".
