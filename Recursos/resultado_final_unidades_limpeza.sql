-- Limpeza da base do antigo salvamento em nuvem do Resultado Final
-- (resultado_final.html / resultado_final_logic.js).
--
-- A partir da v3.24 a ferramenta NÃO grava mais nada no Supabase: os dados dos
-- candidatos (nome, inscrição, e-mail, notas, data de nascimento) ficam só no
-- computador de quem preenche. Este script remove o que ficou na base:
--
--   resultado_final_unidades   uma linha por processo SEI (a tabela principal)
--   resultado_final_historico  cópia de cada versão anterior de cada linha,
--                              gravada pelo gatilho resultado_final_arquivar_trg
--
-- O gatilho e a tabela de histórico foram criados direto no Supabase (não
-- estavam no repositório). O gatilho rodava ANTES de cada UPDATE e DELETE:
-- copiava a linha para o histórico e devolvia NEW — que no DELETE é nulo, o
-- que CANCELA a exclusão sem erro. Por isso um "delete" simples não apagava
-- nada (e ainda gerava mais uma cópia no histórico).
--
-- O que este script faz, tudo numa transação (erro em qualquer passo desfaz tudo):
--   0) trava: se a função do gatilho estiver ligada a qualquer outra tabela
--      (ex.: do Fluxo), para sem alterar nada;
--   1) remove o gatilho e a função dele;
--   2) e 3) nas duas tabelas: remove TODAS as policies (com RLS ativo, a
--      chave publicável não lê nem grava mais nada) e apaga todos os
--      registros, MANTENDO as tabelas, vazias;
--   4) conferência.
--
-- NÃO toca em fluxo_estado (Editor do Fluxo) nem em vagas_estado (Consulta de
-- Vagas) — essas tabelas continuam em uso e não guardam dados de candidatos.
--
-- COMO RODAR: no SQL Editor do projeto do Fluxo (o mesmo de fluxo_estado),
-- colar o arquivo inteiro, sem nada selecionado, e clicar em Run; confirmar o
-- aviso de operação destrutiva. A exclusão é IRREVERSÍVEL.
--
-- NÃO rode de novo o resultado_final_unidades.sql depois deste: ele reabre a
-- tabela para gravação pública.

do $$
declare p record;
begin
  -- 0) trava de segurança
  if exists (
    select 1 from pg_trigger t join pg_proc f on f.oid = t.tgfoid
    where f.proname = 'resultado_final_arquivar'
      and t.tgrelid <> 'public.resultado_final_unidades'::regclass
  ) then
    raise exception 'resultado_final_arquivar é usada por outra tabela — nada foi alterado.';
  end if;

  -- 1) gatilho que arquivava e, no DELETE, cancelava a exclusão
  drop trigger if exists resultado_final_arquivar_trg on public.resultado_final_unidades;
  drop function if exists public.resultado_final_arquivar();

  -- 2) tabela principal: fecha e esvazia
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'resultado_final_unidades' loop
    execute format('drop policy %I on public.resultado_final_unidades', p.policyname);
  end loop;
  alter table public.resultado_final_unidades enable row level security;
  delete from public.resultado_final_unidades;

  -- 3) histórico (cópias antigas): fecha e esvazia, se a tabela existir
  if to_regclass('public.resultado_final_historico') is not null then
    for p in select policyname from pg_policies
             where schemaname = 'public' and tablename = 'resultado_final_historico' loop
      execute format('drop policy %I on public.resultado_final_historico', p.policyname);
    end loop;
    alter table public.resultado_final_historico enable row level security;
    delete from public.resultado_final_historico;
  end if;
end $$;

-- 4) conferência: as quatro colunas devem dar 0
select (select count(*) from public.resultado_final_unidades)  as registros_principal,
       (select count(*) from public.resultado_final_historico) as registros_historico,
       (select count(*) from pg_policies where schemaname = 'public'
          and tablename in ('resultado_final_unidades', 'resultado_final_historico')) as policies,
       (select count(*) from pg_trigger where not tgisinternal and tgrelid in
          ('public.resultado_final_unidades'::regclass, 'public.resultado_final_historico'::regclass)) as gatilhos;
