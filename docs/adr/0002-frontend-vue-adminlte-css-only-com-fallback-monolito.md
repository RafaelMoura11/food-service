# Frontend experimental em Vue, com autonomia pré-aprovada para migrar a monólito Blade+AdminLTE

AdminLTE é usado apenas como design system (CSS/SCSS) — a parte funcional das interfaces é construída inteiramente em componentes Vue nativos, sem carregar o JS/plugins do AdminLTE nem do Bootstrap. Isso evita o conflito documentado entre a manipulação de DOM desses scripts e a reconciliação do Vue, confirmado na própria FAQ oficial do AdminLTE 4, que recomenda exatamente esse uso em frameworks SPA. Vue foi a exigência original da demanda.

Ainda assim, ficou acordado: o desenvolvimento tenta o caminho Vue (SPA) + Laravel API primeiro, com AdminLTE como design system. Caso essa combinação se mostre lenta ou problemática, o desenvolvedor tem autonomia pré-aprovada para migrar o que já foi feito para um monólito Laravel (Blade + pacote oficial `jeroennoten/Laravel-AdminLTE`), sem precisar de nova aprovação. Em qualquer um dos dois cenários, o AdminLTE permanece como base visual.

## Consequences

- Não carregar o JS/plugins do AdminLTE nem o JS do Bootstrap (dropdown, modal, collapse, tooltip): eles manipulam o DOM por fora do Vue e causam bugs (sidebar que não colapsa, modais fantasmas após troca de rota).
- Estado de UI do AdminLTE (sidebar colapsada, tema dark, menus abertos) vira estado reativo do Vue, não `data-attribute` do AdminLTE.
- Widgets interativos da demo do AdminLTE (DataTables, Select2, datepicker) são substituídos por equivalentes nativos de Vue, estilizados via CSS para manter a aparência do AdminLTE.
- Importar o SCSS do AdminLTE (não o CSS compilado) para poder sobrescrever variáveis do tema no build do Vite.
