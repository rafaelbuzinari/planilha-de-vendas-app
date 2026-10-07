import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Download, FileSpreadsheet, FlaskConical, Moon, ShieldCheck, Sun, SunMoon, Trash2, Upload } from 'lucide-react'
import { Pagina } from '../components/Pagina'
import { Botao } from '../components/ui/Botao'
import { Campo, EntradaDinheiro, EntradaPorcentagem, estiloEntrada } from '../components/ui/Campo'
import { Confirmar } from '../components/ui/Confirmar'
import { Segmentado } from '../components/ui/Segmentado'
import { useAvisos } from '../components/ui/Avisos'
import { useConfiguracoes } from '../hooks/useConfiguracoes'
import { useTema } from '../hooks/useTema'
import { apagarTudo, baixarArquivo, gerarBackup, gerarCsvVendas, substituirTudo, validarBackup, type DadosApp } from '../lib/backup'
import { salvarConfiguracoes } from '../lib/configuracoes'
import { db } from '../lib/db'
import { formatarData, paraCampoData } from '../lib/datas'
import { gerarDadosExemplo } from '../lib/exemplo'
import { formasPagamento } from '../lib/pagamentos'
import { definirPreferencia, type PreferenciaTema } from '../lib/tema'
import type { Configuracoes as TipoConfiguracoes } from '../types/configuracoes'

const CHAVE_ULTIMO_BACKUP = 'ultimoBackup'

function lerUltimoBackup(): string | null {
  try {
    return localStorage.getItem(CHAVE_ULTIMO_BACKUP)
  } catch {
    return null
  }
}

type Confirmacao = null | { tipo: 'importar'; dados: DadosApp; exportadoEm: string } | { tipo: 'exemplo' } | { tipo: 'apagar' }

export function Configuracoes() {
  const avisar = useAvisos()
  const salvas = useConfiguracoes()
  const { preferencia } = useTema()
  const [rascunho, setRascunho] = useState<TipoConfiguracoes>(salvas)
  const [editado, setEditado] = useState(false)
  const [confirmacao, setConfirmacao] = useState<Confirmacao>(null)
  const [ultimoBackup, setUltimoBackup] = useState(lerUltimoBackup)
  const entradaArquivo = useRef<HTMLInputElement>(null)

  // quando as configurações carregam do banco (ou mudam por um backup), atualiza o formulário
  useEffect(() => {
    if (!editado) setRascunho(salvas)
  }, [salvas, editado])

  const mudar = (novo: Partial<TipoConfiguracoes>) => {
    setRascunho((atual) => ({ ...atual, ...novo }))
    setEditado(true)
  }

  async function salvar() {
    await salvarConfiguracoes({ ...rascunho, nomeNegocio: rascunho.nomeNegocio.trim() })
    setEditado(false)
    avisar('Configurações salvas')
  }

  async function exportarBackup() {
    const backup = await gerarBackup()
    baixarArquivo(`planilha-de-vendas-backup-${paraCampoData(new Date())}.json`, JSON.stringify(backup), 'application/json')
    try {
      localStorage.setItem(CHAVE_ULTIMO_BACKUP, backup.exportadoEm)
    } catch {
      // sem armazenamento: só não lembra a data do último backup
    }
    setUltimoBackup(backup.exportadoEm)
    avisar('Backup salvo')
  }

  async function exportarCsv() {
    const vendas = await db.vendas.toArray()
    if (vendas.length === 0) return avisar('Ainda não há vendas para exportar', 'erro')
    baixarArquivo(`vendas-${paraCampoData(new Date())}.csv`, gerarCsvVendas(vendas), 'text/csv;charset=utf-8')
    avisar('Relatório salvo')
  }

  async function lerArquivo(arquivo?: File) {
    if (!arquivo) return
    try {
      const backup = validarBackup(JSON.parse(await arquivo.text()))
      setConfirmacao({ tipo: 'importar', dados: backup.dados, exportadoEm: backup.exportadoEm })
    } catch (erro) {
      avisar(erro instanceof SyntaxError ? 'Arquivo inválido' : (erro as Error).message, 'erro')
    }
  }

  async function confirmar() {
    if (!confirmacao) return
    try {
      if (confirmacao.tipo === 'importar') {
        await substituirTudo(confirmacao.dados)
        avisar('Backup restaurado')
      } else if (confirmacao.tipo === 'exemplo') {
        await substituirTudo(gerarDadosExemplo())
        avisar('Dados de exemplo carregados')
      } else {
        await apagarTudo()
        avisar('Todos os dados foram apagados')
      }
      setEditado(false)
    } catch {
      avisar('Não foi possível concluir', 'erro')
    }
    setConfirmacao(null)
  }

  return (
    <Pagina titulo="Configurações" descricao="Taxas, metas e backup">
      <Secao titulo="Seu negócio">
        <div className="grid gap-4 md:grid-cols-2">
          <Campo rotulo="Nome do negócio" dica="Aparece no topo do app">
            <input className={estiloEntrada} value={rascunho.nomeNegocio} onChange={(e) => mudar({ nomeNegocio: e.target.value })} placeholder="Planilha de Vendas" maxLength={40} />
          </Campo>
          <Campo rotulo="Meta de faturamento do mês" dica="Acompanhe o progresso na tela Início">
            <EntradaDinheiro centavos={rascunho.metaMensal} aoMudar={(v) => mudar({ metaMensal: v })} />
          </Campo>
        </div>
      </Secao>

      <Secao titulo="Taxas da maquininha" descricao="Quanto cada forma de pagamento desconta da venda. Coloque as taxas reais da sua maquininha.">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {formasPagamento.map(({ valor, rotulo, icone: Icone }) => (
            <Campo
              key={valor}
              rotulo={
                <span className="inline-flex items-center gap-1.5">
                  <Icone size={16} className="text-suave" /> {rotulo}
                </span>
              }
            >
              <EntradaPorcentagem valor={rascunho.taxas[valor]} aoMudar={(v) => mudar({ taxas: { ...rascunho.taxas, [valor]: v } })} />
            </Campo>
          ))}
        </div>
        <p className="mt-3 text-xs text-suave">Vendas já registradas mantêm a taxa da época. A nova taxa vale para as próximas vendas.</p>
      </Secao>

      {editado && (
        <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] z-10 flex items-center justify-between gap-3 rounded-cartao border border-primaria/30 bg-cartao p-3 shadow-lg md:bottom-6">
          <span className="pl-1 text-sm font-medium">Você tem alterações não salvas</span>
          <div className="flex gap-2">
            <Botao
              variante="fantasma"
              onClick={() => {
                setRascunho(salvas)
                setEditado(false)
              }}
            >
              Descartar
            </Botao>
            <Botao onClick={salvar}>Salvar</Botao>
          </div>
        </div>
      )}

      <Secao titulo="Aparência">
        <Segmentado<PreferenciaTema>
          rotuloAcessivel="Tema"
          valor={preferencia}
          aoMudar={definirPreferencia}
          opcoes={[
            { valor: 'auto', rotulo: <Opcao icone={<SunMoon size={18} />} texto="Automático" /> },
            { valor: 'claro', rotulo: <Opcao icone={<Sun size={18} />} texto="Claro" /> },
            { valor: 'escuro', rotulo: <Opcao icone={<Moon size={18} />} texto="Escuro" /> },
          ]}
        />
      </Secao>

      <Secao
        titulo="Backup e dados"
        descricao="Seus dados ficam guardados só neste aparelho. Faça backup de vez em quando e guarde o arquivo no Google Drive, no e-mail ou no computador."
      >
        <div className="mb-4 flex items-center gap-2 rounded-cartao bg-fundo px-3.5 py-3 text-sm">
          <ShieldCheck size={18} className={ultimoBackup ? 'text-positivo' : 'text-suave'} />
          {ultimoBackup ? `Último backup: ${formatarData(ultimoBackup)}` : 'Você ainda não fez nenhum backup neste aparelho'}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <BotaoAcao icone={<Download size={18} />} titulo="Fazer backup" texto="Salva todos os dados num arquivo" onClick={exportarBackup} />
          <BotaoAcao icone={<Upload size={18} />} titulo="Restaurar backup" texto="Volta os dados de um arquivo" onClick={() => entradaArquivo.current?.click()} />
          <BotaoAcao icone={<FileSpreadsheet size={18} />} titulo="Relatório de vendas" texto="Planilha para abrir no Excel" onClick={exportarCsv} />
          <BotaoAcao icone={<FlaskConical size={18} />} titulo="Carregar dados de exemplo" texto="Para testar o app à vontade" onClick={() => setConfirmacao({ tipo: 'exemplo' })} />
        </div>
        <input
          ref={entradaArquivo}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            lerArquivo(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => setConfirmacao({ tipo: 'apagar' })}
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-negativo hover:underline"
        >
          <Trash2 size={16} /> Apagar todos os dados
        </button>
      </Secao>

      <p className="pb-4 text-center text-xs text-suave">Planilha de Vendas · versão {__VERSAO_APP__} · funciona sem internet</p>

      <Confirmar
        aberto={confirmacao?.tipo === 'importar'}
        titulo="Restaurar backup?"
        mensagem={`Todos os dados atuais serão trocados pelos do backup${
          confirmacao?.tipo === 'importar' && confirmacao.exportadoEm ? ` de ${formatarData(confirmacao.exportadoEm)}` : ''
        }. Não dá para desfazer.`}
        textoConfirmar="Restaurar"
        aoConfirmar={confirmar}
        aoCancelar={() => setConfirmacao(null)}
      />
      <Confirmar
        aberto={confirmacao?.tipo === 'exemplo'}
        titulo="Carregar dados de exemplo?"
        mensagem="Seus dados atuais serão APAGADOS e trocados por dados de mentira para teste. Se tiver dados reais, faça um backup antes."
        textoConfirmar="Carregar exemplo"
        aoConfirmar={confirmar}
        aoCancelar={() => setConfirmacao(null)}
      />
      <Confirmar
        aberto={confirmacao?.tipo === 'apagar'}
        titulo="Apagar todos os dados?"
        mensagem="Produtos, vendas, despesas, investimentos e configurações serão apagados deste aparelho. Não dá para desfazer."
        textoConfirmar="Apagar tudo"
        aoConfirmar={confirmar}
        aoCancelar={() => setConfirmacao(null)}
      />
    </Pagina>
  )
}

function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <section className="rounded-cartao border border-borda bg-cartao p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:shadow-none">
      <h2 className="font-semibold">{titulo}</h2>
      {descricao && <p className="mt-1 text-sm text-suave">{descricao}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Opcao({ icone, texto }: { icone: ReactNode; texto: string }) {
  return (
    <>
      {icone}
      <span className="text-xs">{texto}</span>
    </>
  )
}

function BotaoAcao({ icone, titulo, texto, onClick }: { icone: ReactNode; titulo: string; texto: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-cartao border border-borda px-4 py-3 text-left transition hover:border-primaria/40 hover:bg-fundo active:scale-[0.99]">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primaria/10 text-primaria">{icone}</div>
      <div>
        <div className="text-sm font-semibold">{titulo}</div>
        <div className="text-xs text-suave">{texto}</div>
      </div>
    </button>
  )
}
