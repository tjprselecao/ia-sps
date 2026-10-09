# Persistência compartilhada (Supabase)

Duas ferramentas guardam dados **compartilhados por toda a equipe** num projeto Supabase (Postgres). **Nenhuma delas guarda dados de candidatos.** As demais são 100% locais.

| Ferramenta | Tabela | Linhas | Constantes (no `_logic.js`) | Cópia local |
|---|---|---|---|---|
| Editor do Fluxo (`fluxo_logic.js`) | `fluxo_estado` | **uma só** (`id='estado'`) | `SUPABASE_URL`, `SUPABASE_KEY`, `TABELA_NUVEM`, `LINHA_NUVEM` | localStorage `tjpr_fluxo_processo_seletivo_v5_fase_editavel` + backup .json |
| Consulta de Vagas (`vagas_consulta_logic.js`) | `vagas_estado` | **uma só** (`id='estado'`) | idem | localStorage `tjpr_vagas_consulta_v1` |

## Dados de candidatos: fora da nuvem (desde a v3.24)

- **O que existia:** até a v3.23, o **Resultado Final** (Unidades Externas) gravava cada preenchimento na tabela `resultado_final_unidades`, com inscrição, nome, e-mail, notas, reserva e data de nascimento dos candidatos. Uma área administrativa, atrás de um PIN só de interface, permitia buscar, carregar, excluir e fazer backup desses registros.
- **O que mudou na v3.24:**
  - A ferramenta passou a ser **100% local**: rascunho automático no navegador (`tjpr_resultado_final_rascunho_v1`) e arquivo .json da caixa Rascunho.
  - "Finalizar" só confere, trava e libera o PDF e o CSV.
  - A área administrativa e todo o código de nuvem saíram.
- **Peças criadas direto no Supabase**, que não estavam no repositório e foram descobertas na limpeza:
  - a tabela `resultado_final_historico`, que guardava uma cópia de cada versão anterior de cada registro;
  - o gatilho `resultado_final_arquivar_trg` (função `resultado_final_arquivar`), que rodava antes de cada UPDATE e DELETE, copiava a linha para o histórico e devolvia `NEW`. No DELETE esse valor é nulo, então **a exclusão era cancelada sem erro**. Era por isso que o "Excluir" da antiga área administrativa às vezes não apagava nada.
- **Limpeza da base:** `Recursos/resultado_final_unidades_limpeza.sql`, rodado **uma vez** no SQL Editor. Numa única transação, ele:
  1. confere que a função do gatilho não está ligada a outra tabela;
  2. remove o gatilho e a função;
  3. remove todas as policies das duas tabelas;
  4. apaga todos os registros, mantendo as tabelas vazias;
  5. confere o resultado.

  Não toca em `fluxo_estado` nem em `vagas_estado`.
- **Script antigo:** `Recursos/resultado_final_unidades.sql` está **descontinuado** (aviso no topo). Rodá-lo reabriria a tabela para gravação pública.
- **Regra:** dados de candidatos não voltam para a nuvem sem uma decisão explícita do usuário e da área responsável pela LGPD. Ver `.claude/rules/nuvem-supabase.md`.

## Padrão de acesso (sem SDK)

- **Por que REST:** a versão original do Fluxo usava o SDK do Supabase por CDN. Ela foi migrada para **REST com `fetch` puro**, para cumprir a regra de não carregar scripts externos. **Mantenha assim.**
- **Cabeçalhos** (`cabecalhosNuvem`, repetida nos 2 arquivos): `apikey: <chave>` e `Authorization: Bearer <chave>`.

| Operação | Requisição |
|---|---|
| Ler a linha única | `GET /rest/v1/<tabela>?select=data&id=eq.estado&limit=1` |
| Gravar (upsert) | `POST /rest/v1/<tabela>` + `Prefer: resolution=merge-duplicates,return=minimal`, corpo `[{ id, data, updated_at }]` |

- **Hora gravada:** o `updated_at` vem do relógio do cliente.
- **Falhas de rede:** geram aviso visível. O trabalho continua na cópia local.

## Contratos de dados (campo `data`, jsonb)

**Não renomeie chaves.** Quem abre a ferramenta lê o que já está gravado.

| Tabela | Formato |
|---|---|
| `fluxo_estado` | `{ version:4, savedAt, rows:[{ phase, color, activity, owners, stage, classifications:[…] }] }`. As chaves estão **em inglês de propósito** (contrato herdado da versão original) |
| `vagas_estado` | `{ unidades:[…], geradoEm, origemArquivo }`. Cada envio de planilha substitui o pacote inteiro |

Ao mudar uma estrutura:
1. Incremente o campo de versão.
2. Escreva a leitura de forma tolerante (migrar o formato antigo ao carregar).
3. Registre a mudança no changelog.

## SQL (`Recursos/`)

- **Aplicação:** os scripts são rodados **à mão** no SQL Editor do projeto Supabase. Não há ferramenta de migração.

| Arquivo | Situação |
|---|---|
| `vagas_estado.sql` | Em uso. Cria a tabela e as policies de select, insert e update para `anon`. ⚠ **Não pode ser rodado de novo**, porque tem `create policy` sem `drop` antes (ver backlog) |
| `resultado_final_unidades_limpeza.sql` | **Rodar uma vez**, depois da v3.24 (ver acima) |
| `resultado_final_unidades.sql` | **Descontinuado. Não rodar.** Mantido como histórico |
| (sem arquivo) `fluxo_estado` | A tabela veio da versão original da ferramenta. Não há script no repositório (ver backlog) |

Para criar uma tabela nova (sem dados pessoais), siga o modelo do script descontinuado: comentário no topo, `create table if not exists`, RLS ativo e policies com `drop policy if exists`.

## Segurança

- **A chave no código é publicável** (`sb_publishable_…`, a "anon key"). É normal que ela fique no client-side, e **a proteção depende inteiramente das policies de RLS**. Nunca coloque no código uma chave `service_role` ou qualquer segredo, porque o repositório é público.
- **Policies de `fluxo_estado` e `vagas_estado`:** são abertas para o papel `anon`, que pode ler e gravar. Esses dados não são pessoais, mas qualquer pessoa com a chave pode sobrescrever o quadro do Fluxo ou a base de vagas. Uma melhoria possível é restringir a gravação (ver backlog).
- **Concorrência:** prevalece a última gravação, sem aviso. O Fluxo salva sozinho a cada mudança e regrava o quadro inteiro, então duas pessoas editando ao mesmo tempo podem sobrescrever o trabalho uma da outra. Uma melhoria possível é comparar o `updated_at` antes de gravar.
- **Nos docs e no repositório:** nada de chaves, exportações de backup ou dados reais.

## Configuração repetida

`SUPABASE_URL`, `SUPABASE_KEY` e `cabecalhosNuvem` estão **duplicados em `fluxo_logic.js` e `vagas_consulta_logic.js`**. Se o projeto Supabase mudar:
- altere os dois; ou
- centralize-os num arquivo comum (ex.: `nuvem.js`).
