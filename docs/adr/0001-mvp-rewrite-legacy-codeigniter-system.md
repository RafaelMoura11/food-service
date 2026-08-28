# Reescrita do zero em vez de refatoração incremental do sistema legado

O sistema atual de controle de rotas/viagens foi desenvolvido em CodeIgniter, está em homologação e já é utilizado pela empresa e seus clientes. Sua manutenção está comprometida por código fora de padrão e por nomenclaturas de módulos que confundem mais do que ajudam (ex.: o módulo "Rota").

Decidimos construir um MVP do zero com Laravel + Vue + PostgreSQL, em vez de refatorar incrementalmente o sistema legado, para permitir uma stack atual, um vocabulário de domínio limpo e um código dentro de padrão desde o início, sem carregar as decisões problemáticas do sistema anterior.

## Considered Options

- **Refatoração incremental do sistema CodeIgniter existente**: rejeitada porque o código fora de padrão e a nomenclatura confusa dos módulos tornariam a refatoração tão custosa quanto (ou mais que) uma reescrita, sem garantir a limpeza de vocabulário que uma reescrita permite.
