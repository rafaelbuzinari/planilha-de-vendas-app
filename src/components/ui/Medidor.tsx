interface Props {
  /** 0 a 100 (valores fora disso são cortados só no desenho) */
  porcentagem: number
  rotuloAcessivel: string
  /** cor do preenchimento (padrão: cor principal) */
  corPreenchimento?: string
}

/** Barra de progresso (ex: quanto do investimento já voltou, meta do mês) */
export function Medidor({ porcentagem, rotuloAcessivel, corPreenchimento = 'bg-primaria' }: Props) {
  const largura = Math.min(100, Math.max(0, porcentagem))
  return (
    <div
      role="meter"
      aria-label={rotuloAcessivel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(largura)}
      className="h-2.5 w-full overflow-hidden rounded-full bg-primaria/10"
    >
      <div className={`h-full rounded-full transition-[width] duration-500 ${corPreenchimento}`} style={{ width: `${largura}%` }} />
    </div>
  )
}
