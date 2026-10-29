# API compartilhada e implementações de referência

O que **já existe** para reaproveitar. Antes de escrever qualquer função utilitária, procure aqui.

1. Se a função está no `TJPRCore`, **use-a**.
2. Se não está, mas há uma **implementação de referência** num `_logic.js` (seção 3), **copie a versão indicada**, mantendo nome e comportamento, ou leve-a para o `core.js`, se essa for a tarefa.
3. Nunca escreva uma variante nova sem necessidade. Várias funções com o mesmo nome **já divergem** entre arquivos (ver os ⚠ abaixo).

---

## 1. `core.js` → `window.TJPRCore`

Para usar, carregue `core.js` antes do `_logic.js` e escreva `const C = window.TJPRCore;` ou desestruture as funções.

| Função | Assinatura | Comportamento e ressalvas |
|---|---|---|
| `escapeHtml` | `(s) → string` | Escapa `&`, `<`, `>`, `"` e `'`. Serve para texto **e** para valor de atributo (as aspas são tratadas desde a v3.24). |
| `csvEscape` | `(val) → string` | Põe entre aspas se houver `"`, `;` ou quebra de linha, e duplica as aspas. Pressupõe o separador `;`. |
| `normName` | `(s) → string` | Remove acentos (NFD), põe em MAIÚSCULAS, **apaga** tudo que não for A–Z ou espaço e colapsa espaços. Chave de cruzamento por nome dos Pontos 20 e 26. "D'ÁVILA" vira "DAVILA". |
| `detectDelimiter` | `(texto) → ';' \| ','` | Conta `;` e `,` na 1ª linha. |
| `parseCSV` | `(texto) → string[][]` | Parser com suporte a campos entre aspas, delimitador detectado sozinho, `\r\n`, `\r` e `\n`. Descarta linhas vazias. |
| `buildCleanTableHTML` | `(cols, rows, getCell) → html` | Tabela "limpa" para a área de transferência: borda de 1pt preta, sem fonte nem cor. O cabeçalho usa `<td>` em negrito, e não `<th>`, para o Word e o Excel não aplicarem estilo próprio. |
| `buildTSV` | `(cols, rows, getCell) → string` | Texto separado por tabulação. |
| `copyTableToClipboard` | `async (cols, rows, getCell, buttonEl, opcoes?)` | Copia a tabela como HTML + TSV via `ClipboardItem`, com alternativa por seleção e `execCommand`. Mostra "Copiado!" no botão. `opcoes.paragrafosApos`: parágrafos justificados colados abaixo da tabela, como o aviso de entrevistas dispensadas do Ponto 20. |
| `pdfToText` | `async (file) → string` | Exige `vendor/pdf.min.js` e `vendor/pdf.worker.min.js`. Agrupa os itens de texto por linha (Y) e ordena por X, o que reconstrói a leitura visual, inclusive de tabelas simples. Deixa uma linha em branco entre as páginas. |
| `seletorHora` | `(ancora, { valor:{h,m}\|null, aoEscolher(fn) })` | Seletor de horário próprio, com colunas de hora e minuto que não giram sem fim. Clicar de novo na âncora fecha. Fecha também com Esc, clique fora ou redimensionamento. Escolher o minuto encerra. Sem valor, abre às 08h. |
| `fecharSeletorHora` | `()` | Fecha o seletor aberto. |
| `reconhecerReserva` | `(texto) → { codigos, desconhecidos, semReserva }` | **Reconhecimento único de reserva (cota)** de todo o portal, desde a v3.24. Detalhes logo abaixo. |
| `RESERVAS` | `[{ codigo, rotulo, hercules, residencia }]` | Os 4 grupos (2.1.1 a 2.1.4), com a coluna do Hércules (`AFRO`, `PNE`, `INDÍGENA`, `VS`) e o grupo da Residência (`ppp`, `pcd`, `ind`; `null` na VS). |
| `colunaHercules` | `(codigo) → 'AFRO'…` | Código → coluna S/N do CSV do Hércules. |
| `grupoResidencia` | `(codigo) → 'ppp'…\|null` | Código → grupo de cota da Residência (`null` para 2.1.4). |

### `reconhecerReserva` em detalhe

- **Normalização:** o texto é comparado sem acento e em maiúsculas, em duas formas: com pontuação e só com letras. É assim que "Cad-Único" vira "CADUNICO".
- **`codigos`:** os radicais de `TERMOS_RESERVA` são procurados no texto **inteiro**. Por isso "Preto ou pardo e PcD" vale pelas duas cotas. O próprio código ("2.1.1") também vale.
- **`desconhecidos`:** o texto é quebrado em trechos por `, ; / |`. Cada trecho que não é cota nem "sem reserva" volta aqui, já normalizado, para virar aviso.
- **`semReserva`:** `true` quando o texto só diz "não é cotista". Os valores aceitos estão na lista `SEM_RESERVA`: vazio, "-", "N/A", "Não", "Nenhuma", "AC", "Ampla concorrência", "Geral", "Sem reserva", "Não cotista", "Não optante"…
- **Origem:** os termos são a **união** do que os Pontos 18, 20 e 26 e as três ferramentas da Residência aceitavam até a v3.23. Na unificação, um teste comparou as 6 implementações antigas com as novas em 115 textos. Nenhum texto antes reconhecido mudou de resultado. Os ganhos foram grafias que antes só uma ferramenta aceitava e o fim de avisos falsos para variações de "sem reserva".
- **Ao acrescentar um termo:**
  - edite `TERMOS_RESERVA` ou `SEM_RESERVA` no `core.js`;
  - confira que o radical não aparece dentro de termos de outra cota;
  - confira que textos que não são cota ("Lactante", "Atendimento especial", "Indeferida") continuam como desconhecidos.
- **O que cada ferramenta faz com o resultado:**
  - **Pontos 18 e 20** (`mapReserva`) escrevem os códigos.
  - **Ponto 26** (`reservaTextoParaCotas`) marca S/N nas colunas do Hércules.
  - **Residência** (`reservaDaModalidade`, `modalidadeParaCotas`) mantém a sua regra: "Ampla" ou "Geral" no texto anula a cota, e a VS não vale (vira aviso, ou é forçada a "N" no Hércules).

**Páginas que NÃO carregam `core.js`:**
- `edital.html` tem cópia própria do `pdfToText`, chamada `pdfParaTexto`.
- `fluxo.html` e `vagas_consulta.html`.
- `resultado_final.html` dispensa o core **de propósito**, para poder ser hospedada sozinha no futuro.

Ao levar utilitários para o core, decida caso a caso se essas páginas passam a depender dele.

## 2. Globais da moldura (não colida com estes nomes)

| Arquivo | Globais |
|---|---|
| `ferramentas.js` | `VERSAO_APP`, `SECOES`, `FERRAMENTAS`, `secaoDaFerramenta(t)`, `secaoPorId(id)`, `ordemFerramenta(t)`, `ferramentasDaSecao(id)`, `rotuloFerramenta(t)`, `ferramentaPorArquivo(arquivo)` |
| `jogos.js` | `JOGOS`, `rotuloJogo(j)`, `jogoPorArquivo(arquivo)` |
| `changelog.js` | `CHANGELOG` |
| `layout.js` | `escHtml`, `navHtml`, `wireDropdowns`, `fecharDropdowns`, `DSERFTA_EXTENSO`, `institutionalHtml`, `changelogHtml`, `wireChangelog`, `cardHtml`, `placeholderCardHtml`, `secaoHtml`, `wireSecretCounter`, `wireStepInfo` |
| `tjpr_logo.js` | `TJPR_LOGO_DATA_URI` (JPEG em base64). Teste `typeof TJPR_LOGO_DATA_URI !== 'undefined'` antes de usar |
| `edital_unidades_sei.js` | `UNIDADES_SEI` (`{ "SIGLA": "NIVEL1\|…\|NIVELN" }`, cerca de 2.000 siglas) |
| `edital_modelos.js` | `EDITAL_PARAS` |
| `vendor/` | `pdfjsLib`, `pdfjsWorker`, `XLSX` |

Os `_logic.js` ficam dentro de uma IIFE e não criam globais, exceto o objeto de depuração que cada um expõe: `window.RH`, `window.Fluxo`, `window.VagasConsulta`, `window.ResultadoFinal`, `window.__ED_TEST__`. Alguns exportam também por `module.exports`, para testes em Node.

---

## 3. Implementações de referência (ainda fora do `core.js`)

Estas funções existem em vários `_logic.js`, quase sempre como cópias. A coluna **Use** indica a versão recomendada para copiar ou para levar ao core. A coluna **⚠** registra as diferenças que **mudam o resultado**.

### Texto e normalização
| Necessidade | Use | Outras cópias | ⚠ |
|---|---|---|---|
| Escape para atributo HTML | **Com `core.js`:** o próprio `TJPRCore.escapeHtml`. **Sem `core.js`** (fluxo, vagas, resultado_final, edital): `escAttr` em `fluxo_logic.js` (escapa `"` e `'`) | `escAttr` também em hercules, convocação, classificação, ponto20 (continuam corretas: depois do escape do core não sobra aspa crua) | O `esc` local das páginas sem core **não** trata aspas |
| Tirar acentos | `semAcento` (residência, resultado_final, ponto18) | variações `normHeader`, `norm`, `normTxt`, `normBusca` | — |
| Chave de nome para cruzamento | `TJPRCore.normName` **ou** `chaveNome` (residência, resultado_final) | — | `normName` **apaga** o que não é letra ("DAVILA"); `chaveNome` troca por **espaço** ("D AVILA"). Não misture as duas no mesmo cruzamento |
| Só dígitos / limpar espaços | `soDigitos`, `limpar` (residência, resultado_final) | — | O `limpar` de `fluxo_logic.js` e o de `ponto26_logic.js` só fazem `trim`. O da Residência também colapsa espaços |
| Fechar frase com ponto | `comPontoFinal` | ponto14, ponto18, convocação | A do **ponto14** remove pontos repetidos. A do **ponto18** aceita `!` e `?` como final |
| Colapsar espaços | `colapsa` | ponto14, ponto20 | — |

### Números e notas
| Necessidade | Use | Outras cópias | ⚠ |
|---|---|---|---|
| Nota digitada → número | `paraNumero` (convocação, classificação, resultado_final) | — | Na Residência e no Resultado Final, a **digitação rápida** faz "85" virar 8,50, "770" virar 7,70 e "10" virar 10,00. A do **ponto18** é literal ("85" vira 85). Escolha conscientemente |
| Número → "7,50" | `fmtNota` (ponto18, residência, resultado_final), com 2 casas e vírgula | ponto20 `fmtNotaNum` | A do `edital_logic.js` **não fixa casas decimais** |
| Média e conferência da nota final | `calcularMedia`, `notaFinalDivergente` (classificação, resultado_final) | — | — |

### Datas, horas e prazos
| Necessidade | Use | Outras cópias | ⚠ |
|---|---|---|---|
| `dd/mm/aaaa` ↔ `Date` | `lerDataBarra` / `fmtDataBarra` do **ponto14** (valida o dia: 31/02 não passa) | ponto18; `formatarDataBarra` em convocação | A do **ponto18** aceita 1 ou 2 dígitos e **não valida** (31/02 vira 03/03) |
| Máscara de data no campo | `ativarMascaraData` | ponto14, ponto18 (com `mascararDataNoCampo` duplicada dentro do próprio arquivo), convocação | — |
| Data por extenso | `formatarDataExtenso` + `MESES_EXTENSO` (ponto18, ponto20, convocação, classificação) | `hojeExtenso` (edital, ponto14) | Formatos: "9 de outubro de 2026"; o Ponto 14 usa "09"; o Edital usa "Curitiba, …" |
| Próximo dia útil | `proximoDiaUtil` (ponto18, ponto20) | — | Pula só sábado e domingo, **não considera feriados** |
| Ler data escrita por extenso | `lerDataDoTexto` (convocação, classificação) | `lerDataExtenso` (ponto18) | — |
| Data de nascimento | `parseDataNascimento` (convocação, classificação), que aceita `dd/mm/aaaa` e `aaaa-mm-dd` | resultado_final; ponto20 `parseNascimento` | A do resultado_final aceita só `dd/mm/aaaa`. A do ponto20 aceita também o número de série do Excel |
| Idade (anos e dias) | `calcularIdade`, `calcularIdadeDetalhada`, `fmtIdadeDetalhada` (convocação, classificação) | — | — |
| Horário "14h00min" | `interpretarHora` + `fmtHora` + `ativarMascaraHora` do **ponto18** | `lerHora` (ponto14), `interpretarHoraDigitada` (convocação) | A máscara do ponto18 trava valores no formato "14h00min" |
| Duração "03h00min" | `lerDuracao` / `fmtDuracao` | edital, ponto14 | A do **edital** aceita mais de 23h |
| Botão 📅 ou 🕐 ao lado do campo | `ativarBotaoCalendario(el, {ler, escrever, compacto})`, `ativarBotaoRelogio(el, compacto)` e `embrulharComBotao` do **ponto18** (a mais completa) | ponto14, convocação (com `modo`), classificação | O relógio usa `TJPRCore.seletorHora`. CSS: `.date-pick-btn`, `.campo-data-wrap` |

### SEI, edital e unidade
| Necessidade | Use | Outras cópias | ⚠ |
|---|---|---|---|
| Máscara do número SEI `0000000-00.0000.8.16.6000` | `ativarMascaraSei` | ponto14, ponto18, convocação, classificação, resultado_final (idênticas); ponto20 tem a sua | — |
| Máscara do número do edital | `ativarMascaraEdital` (convocação, classificação) | — | — |
| Sigla SEI → nome por extenso | `nomeUnidadePorExtenso` + `conectorDeGenero` | edital, vagas, resultado_final (duplicação declarada nos comentários) | Exige `edital_unidades_sei.js` |

### Reservas (cotas)
| Necessidade | Onde está | ⚠ |
|---|---|---|
| Qualquer texto de reserva → códigos 2.1.x | **`TJPRCore.reconhecerReserva`** (seção 1), único desde a v3.24 | — | Não crie mapa próprio de termos |
| Texto → código (Pontos 18 e 20) | `mapReserva` (adaptador: `{ code:'2.1.1, 2.1.2', desconhecidos }`) | — | — |
| Texto do cadastro → colunas S/N do Hércules | `reservaTextoParaCotas` (ponto26) + `TJPRCore.colunaHercules` | — | — |
| Código impresso no edital → colunas do Hércules | `MAPA_CODIGO` (derivado de `TJPRCore.RESERVAS`) + `codigoEditalParaCotas` (ponto26) | — | — |
| Modalidade da Lista de dados (Residência) | `reservaDaModalidade` (convocação, classificação) e `modalidadeParaCotas` (hercules), sobre o core | — | Regra própria: "Ampla" ou "Geral" no texto anula a cota; VS não vale na Residência |
| Rótulos que o Resultado Final grava | `RESERVAS` em `resultado_final_logic.js` (a página não carrega o core) | — | Precisam continuar reconhecidos pelo core (o Ponto 20 lê esse CSV) |

Detalhes das regras em [`dominio.md`](dominio.md) § Reservas.

### Planilhas e PDFs
| Necessidade | Use | Outras cópias | ⚠ |
|---|---|---|---|
| Ler XLSX como matriz e achar a linha de cabeçalho | `lerPlanilha` (ponto18, com `header:1` e `blankrows:false`) + `localizarCabecalho`; `lerMatrizFabrica` (convocação) | `matrizDaPlanilha` (ponto14); ponto20 `readWorkbookFile` (objetos, `raw` padrão); ponto26 (objetos, `raw:false`) | Com `raw` padrão, datas chegam como **número de série do Excel** e o CPF perde o zero à esquerda |
| Achar coluna pelo nome | `findCol` (ponto20, ponto26) | `acharColuna` (ponto14), `localizarCabecalho` (ponto18) | Compare sempre normalizando (sem acento, maiúsculas) |
| Número de inscrição | `normInscricao` (ponto20) | `limpaInscricao` (ponto14) | — |
| PDF → texto corrido | `TJPRCore.pdfToText` | `pdfParaTexto` (edital, cópia idêntica) | — |
| PDF → linhas com coordenadas (tabelas, blocos) | `pdfParaPaginas` + `agruparLinhas` + `linhasDasPaginas` (residência) | — | Melhor que `pdfToText` quando a tabela tem células quebradas em várias linhas |
| Formulário de abertura do SEI (PDF) | `parseFormulario` (edital, com mapa de rótulos `LABELS`) | `campoForm` + `normComMapa` (ponto14) | Dois algoritmos diferentes para o mesmo formulário |
| "Lista de dados dos inscritos" (Residência) | `reconhecerLista`, `registroDaLinhaLista`, `extrairTelefone` (convocação, classificação, com 7 colunas e nascimento) | hercules (6 colunas, **sem** nascimento) | Já divergiram (backlog) |
| CPF com 11 dígitos | `normalizarCPF` (ponto26, hercules) | — | Recompõe o zero à esquerda perdido no Excel |

### Saídas
| Necessidade | Use | Outras cópias | ⚠ |
|---|---|---|---|
| CSV (BOM + `;` + CRLF) | `gerarCSV` (hercules, usa `TJPRCore.csvEscape`) | download em ponto20 e ponto26 (idênticos); `escCampo` (resultado_final) | — |
| Baixar arquivo | `baixarArquivo` | fluxo `(conteudo, nome, tipo)`, resultado_final `(nome, conteudo, tipo)` | **Ordem dos argumentos invertida** entre os dois |
| Copiar tabela | `TJPRCore.copyTableToClipboard` | — | — |
| Copiar bloco formatado para o Athos ou o SEI | Copiar, copiar tudo, imprimir e editar texto em `residencia_convocacao_logic.js` (padrão mais recente); `copiarConteudoEm` no ponto18 | classificação (idêntica), edital, ponto14 | Para colar no **editor do SEI**, use o caminho do `edital_logic.js` (ouvinte de `copy` com HTML limpo), que evita a faixa cinza. O ponto14 ainda usa o método antigo (`copiarSelecaoViva`) |
| Classes → estilo em linha (o Athos descarta `style`) | `aplicarEstilosInline` / `htmlComEstilosInline` | edital, ponto14 | O mesmo nome com regra diferente: `.ed-j` é justificado no edital e alinhado à esquerda no ponto14 |
| PDF por janela de impressão | o padrão `window.open` + `document.write` + `print()` | edital, ponto14, ponto18, convocação, classificação, fluxo | Entrelinhas diferentes por documento |
| PDF de verdade | `construirPdf` (resultado_final) | — | Única implementação. Helvetica WinAnsi (cuidado com caracteres fora do Latin-1) |

### Interface e comportamento
| Necessidade | Use | Outras cópias | ⚠ |
|---|---|---|---|
| Grade com arrastar e soltar + Alt+↑/↓ | `ponto20_logic.js` (delegação de eventos na tabela) ou `residencia_convocacao_logic.js` (grupos por cota, `moverParaAoLadoDe`) | 8 cópias: ponto14, ponto18, ponto20, convocação, classificação, hercules, fluxo, resultado_final | O CSS de arrasto só cobre `cv-grade-table`, `rh-edit-table` e `fluxo-table` (a `rf-tabela` está sem estilo) |
| Rascunho `.json` (exportar e abrir, com migração) | ponto18 (`versao:2`, migra a 1) | edital, ponto14, convocação, classificação | Formato `{ ferramenta, versao, … }` |
| Abrir e fechar a caixa flutuante de rascunho | qualquer uma (7 cópias idênticas) | edital, ponto14, ponto18, convocação, classificação, fluxo, resultado_final | — |
| Painel que abre por botão-link | `alternarPainel(btnId, painelId, textoAbrir, textoFechar)` | ponto14, ponto18 | — |
| Aviso flutuante temporário (`.fluxo-aviso`) | `avisar` | fluxo, vagas, resultado_final | — |
| Mensagem de status e lista de avisos | `status(el, html, tipo)` e `lista(itens, render, limite)` (residência) | ponto18 `status` (outra assinatura); `listaHtml` (ponto20, ponto26, resultado_final), `listaAviso` (ponto20) | — |
| Rolar até um elemento | `rolarAte` | ponto18, convocação, classificação | — |
| Ordenar por nota + idade | `reordenarPorNotaEIdade` (convocação, classificação) | resultado_final | Ver [`dominio.md`](dominio.md) § Desempate |
| Cliente Supabase | `cabecalhosNuvem` + funções de leitura e gravação | fluxo, vagas | Configuração repetida 2 vezes (ver [`nuvem-supabase.md`](nuvem-supabase.md)). Nunca para dados de candidatos |

---

## 4. Como levar um utilitário para o `core.js` (quando for a tarefa)

1. Escolha a versão de referência da tabela acima e liste as divergências das outras cópias.
2. Acrescente a função ao `TJPRCore`, num bloco comentado, com nome em pt-BR. Quando as variantes forem legítimas, exponha-as como **opções explícitas** (ex.: `paraNumero(txt, { digitacaoRapida:true })`) em vez de escolher uma em silêncio.
3. Migre **uma ferramenta por vez**: troque a cópia local pela chamada ao core, teste a ferramenta no navegador com arquivos fictícios e registre a mudança como patch no changelog.
4. Nas páginas que não carregam `core.js` (Edital, Fluxo, Vagas, Resultado Final), decida com o usuário antes de criar a dependência.
5. Atualize esta tabela e o `backlog-tecnico.md`.
