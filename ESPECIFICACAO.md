# Planilha de Vendas — Especificação

App web moderno de controle de vendas para pequeno negócio.
Construído POR ETAPAS: uma etapa de cada vez, mostrar o resultado e esperar aprovação antes da próxima.

## Tecnologia
- React + Vite + TypeScript + Tailwind CSS
- Gráficos com Recharts, ícones com Lucide
- Dados salvos localmente no navegador (IndexedDB via Dexie.js), organizados de um jeito
  que depois seja fácil migrar para um banco online (ex: Supabase)
- Código organizado em pastas: components, pages, hooks, lib, types
- **App instalável no celular (PWA) e funcionando 100% offline**
- Valores em dinheiro guardados em centavos (números inteiros), para não ter erro de arredondamento
- Testes automáticos (Vitest) para todos os cálculos: lucro, taxa, margem, totais

## Identidade visual
- Nome: **Planilha de Vendas**
- Paleta: azul-marinho #0F172A (menu lateral e títulos), azul #2563EB (cor principal:
  botões, links, destaques), verde #10B981 (positivo/pago), vermelho #EF4444
  (negativo/cancelado), amarelo #F59E0B (pendente), fundo #F8FAFC, cards brancos
- Verde, vermelho e amarelo têm significado fixo e não são usados para mais nada
- Fonte Inter (guardada dentro do app, para funcionar offline). Cantos arredondados (12px),
  bastante espaço em branco, sombras bem sutis
- Modo claro e escuro (fundo escuro #0F172A; menu um tom mais escuro para se destacar),
  com botão Auto / Claro / Escuro que fica salvo
- Responsivo: funcionar bem no celular (menu vira barra inferior) e no computador
  (menu lateral)
- Valores em R$ (formato brasileiro), datas dd/mm/aaaa, tudo em português

## Telas

### 1. Dashboard (tela inicial)
- Filtro de período: hoje, semana, mês, ano, personalizado
- Cards: Faturamento, Lucro líquido, Margem %, Ticket médio, Nº de vendas,
  Total investido, Retorno do investimento %
- Cada card mostra a variação em relação ao período anterior (seta verde ou vermelha)
- Gráfico de faturamento x lucro por dia ou mês
- Gráfico de rosca por forma de pagamento (Dinheiro, Pix, Débito, Crédito)
- Top 5 produtos mais vendidos
- Barra de progresso da meta mensal
- Alertas: produtos com estoque baixo, vendas pendentes

### 2. Vendas
- Botão de destaque "Nova venda", que abre um formulário rápido:
  cliente (opcional), produtos (vários itens por venda, busca por nome), quantidade,
  desconto, forma de pagamento e status (Pago / Pendente / Cancelado)
- Preço e custo vêm automaticamente do cadastro do produto
- **Cada venda guarda o preço e o custo do dia em que foi feita** (mudar o preço do produto
  depois não altera vendas antigas)
- O app calcula sozinho: total, custo, taxa da forma de pagamento e lucro da venda
- Lista de vendas com busca, filtros (período, pagamento, status) e status em cores
- Editar, cancelar e excluir (com confirmação); editar/excluir ajusta o estoque

### 3. Produtos
- Cadastro: nome, categoria, custo, preço de venda, estoque atual, estoque mínimo, foto
  (opcional; a foto é reduzida antes de salvar para não pesar o backup)
- Margem % calculada automaticamente
- O estoque diminui sozinho a cada venda (Paga ou Pendente) e volta se a venda for cancelada
- Selo "Repor" quando o estoque estiver abaixo do mínimo

### 4. Investimentos
- Registro: data, descrição, tipo (Estoque, Equipamento, Marketing, Estrutura, Outros),
  valor
- Total investido e gráfico por tipo
- Indicador de retorno: quanto do investimento já voltou em lucro
  (usa o lucro líquido acumulado desde o início, não só o do período filtrado)
- Compra de mercadoria lançada como investimento "Estoque" NÃO deve ser lançada também como
  despesa (evitar contar duas vezes) — mostrar uma dica sobre isso na tela

### 5. Despesas
- Registro: data, descrição, categoria (Aluguel, Energia, Internet, Transporte,
  Embalagem, Impostos, Outros), valor, fixa ou variável, pago sim/não
- As despesas entram no cálculo do lucro líquido do Dashboard (pagas e não pagas)

### 6. Configurações
- Taxas por forma de pagamento (padrão: Dinheiro 0%, Pix 0%, Débito 1,99%,
  Crédito 4,99%), editáveis
- Meta de faturamento mensal
- Nome do negócio
- Exportar dados (backup em JSON e relatório de vendas em CSV pronto para o Excel brasileiro:
  separador `;`, vírgula decimal, acentos corretos) e importar backup

## Regras de negócio
- Total da venda = soma dos itens − desconto
- Lucro da venda = total − custo dos produtos − taxa do pagamento
- Lucro líquido do período = soma do lucro das vendas − despesas do período
- Vendas canceladas não entram em nenhum total
- Vendas pendentes aparecem separadas ("a receber") — faturamento e lucro contam só as vendas
  pagas (dinheiro que de fato entrou)
- Retorno do investimento = lucro líquido acumulado desde o início ÷ total investido

## Experiência de uso
- Lançar uma venda deve levar poucos segundos, com o mínimo de cliques
- Mensagens de confirmação curtas ("Venda registrada")
- Telas vazias com convite para começar ("Cadastre seu primeiro produto")
- Botão para carregar dados de exemplo, para testar o app

## Ordem das etapas
1. Estrutura do projeto, layout (menu, tema claro/escuro), navegação entre telas vazias e PWA
2. Banco de dados local e cadastro de Produtos
3. Tela de Vendas
4. Investimentos e Despesas
5. Configurações
6. Dashboard com cards e gráficos
7. Exportar/importar, dados de exemplo e ajustes finais de visual
