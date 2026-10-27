# Diagramas UML — VivaBem

## 1. Diagrama de casos de uso

```mermaid
flowchart LR
    U((Usuário))
    N((Serviço de notificações<br/>do navegador))

    subgraph VivaBem
        UC1([Criar conta])
        UC2([Realizar login])
        UC3([Sair da conta])
        UC4([Cadastrar hábito])
        UC5([Editar rotina de hábitos])
        UC6([Excluir hábito])
        UC7([Marcar hábito como concluído])
        UC8([Visualizar progresso])
        UC9([Definir meta semanal])
        UC10([Configurar lembrete])
        UC11([Ativar notificações])
    end

    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6
    U --> UC7
    U --> UC8
    U --> UC9
    U --> UC10
    U --> UC11
    UC11 --> N
    UC10 --> N
    UC8 -. inclui .-> UC7
    UC9 -. complementa .-> UC4
```

## 2. Diagrama de classes

```mermaid
classDiagram
    class Usuario {
        +String nome
        +String email
        +String senha
        +criarConta()
        +realizarLogin()
        +sair()
    }

    class Habito {
        +String id
        +String nome
        +String icone
        +int metaSemanal
        +String horarioLembrete
        +boolean lembreteAtivo
        +cadastrar()
        +editar()
        +excluir()
    }

    class ConclusaoDiaria {
        +String data
        +String habitId
        +marcarComoConcluida()
        +desmarcar()
    }

    class Meta {
        +int quantidadeSemanal
        +int progressoAtual
        +calcularPercentual()
        +verificarAlcance()
    }

    class Progresso {
        +int totalConcluido
        +int taxaConclusao
        +int sequenciaAtual
        +int melhorSequencia
        +calcularTaxa()
        +calcularSequencia()
        +gerarGrafico()
    }

    class Lembrete {
        +String horario
        +boolean ativo
        +ativar()
        +desativar()
        +solicitarPermissao()
    }

    class PersistenciaLocal {
        +salvar()
        +carregar()
        +remover()
    }

    Usuario "1" --> "0..*" Habito : possui
    Habito "1" --> "0..*" ConclusaoDiaria : registra
    Habito "1" --> "1" Meta : possui
    Habito "1" --> "0..1" Lembrete : configura
    Usuario "1" --> "1" Progresso : acompanha
    Progresso ..> ConclusaoDiaria : consolida
    Usuario ..> PersistenciaLocal : dados da conta
    Habito ..> PersistenciaLocal : dados dos hábitos
```

## Como visualizar

O arquivo pode ser visualizado no GitHub ou no VS Code com uma extensão que ofereça suporte a Mermaid. Também é possível colar cada bloco em um editor Mermaid compatível para exportar os diagramas como PNG ou SVG.
