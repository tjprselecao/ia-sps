-- Limpeza da tabela do antigo salvamento em nuvem do Resultado Final
-- (resultado_final.html / resultado_final_logic.js).
--
-- A partir da v3.24 a ferramenta NÃO grava mais nada no Supabase: os dados dos
-- candidatos (nome, inscrição, e-mail, notas, data de nascimento) ficam só no
-- computador de quem preenche. Este script:
--   1) fecha a tabela para a chave publicável (sem policies + RLS ativo, o
--      papel anônimo não lê nem grava mais nada aqui) — assim uma aba antiga
--      aberta, ou a versão antiga em cache no navegador, não volta a gravar
--      dados de candidatos;
--   2) APAGA todos os registros, mantendo a tabela (vazia);
--   3) confere que não sobrou nada.
--
-- NÃO toca em fluxo_estado (Editor do Fluxo) nem em vagas_estado (Consulta de
-- Vagas) — essas tabelas continuam em uso e não guardam dados de candidatos.
--
-- COMO RODAR: depois de publicar a v3.24, no SQL Editor do projeto Supabase,
-- uma vez. A exclusão é IRREVERSÍVEL: se alguma tabela de unidade ainda for
-- necessária, peça à unidade o PDF/CSV gerado por ela (ou baixe o registro na
-- versão antiga ANTES de publicar a v3.24, pela área administrativa).
--
-- NÃO rode de novo o resultado_final_unidades.sql depois deste: ele reabre a
-- tabela para gravação pública.

-- 1) fecha a tabela para o papel anônimo
drop policy if exists "resultado_final select" on public.resultado_final_unidades;
drop policy if exists "resultado_final insert" on public.resultado_final_unidades;
drop policy if exists "resultado_final update" on public.resultado_final_unidades;
drop policy if exists "resultado_final delete" on public.resultado_final_unidades;
alter table public.resultado_final_unidades enable row level security;

-- 2) apaga todos os registros (a tabela continua existindo, vazia)
delete from public.resultado_final_unidades;

-- 3) conferência: deve devolver 0
select count(*) as registros_restantes from public.resultado_final_unidades;
