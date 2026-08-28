# Sistema de Gestão de Food Service Terceirizado

Sistema de gestão e comprovação da operação de food service terceirizado: digitaliza inspeções de qualidade, higiene e segurança do trabalho feitas em campo, converte desvios em Não Conformidades com responsável e prazo, e controla os ativos e a logística que sustentam a operação — unidades, equipamentos, veículos, RDO e a distribuição de refeições em rotas com recipientes retornáveis rastreados por QR Code.

## Language

**Fornecedor**:
Origem das mercadorias transportadas pelo sistema.

**Cliente**:
Restaurante ou estabelecimento que recebe as mercadorias transportadas pelo sistema.
_Avoid_: Estabelecimento

**Rota**:
Ciclo de saída e entrega dos recipientes retornáveis a um Cliente — um evento único de transporte, não um trajeto fixo reaproveitável. Nomenclatura do sistema legado mantida por decisão explícita; revisão adiada até a modelagem do banco.
_Avoid_: Trajeto (sugere um caminho reaproveitável, o que não reflete o conceito real), Viagem (nome mais preciso, mas descartado por ora)

**Não Conformidade**:
Registro de um desvio identificado em uma inspeção de qualidade, higiene ou segurança do trabalho, com um responsável designado e um prazo para correção.

**Usuário**:
Pessoa cadastrada no sistema que pode autenticar-se (fazer login). Só pode ser cadastrado por outro Usuário com permissão para isso.

**Função**:
Conjunto nomeado de Permissões atribuído a um Usuário.
_Avoid_: Perfil, Role, Papel

**Permissão**:
Autorização granular para realizar uma ação específica sobre um recurso do sistema (ex.: criar, editar, listar ou excluir um cadastro de um módulo).
_Avoid_: Permission

**Módulo Cadastrável**:
Módulo de cadastro simples — cada registro tem apenas um nome — com CRUD e Permissões (`slug.listar/criar/editar/excluir`) independentes dos demais módulos, agrupado no menu lateral sob "Cadastráveis" (ex.: Produtos, Filial, Fornecedores). Implementado por um mecanismo genérico único (ver ADR-0003); adicionar um novo módulo Cadastrável é uma alteração de configuração, não código novo.
