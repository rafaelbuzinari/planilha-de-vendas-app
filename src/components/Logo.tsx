/** O mesmo desenho do ícone do app (gráfico de barras subindo) */
export function Logo({ pequeno = false }: { pequeno?: boolean }) {
  const tamanho = pequeno ? 28 : 34
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 512 512" aria-hidden="true">
      <rect width="512" height="512" rx="112" fill="#1E293B" />
      <rect x="112" y="276" width="72" height="124" rx="16" fill="#2563EB" />
      <rect x="220" y="204" width="72" height="196" rx="16" fill="#2563EB" />
      <rect x="328" y="124" width="72" height="276" rx="16" fill="#10B981" />
    </svg>
  )
}
