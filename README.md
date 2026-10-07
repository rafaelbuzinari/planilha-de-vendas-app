# Planilha de Vendas

App de controle de vendas para pequeno negócio: produtos e estoque, vendas, despesas, investimentos e um painel com os números do negócio.

**Usar:** https://rafaelbuzinari.github.io/planilha-de-vendas-app/

- Funciona **sem internet** e pode ser **instalado no celular** (no Chrome: menu ⋮ → *Instalar app* / *Adicionar à tela inicial*; no iPhone: Safari → Compartilhar → *Adicionar à Tela de Início*).
- Os dados ficam **só no aparelho** (IndexedDB). Faça backup em *Configurações → Fazer backup* de vez em quando.
- Para conhecer o app: *Configurações → Carregar dados de exemplo* (apaga os dados atuais).

A especificação completa está em [ESPECIFICACAO.md](ESPECIFICACAO.md).

## Desenvolvimento

React + Vite + TypeScript + Tailwind CSS, Dexie (IndexedDB), Recharts, Lucide e vite-plugin-pwa.

```sh
npm install
npm run dev      # app em modo de desenvolvimento
npm test         # testes dos cálculos, estoque, backup e painel
npm run build    # versão final em dist/
npm run preview  # serve a versão final
```

- Dinheiro sempre em **centavos** (inteiros). As contas ficam em `src/lib/` e têm testes ao lado (`*.test.ts`).
- As gravações passam por `src/lib/produtos.ts`, `vendas.ts`, `registros.ts` e `backup.ts`, então só esses arquivos mudariam numa migração para um banco online (ex: Supabase).
- `VITE_DEMO=1 npx vite build --outDir dist-demo` gera uma versão que já começa com os dados de exemplo (usada para tirar fotos das telas).
- Publicação: todo envio para a branch `main` roda os testes e publica no GitHub Pages (`.github/workflows/publicar.yml`).
