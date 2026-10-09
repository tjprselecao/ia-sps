# Domínio: processo seletivo de estágio e residência no TJPR

Vocabulário e regras de negócio que o código implementa. **Quando uma regra não estiver aqui nem no código, pergunte ao usuário.** Textos de edital e regras de cota têm efeito jurídico.

## Glossário

| Termo | Significado |
|---|---|
| **DSERFTA** | Divisão de Seleção de Estagiários e Residentes, Formação de Talentos e Ambientação, da Coordenadoria de Desenvolvimento Humano e Organizacional (CDHO) da Secretaria de Gestão de Pessoas (SGP). Sigla no SEI: `SG-SGP-CDHO-DSERFTA` (texto por extenso em `DSERFTA_EXTENSO`, `layout.js`). É a unidade que mantém o portal |
| **SPS** | Seção de Processo Seletivo (estágio). No menu aparece como "Estágio" |
| **SEI** | Sistema Eletrônico de Informações: o processo administrativo. Número de 20 dígitos no formato `0000000-00.0000.8.16.6000`. A unidade solicitante preenche no SEI o **Formulário de Abertura de Processo Seletivo**, que o portal lê em PDF (o rodapé "SEI … / pg." é filtrado) |
| **Sigla SEI** | Código da unidade (ex.: `1TR-DMP`). `edital_unidades_sei.js` traduz a sigla para a hierarquia da unidade, e `nomeUnidadePorExtenso` monta o nome por extenso |
| **Fábrica de Provas** | Plataforma de inscrições e provas. Os relatórios ficam em RELATÓRIOS → PERSONALIZADOS: **Relatório de Inscritos**, **Relatório de Classificação Final**, **Relatório de convocação para entrevistas**, relatório de aprovados. São exportados em .xlsx **sem editar** |
| **Athos** | Sistema de publicação de atos do TJPR. O edital é montado num "modelo de blocos de impressão", e por isso as ferramentas geram **blocos separados** para colar. Ver § Athos |
| **Hércules** | Sistema de gestão de estagiários. Importa a classificação final por CSV, com colunas fixas (§ Hércules) |
| **e-DJ** | Diário da Justiça Eletrônico, onde o edital é publicado |
| **Ponto NN** | Etapa numerada do fluxo do processo seletivo da SPS. As ferramentas da SPS são identificadas pelo ponto que atendem (14, 18, 20, 26) |
| **Ponto / Tag / Vinculação** | Três marcações independentes que cada etapa pode ter no Editor do Fluxo. O significado operacional é definido pela equipe: **não infira, pergunte** |
| **Ensalamento** | Distribuição dos candidatos nos locais e salas da prova presencial, publicada no Edital de Ensalamento |
| **Deferida / Indeferida** | Situação da inscrição. Só as deferidas seguem para ensalamento e classificação |
| **Unidade externa (UE)** | Comarca ou unidade que conduz o próprio processo seletivo, sem a Fábrica de Provas |
| **Residência** | Residência jurídica (pós-graduação). Tem editais próprios, grupos de cota próprios e ordem de chamamento própria |

## Fluxo do processo seletivo (visão de etapas)

Resumo do quadro inicial (`QUADRO_SEMENTE` em `fluxo_logic.js`). **O quadro vivo, sempre mais atual, está no Editor do Fluxo (nuvem).** A numeração do quadro inicial pode divergir da usada no portal: a classificação final, por exemplo, aparece como etapa 21 no quadro e como Ponto 20 na ferramenta.

| Etapa | Atividade | Ferramenta do portal |
|---|---|---|
| −1 | Triagem dos processos | — |
| 00 | Análise de abertura do processo seletivo | — |
| 01 | Redigir a minuta do Edital de Abertura; editar no Athos | **Gerador do Edital de Abertura** |
| 02 | Encaminhar a minuta para aprovação da unidade | — |
| S/N | Retificações do Edital de Abertura | — |
| 08 | Ajustar e publicar o Edital de Abertura | — |
| 09 | Configurar a aplicação na Fábrica; link de inscrições | — |
| 12–13 | Término das inscrições; relatório de inscritos | — |
| 14 | Aplicação presencial ou on-line e **Edital de Ensalamento** | **Ponto 14** |
| 15 | E-mails aos candidatos | — |
| 18 | **Convocar candidatos para entrevistas** | **Ponto 18** |
| 20/21 | **Edital de Classificação Final** | **Ponto 20** (e Resultado Final, para UEs) |
| 26 | **Cadastrar a classificação final no Hércules** | **Ponto 26** |
| 27 | Cadastrar unidades interessadas em aproveitar processos de outras unidades | — |

Residência: Convocação para Entrevista → Classificação Final → Arquivo do Hércules (ensalamento previsto, ainda não construído).

## Reservas de vagas (cotas)

| Código no edital | Grupo | % (modelos) | Coluna do Hércules | Residência |
|---|---|---|---|---|
| **2.1.1** | Pessoas pretas ou pardas (negros) | 30% | `AFRO` | grupo `ppp` |
| **2.1.2** | Pessoas com deficiência (PcD) | 10% | `PNE` | grupo `pcd` |
| **2.1.3** | Indígenas | 3% | `INDÍGENA` | grupo `ind` |
| **2.1.4** | Vulnerabilidade social (medidas protetivas) | 10% | `VS` | **não se aplica**: a vaga reverte para a Geral, e a ferramenta avisa |

- A **Ampla Concorrência** (AC, "Geral") inclui todos os candidatos. O cotista concorre nas duas listas e fica com a posição mais vantajosa.
- **"Sem reserva":** a lista `SEM_RESERVA` do `core.js` traz os textos que significam ausência de cota (`-`, `N/A`, "Não", "Nenhuma", `AC`, "Ampla concorrência", "Geral", "Sem reserva", "Não cotista"…). Isso **não é erro**.
- **Reserva não reconhecida:** nunca vira "sem cota" em silêncio. Gera aviso com o texto original.
- **Vocabulário único:** o texto da Fábrica e da Lista de dados varia ("Preto ou pardo", "Pessoa Preta ou Parda", "PcD", "PNE", o próprio código "2.1.1"…). Desde a v3.24, todas as ferramentas reconhecem esses textos do mesmo jeito, por `TJPRCore.reconhecerReserva` (ver [`core-api.md`](core-api.md) § 1). Para aceitar uma grafia nova, acrescente-a lá, e nunca num mapa da ferramenta.
- **Item 6.1.3 do Edital de Abertura** (opcional, ligado por padrão): candidatos cotistas são admitidos à entrevista com nota até **20% inferior** à mínima. O Resultado Final apenas informa isso; não aplica a regra.
- **Nota mínima:** os modelos de edital usam a nota mínima de 60%.

### Ordem de chamamento da Residência (Decisão 11697384)

- `ORDEM_VAGAS` (`residencia_hercules_logic.js`) define o tipo de cada uma das vagas 1 a 100, num padrão que se repete depois da 100: **G**eral, **N**egros, **P**cD, **I**ndígenas e **V**S. VS vira Geral na Residência.
- **`montarChamamento`:**
  1. A lista de mérito parte da tabela da Ampla, na ordem impressa no edital. Quem aparece só numa tabela de cota é encaixado pela nota.
  2. Cada vaga de cota puxa o próximo cotista daquela lista que ainda não foi chamado. Se a lista da cota acabou, a vaga reverte para o mérito.
  3. Cada nome aparece **uma única vez**, e a classificação final é renumerada de 1 a N.

## Desempate e ordenação

1. Maior nota primeiro: a nota final ou, conforme o documento, a nota da prova.
2. **Empate:** o candidato **mais velho** vem primeiro, comparando as **datas** de nascimento, e não as idades.
3. **Sem data de nascimento** para os dois: a ordem é mantida e **gera aviso**. Nunca se inventa desempate sem dado.
4. Todo empate desfeito automaticamente gera aviso.

Implementado em `reordenarPorNotaEIdade` (Residência), no modo manual do Ponto 20 e no Resultado Final.

O Edital de Abertura oferece, para a convocação à entrevista, duas redações para o empate na nota de corte: "convocar todos os empatados" ou "critério de desempate (data de nascimento)". O Ponto 18 avisa quando há empate na menor nota convocada.

## Formatos

| Dado | Formato |
|---|---|
| Número SEI | `0000000-00.0000.8.16.6000` (máscara `ativarMascaraSei`). Sem SEI, o documento sai com uma lacuna de sublinhados |
| Nota | 2 casas decimais com **vírgula**: `7,75`. Internamente é `Number` |
| Data digitada | `dd/mm/aaaa` (máscara + botão 📅) |
| Data por extenso | "9 de outubro de 2026" (o Ponto 14 usa "09 de outubro de 2026") |
| Data do documento | próximo **dia útil** (pula só sábado e domingo; **feriados não são considerados**) |
| Horário | `14h00min` |
| Duração ou prazo da prova | `03h00min` |
| CPF (Hércules) | 11 dígitos, com o zero à esquerda recomposto (o Excel o remove) |
| CSV | `;` como separador, BOM UTF-8, CRLF |
| Nome no cruzamento | sem acento, MAIÚSCULAS, espaços colapsados (`normName` ou `chaveNome`) |

## Athos e documentos publicados

- **Blocos:** o edital é colado no Athos **bloco a bloco**. A divisão típica é:
  1. nome do documento no SEI;
  2. título ou preâmbulo;
  3. numeração (só o número do processo SEI);
  4. conteúdo;
  5. data;
  6. assinatura.

  Cada ferramenta tem variações: o Ponto 14 tem 2a e 2b; o Ponto 18 tem 7 blocos, com os blocos 2 a 4 em texto puro.
- **O que o modelo do Athos já acrescenta:** "EDITAL DE", "SEI!TJPR N°", a cidade e o ponto final da data. **Não duplique.** Os Pontos 14 e 18 tiram a cidade e o ponto do bloco de data. O Edital de Abertura ainda os mantém (ver backlog).
- **O Athos descarta o atributo `style`:**
  - as classes são convertidas em atributos `align="…"` e `<b>` de verdade (`aplicarEstilosInline`/`htmlComEstilosInline`);
  - tabelas levam `border="1"`, porque a borda de 0,5pt sumia no PDF.
- **`EDITAL N° $$(numerar automaticamente)%%`:** marcador que o Athos troca pela numeração ao salvar. Se o usuário informar só o número (ex.: `2870/2026`), a ferramenta acrescenta "EDITAL N°".
- **Colar no editor do SEI:** copie HTML limpo, por um ouvinte de `copy` como em `edital_logic.js`. Copiar a seleção viva da página leva junto o fundo cinza.
- **Fontes dos documentos:** cada documento segue o modelo oficial. Calibri/Carlito no Edital e no Ponto 14, Times New Roman 11pt na Residência, Arial/Helvetica no Resultado Final. **Não mude sem pedido.**
- **Assinatura padrão:** o chefe da DSERFTA. Nome e cargo ficam em `edital_logic.js` (`FIELDS.ASSINANTE_NOME`/`ASSINANTE_CARGO`) e estão repetidos no Ponto 14, no Ponto 18 e em `ponto_20.html`. Se mudar, atualize **todos** (ver backlog).
- **Frase de abertura da SGP:** repetida nos Pontos 14 e 18.

## Hércules (CSV de importação)

Colunas, nesta ordem (`OUT_COLS` no Ponto 26, `COLS_CSV` na Residência):

```
Classificação;CPF;Nome do candidato;Nota final;E-mail;Telefone celular;Telefone fixo;PNE;VS;AFRO;INDÍGENA
```

- As colunas de cota levam **S** ou **N**.
- O telefone fixo recebe o celular quando não há outro.
- As inscrições indeferidas ficam de fora.
- **Ponto 26:** a reserva do **cadastro** (Relatório de Inscritos) prevalece sobre o código impresso no edital, que serve só de conferência.

## Normas citadas nos modelos

- Lei Federal nº 11.788/2008 (Lei do Estágio).
- Resolução nº 7/2005 e Enunciado Administrativo nº 7/2008, ambos do CNJ.
- Decreto Judiciário nº 345/2019 (TJPR). As inscrições abrem a partir do 5º dia útil após a publicação no e-DJ (art. 12).
- Decisão 11697384: ordem de chamamento das vagas reservadas da Residência.
- Resolução nº 227/2019 do Órgão Especial: identidade visual (ver [`identidade-visual.md`](identidade-visual.md)).

## Princípio que atravessa todo o domínio

> **Nada é corrigido em silêncio.** O portal ajuda, mas quem responde pelo dado é o servidor. Todo ajuste automático (CPF recomposto, reserva não reconhecida, empate desfeito, linha descartada, nome aproximado) precisa aparecer na tela, para ser conferido antes de publicar ou lançar no Hércules.
