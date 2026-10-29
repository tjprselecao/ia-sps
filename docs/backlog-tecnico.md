# Backlog técnico

Problemas conhecidos e oportunidades de melhoria encontrados na análise da versão 3.23 (2026-10-09). Revisado na **v3.24** (2026-10-09): BT-02, BT-03 e BT-10 resolvidos; BT-01 em parte. O resto continua **sem alteração**.

Antes de corrigir um item:
1. Confirme que ele ainda existe, porque o código pode ter mudado.
2. Combine a correção com o usuário quando ela mudar comportamento visível ou documento publicado.

Ao corrigir:
1. Mova o item para **Resolvidos**, com a versão.
2. Registre a correção no changelog.

**Gravidade:**
- **Alta:** risco de dado errado, perda de dado ou exposição.
- **Média:** bug com contorno ou risco de manutenção relevante.
- **Baixa:** consistência e qualidade.

---

## Alta

### BT-01 · Dados de candidatos na nuvem — PARCIALMENTE RESOLVIDO (v3.24)
- **Arquivos:** `resultado_final_logic.js`, `resultado_final.html`, `Recursos/resultado_final_unidades_limpeza.sql`
- **Era:** o Resultado Final gravava no Supabase nome, e-mail, notas e nascimento de candidatos, numa tabela aberta ao papel anônimo (leitura, gravação e exclusão). A área administrativa era protegida só por um PIN de interface.
- **Feito na v3.24:** a ferramenta deixou de usar a nuvem (100% local), e a área administrativa e o PIN saíram.
- **Falta (operacional):** rodar **uma vez** a versão final de `Recursos/resultado_final_unidades_limpeza.sql` no SQL Editor do Supabase. Ele fecha e esvazia `resultado_final_unidades` **e** `resultado_final_historico`, e remove o gatilho que cancelava as exclusões, sem tocar em `fluxo_estado` nem em `vagas_estado`. Feito isso, o item vai para Resolvidos.
- **Descoberto na limpeza:** a tabela de histórico e o gatilho tinham sido criados direto no Supabase e não constavam do repositório. Antes de mexer na base, confira sempre o que existe lá (tabelas, gatilhos, policies), e não só os `.sql` de `Recursos/`.
- **Observação:** cada navegador que usou a ferramenta ainda guarda o próprio rascunho em localStorage. Ele é local e some com "Novo preenchimento" ou com a limpeza dos dados do site.

## Média

### BT-04 · Ponto 14 copia pelo método antigo (faixa cinza no SEI)
- **Arquivo:** `ponto14_logic.js` (`copiarSelecaoViva` + `execCommand('copy')`)
- **Problema:** o Edital de Abertura trocou esse método (v3.21.2) porque o editor do SEI exibia fundo cinza ao colar. O comentário do Ponto 14 afirma usar "o mesmo caminho do Gerador do Edital de Abertura", o que não é verdade.
- **Sugestão:** adotar o ouvinte de `copy` com HTML limpo de `edital_logic.js`.

### BT-05 · Classificação da Residência: Bloco 1 sai no PDF
- **Arquivos:** `residencia_classificacao.html` / `residencia_classificacao_logic.js` (`imprimirPdf`, `copiarTudo`)
- **Problema:** a página diz que o Bloco 1 (nome do documento) "não sai no PDF", mas o PDF e o "Copiar tudo" incluem os blocos 1 a 6.
- **Sugestão:** confirmar com o usuário qual é o comportamento certo e alinhar o código ao texto, ou o texto ao código.

### BT-06 · Hércules da Residência: leitor da Lista sem nascimento
- **Arquivo:** `residencia_hercules_logic.js` (`reconhecerLista`, `registroDaLinhaLista`)
- **Problema:** o leitor espera 6 colunas, enquanto a Convocação e a Classificação leem 7, com nascimento. Colar o quadro de 7 colunas desloca a data para o campo de celular.
- **Sugestão:** unificar o leitor da Lista de dados (ver BT-15), aceitando 6 e 7 colunas.

### BT-07 · Gerador de unidades pode gravar arquivo vazio sem erro
- **Arquivo:** `Recursos/gerar_edital_unidades_sei.py`
- **Problema:** só lê células com texto em linha (`<t>`) e só a primeira aba. Se a exportação passar a usar *shared strings*, nenhuma linha é lida e o `edital_unidades_sei.js` é sobrescrito vazio.
- **Sugestão:**
  - ler `xl/sharedStrings.xml`;
  - **abortar com erro** se nenhuma unidade for lida ou se a contagem cair muito em relação ao arquivo atual.

### BT-08 · SQL incompleto ou que não pode ser rodado de novo
- **Arquivos:** `Recursos/vagas_estado.sql`; falta um SQL para `fluxo_estado`
- **Problema:**
  - `vagas_estado.sql` usa `create policy` sem `drop policy if exists`, então para ao ser rodado de novo;
  - a tabela do Fluxo não tem script de criação no repositório, e não há como recriar o ambiente.
- **Sugestão:** seguir o modelo de `resultado_final_unidades.sql` e criar `Recursos/fluxo_estado.sql`.

### BT-09 · Fluxo: gravações simultâneas se sobrescrevem
- **Arquivo:** `fluxo_logic.js` (`agendarGravacao`)
- **Problema:** o salvamento automático regrava o quadro inteiro e vale a última gravação, sem aviso.
- **Sugestão:** comparar o `updated_at` lido com o atual antes de gravar e avisar sobre o conflito.

### BT-11 · Resultado Final sem retorno visual ao arrastar linhas
- **Arquivos:** `core.css` (regras `row-dragging`, `drop-before`, `drop-after`), `resultado_final.html`
- **Problema:** as regras só citam `cv-grade-table`, `rh-edit-table` e `fluxo-table`. Na `rf-tabela`, o arrasto funciona, mas sem destaque.
- **Sugestão:** incluir `table.rf-tabela` nas regras ou, melhor, trocá-las por uma classe genérica (ex.: `.grade-arrastavel`).

### BT-12 · Configuração do Supabase repetida em 2 arquivos
- **Arquivos:** `fluxo_logic.js`, `vagas_consulta_logic.js` (`SUPABASE_URL`, `SUPABASE_KEY`, `cabecalhosNuvem`)
- **Sugestão:** centralizar num `nuvem.js` local. O Resultado Final saiu da nuvem na v3.24 e não entra nessa conta.

### BT-13 · Assinante e textos institucionais repetidos
- **Arquivos:** `edital_logic.js` (`FIELDS.ASSINANTE_*`), `ponto14_logic.js`, `ponto18_logic.js`, `ponto_20.html`; frase de abertura da SGP no Ponto 14 e no Ponto 18
- **Problema:** se a chefia mudar, são 4 lugares para atualizar.
- **Sugestão:** um arquivo de dados institucionais comum (ex.: `institucional.js`), ou constantes no `core.js`.

### BT-14 · Gerador do `edital_modelos.js` fora do repositório
- **Arquivo:** `edital_modelos.js`
- **Problema:** foi gerado a partir dos 40 `.docx` oficiais, mas o script e os modelos não estão versionados. Uma mudança nos modelos oficiais exigirá edição manual.
- **Sugestão:** versionar o gerador (sem dados sensíveis) em `Recursos/`, se ele ainda existir.

### BT-31 · Fluxo e Vagas: policies abertas para gravação
- **Arquivos:** `Recursos/vagas_estado.sql`; policies de `fluxo_estado` (sem SQL no repositório)
- **Problema:** o papel anônimo pode ler e **gravar** nas duas tabelas. Não há dados pessoais, mas qualquer pessoa com a chave publicável pode sobrescrever o quadro do Fluxo ou a base de vagas.
- **Sugestão:** restringir a gravação (autenticação da equipe, ou RPC com verificação no servidor) e manter backups periódicos.

## Baixa

### BT-15 · Utilitários duplicados entre os `_logic.js`
- **Problema:** cerca de 40 utilitários aparecem em 2 a 8 cópias, várias já divergentes. Entre eles: 8 implementações de arrastar e soltar, 7 do toggle da caixa de rascunho, 4 leitores de XLSX, 2 leitores do formulário do SEI e 3 da Lista de dados. Mapa completo em [`core-api.md`](core-api.md) § 3.
- **Sugestão:** consolidar no `core.js` aos poucos, uma ferramenta por versão (roteiro em [`core-api.md`](core-api.md) § 4).

### BT-16 · O Edital não carrega `core.js`
- **Arquivos:** `edital.html`, `edital_logic.js` (`pdfParaTexto`, `esc`, `$`)
- **Sugestão:** incluir `core.js` e remover a cópia de `pdfToText`.

### BT-17 · Descrições e comentários desatualizados
- **Arquivos e problemas:**
  - `ferramentas.js`: a descrição do Ponto 26 fala em "(CSV)", mas a entrada é .xlsx;
  - `core.css`: o comentário do topo diz "100% offline", mas há as exceções da nuvem e do Arkanoia;
  - `residencia_classificacao_logic.js`: cita um "Ensalamento da Residência" que não existe.
- **Sugestão:** corrigir os textos num patch.

### BT-18 · Variações tipográficas nos documentos gerados
- **Arquivos:** `edital_logic.js`, `ponto14_logic.js`, `ponto18_logic.js`, `ponto20_logic.js`
- **Problema:**
  - "nº", "n°" e "N°" variam entre as ferramentas (o Ponto 20 cola o número sem espaço);
  - a lacuna para o SEI ausente tem 12 sublinhados numas e 20 noutras;
  - o bloco de data do Edital de Abertura sai como "Curitiba, … ." enquanto os Pontos 14 e 18 tiraram a cidade e o ponto, porque o Athos já os acrescenta.
- **Sugestão:** confirmar com o usuário o padrão oficial e o modelo do Athos de cada documento, e só então uniformizar.

### BT-19 · Página órfã `residencia_ensalamento.html`
- **Problema:** é um espaço reservado, fora do registro e sem `_logic.js`.
- **Sugestão:** decidir com o usuário se a ferramenta será construída (`/nova-ferramenta`) ou se a página sai.

### BT-20 · Fontes da identidade não embutidas
- **Arquivo:** `core.css`
- **Problema:** Barlow, Barlow Semi Condensed e IBM Plex Mono só aparecem onde estão instaladas. Nas outras máquinas, o portal cai em `system-ui`.
- **Sugestão:** embutir os `.woff2` (licença OFL) em `vendor/fonts/` com `@font-face` local, nunca por Google Fonts.

### BT-21 · Cores fora da paleta oficial no `core.css`
- **Valores:**
  - `#a7a290`: botões desabilitados;
  - `#722525`: hover do `.download-btn`;
  - `#fbfaf4` e `#f4f2e9`: creme amarelado;
  - `rgba(35,40,31,…)`: sombras;
  - apelidos `--seal`, `--seal-light` e `--stamp-red`.
- **Sugestão:** trocar pelas gradações oficiais (ver [`identidade-visual.md`](identidade-visual.md) § 1.2). Exemplos: desabilitado `#b7c1c6`, hover coral `#ed664f` ou um coral mais escuro aprovado.

### BT-22 · Ordem de scripts inconsistente
- **Arquivos e problemas:**
  - `ponto_26.html`: o `xlsx.min.js` está entre o `pdf.min.js` e o worker;
  - `fluxo.html`, `vagas_consulta.html` e `resultado_final.html`: carregam `ferramentas.js` **antes** da lógica.
- **Observação:** funciona, porque o `layout.js` só age no `DOMContentLoaded`.
- **Sugestão:** padronizar conforme [`.claude/rules/paginas-html.md`](../.claude/rules/paginas-html.md).

### BT-23 · Fim de linha misto
- **Arquivos:** `changelog.js`, `ponto26_logic.js` (CRLF); o resto usa LF
- **Sugestão:** converter para LF num commit isolado. Considerar `.gitattributes` e `.editorconfig`.

### BT-24 · Sem testes automatizados
- **Situação:** funções puras já são expostas (`module.exports`, `window.RH`, `window.__ED_TEST__`, `window.ResultadoFinal`), e os comentários citam testes `teste_ponto14*.js` que não estão no repositório.
- **Sugestão:** criar `testes/` com casos fictícios em Node puro (sem npm), começando por reservas, desempate e leitura de PDF/Lista.
- **Modelo já usado:** na unificação das reservas (v3.24), as funções antigas e as novas foram extraídas dos arquivos e comparadas em 115 textos, rodando no motor JavaScript do sistema (`osascript -l JavaScript` no macOS), sem instalar nada. Também foi usado o Chrome em modo headless para abrir as 13 páginas e capturar erros. O mesmo caminho serve para outros testes.

### BT-25 · Escapes Unicode literais
- **Arquivo:** `residencia_hercules_logic.js` (trechos com `ç` e afins em textos e comentários)
- **Sugestão:** escrever os acentos diretamente.

### BT-26 · Texto do rodapé nos Pontos 18 e 20 e nos jogos
- **Problema:** o aviso fala em "lançamento no Hércules", mas essas páginas não geram nada para o Hércules.
- **Sugestão:** decidir com o usuário se o texto padrão continua único (padronização) ou se ganha variante.

### BT-27 · Ponto 26 cruza só por nome
- **Arquivo:** `ponto26_logic.js` (`processFiles`)
- **Problema:** a Tabela 1 tem a inscrição, mas o cruzamento usa só `normName`, o que dá risco com homônimos.
- **Sugestão:** cruzar por inscrição e usar o nome como alternativa, como no Ponto 20.

### BT-28 · "Próximo dia útil" ignora feriados
- **Arquivos:** `ponto18_logic.js`, `ponto20_logic.js` (`proximoDiaUtil`)
- **Situação:** a data é editável, então o risco é baixo.
- **Sugestão:** manter assim, ou incluir uma lista local de feriados forenses.

### BT-29 · `'use strict'` ausente e idiomas misturados
- **Arquivos:** `ponto20_logic.js`, `ponto26_logic.js`, `flappy_logic.js` (sem `'use strict'`); nomes em inglês nos Pontos 20 e 26
- **Sugestão:** ajustar quando o arquivo for reescrito; não vale um commit só para isso.

### BT-30 · Arkanoia depende de outro repositório
- **Arquivo:** `arkanoia.html` (iframe)
- **Problema:** se a conta ou o repositório do jogo mudarem de nome, o iframe quebra.
- **Sugestão:** nenhuma ação, apenas consciência do risco (o próprio comentário do arquivo já avisa).

---

## Resolvidos

| Item | Versão | Observação |
|---|---|---|
| BT-02 · `escapeHtml` sem aspas usado em atributos | 3.24 | `TJPRCore.escapeHtml` passou a escapar `"` e `'` (também o substituto de testes do Ponto 14). Os `escAttr` locais continuam corretos |
| BT-03 · Vocabulários de reserva divergentes | 3.24 | `TJPRCore.reconhecerReserva`, com a união dos termos das 6 implementações. Comparação antigo × novo em 115 textos: 0 regressões. Os ganhos foram grafias antes aceitas só por uma ferramenta e o fim de avisos falsos de "sem reserva" |
| BT-10 · Cópias órfãs de bibliotecas na raiz | 3.24 | Movidas para `deprecados/`, com `LEIAME.md` |
