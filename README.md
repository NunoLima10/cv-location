# cv-location


`cv-location` é uma API de consulta de localizações de Cabo Verde. Devolve, de forma estruturada e hierárquica, **todos os níveis administrativos e toponímicos do arquipélago**, desde o país até ao lugar mais pequeno, com pesquisa textual tolerante a erros e acentos, e coordenadas geográficas para os níveis superiores.

---

## A missão

Em Cabo Verde, quando uma aplicação precisa de saber *onde* está o seu utilizador  para uma morada, uma entrega, um filtro, um mapa, um formulário de registo - a resposta quase sempre passa por serviços estrangeiros: Google Maps, listas de moradas genéricas, campos de texto livre que ninguém consegue validar. O resultado é conhecido: nomes escritos de dez maneiras diferentes, freguesias a mais, zonas a menos, dados que não batem certo com a divisão administrativa oficial do país.

**Este projeto existe para dar a Cabo Verde a sua própria base de localizações.** Uma estrutura de dados própria, precisa e cabo-verdiana para representar *onde* as pessoas estão:

- **Para quem constrói produtos** — SaaS, marketplaces, plataformas de entrega, sistemas de faturação, apps públicas — que precisam de um seletor de localização fiável e de um esquema de moradas coerente com a realidade do país.
- **Para quem quer alojar os seus próprios dados** — a API é auto-hospedável (self-host) e pode ser implantada (deploy) por qualquer pessoa ou organização, sem depender de terceiros nem de quotas.
- **Para o ecossistema cabo-verdiano** — como peça de base partilhada que projetos diferentes podem reutilizar, em vez de cada um reconstruir a sua própria lista de ilhas e concelhos.

Não é um substituto do Google Maps — não faz encaminhamento nem trânsito. É a camada por baixo: **a divisão territorial oficial do país**, estruturada, aberta e sob o teu controlo, em vez de alugada a um serviço externo.

---

## Modelo de dados

Cabo Verde é modelado em **seis níveis hierárquicos**. Cada nível pertence a um só pai, e o código de cada registo **contém o código do nível acima como prefixo** — por isso um único código identifica sem ambiguidade a cadeia completa até ao país.

| Nível | Entidade | Exemplo | Código | Registos |
|:---:|---|---|---|---:|
| 1 | **País** (`country`) | Cabo Verde | `CV` | 1 |
| 2 | **Ilha** (`island`) | Santo Antão | `CV1` | 9 |
| 3 | **Concelho** (`municipality`) | Ribeira Grande | `CV111` | 22 |
| 4 | **Freguesia** (`parish`) | Nossa Senhora do Rosário | `CV111111` | 32 |
| 5 | **Zona** (`zone`) | Faja de Domingas Benta | `CV11111111101` | 441 |
| 6 | **Lugar** (`place`) | Chã de Enrique | `CV111111111011110106` | 3 535 |
| | | | **Total** | **4 040** |

Assim, dado o código de um lugar, os prefixos revelam diretamente a zona, a freguesia, o concelho, a ilha e o país a que pertence — sem necessidade de *joins* para navegar a hierarquia. Os endpoints `/breadcrumb` (cadeia de ascendentes) e `/children` (nível seguinte) expõem essa navegação diretamente.

Os níveis **1 a 3 (país, ilha, concelho)** têm **coordenadas geográficas** (`lat`, `long`). Os níveis 4 a 6 ainda não — ver [Dados relacionados e roadmap](#dados-relacionados-e-roadmap).

---

## Origem dos dados

A fonte primária é o **[Manual Técnico da e-Fatura](https://efatura.cv/docs/manual)** (`efatura.cv`), que publica a tabela oficial da divisão territorial de Cabo Verde usada na faturação eletrónica. É a referência mais completa e mais próxima do oficial que está disponível de forma aberta, chegando ao nível do lugar.

Sobre os dados originais foi feito trabalho de limpeza e enriquecimento:

- **Normalização de maiúsculas** — a fonte vinha integralmente em CAIXA ALTA (`RIBEIRA GRANDE`, `CHÃ DE ENRIQUE`). Os nomes foram convertidos para capitalização natural (`Ribeira Grande`, `Chã de Enrique`), preservando acentuação e as partículas em minúscula (`de`, `do`, `das`).
- **Correção de inconsistências nos códigos** — foram corrigidos códigos hierárquicos que não encaixavam no nível pai, entradas duplicadas e ligações erradas entre níveis, para garantir que a cadeia de prefixos fecha em todos os 4 040 registos.
- **Geolocalização até ao concelho** — foram adicionadas coordenadas (`lat`/`long`) aos níveis país, ilha e concelho, permitindo já centrar mapas e calcular proximidade a essa resolução.

> ⚠️ Os dados são uma reconstrução a partir de fonte pública e podem conter imprecisões. Não substituem cartografia oficial nem têm valor legal.

---

## Dados relacionados e roadmap

O passo seguinte é dar **geometria e coordenadas aos níveis inferiores** (freguesia, zona, lugar) e, idealmente, polígonos de fronteira. As fontes cabo-verdianas relevantes:

- **[IDE-CV — Infraestrutura de Dados Espaciais de Cabo Verde](https://ingt.gov.cv/ingt/Servi%C3%A7os/idecv/)** (INGT). Plataforma que disponibiliza recursos para publicação e consulta de dados geoespaciais georreferenciados do país, seguindo os padrões do **Open Geospatial Consortium (OGC)**. É a referência institucional para informação territorial em CV.
- **[Catálogo de metadados INGT / GeoNetwork](https://metadados-ingt.gov.cv/geonetwork/srv/fre/catalog.search#/home)** — catálogo de metadados sobre conjuntos de dados geoespaciais de Cabo Verde.
- **[Visualizador WebApp da Toponímia Nacional (ArcGIS)](https://ingt.maps.arcgis.com/apps/webappviewer/index.html?id=d2a7c59f23c34d3abf77f55ebad82de2)** — visualização da toponímia nacional.

Na prática, **obter os dados "crus"** (camadas vetoriais descarregáveis, e não apenas um visualizador) destas fontes é difícil. Enquanto isso não acontece, este projeto mantém-se assente na tabela da e-Fatura, com a geometria a ser adicionada de forma incremental à medida que os dados forem acessíveis.

---

## Casos de uso

- **Seletor de localização em cascata** — o utilizador escolhe ilha → concelho → freguesia → zona → lugar, com cada nível filtrado pelo anterior.
- **Validação e normalização de moradas** — mapear texto livre para um código canónico.
- **Filtros geográficos** — listar registos por ilha ou concelho num painel ou marketplace.
- **Autocompletar** — pesquisa textual tolerante a erros enquanto se escreve.
- **Mapas** — centrar e agrupar por coordenadas ao nível de país/ilha/concelho.

---

## Começar

### Requisitos

- Node.js 20+
- pnpm
- Docker (para o PostgreSQL) ou um PostgreSQL 16+ próprio

### Instalação

```bash
pnpm install
cp .env.sample .env
```

### Base de dados

O `docker-compose.yml` levanta um PostgreSQL 17 em `localhost:5433`:

```bash
docker compose up -d
```

Gerar migrações, aplicá-las e carregar os dados (seed) num só comando:

```bash
pnpm db:setup
```

> O seed é idempotente: cada nível só é inserido se a tabela estiver vazia.

### Arrancar

```bash
pnpm dev      # desenvolvimento, com reload
pnpm build && pnpm start   # produção
```

A API fica em `http://localhost:4000` e a documentação interativa em **`http://localhost:4000/docs`**.

---

## A API

Base: `/v1`. Todas as respostas são JSON.

### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/v1/countries` · `/v1/countries/:code` | Países |
| `GET` | `/v1/islands` · `/v1/islands/:code` | Ilhas — filtro `?countryId=` |
| `GET` | `/v1/municipalities` · `/v1/municipalities/:code` | Concelhos — filtro `?islandId=` |
| `GET` | `/v1/parishes` · `/v1/parishes/:code` | Freguesias — filtro `?municipalityId=` |
| `GET` | `/v1/zones` · `/v1/zones/:code` | Zonas — filtro `?parishId=` |
| `GET` | `/v1/places` · `/v1/places/:code` | Lugares — filtro `?zoneId=` |
| `GET` | `/v1/locations/:code` | Resolve **qualquer** código, em qualquer nível, e devolve-o etiquetado com o seu `type` |
| `GET` | `/v1/locations/:code/breadcrumb` | Cadeia de ascendentes, do país até ao próprio nível, cada um etiquetado com o seu `type` |
| `GET` | `/v1/locations/:code/children` | Filhos diretos (o nível seguinte) de qualquer código — paginado |
| `GET` | `/v1/locations/search` | Pesquisa textual em todos os 6 níveis |
| `GET` | `/v1/locations/stats` | Contagem de registos por nível |
| `GET` | `/healthcheck` | Estado do serviço |

### Paginação

Listagens aceitam `?limit=` (1–100, por omissão 20) e `?offset=` (por omissão 0).

### Envelope de resposta

```jsonc
{
  "data": [ /* ... */ ],
  "meta": { "total": 22, "limit": 20, "offset": 0, "hasMore": true }
}
```

Erros:

```jsonc
{ "error": { "status": "404", "message": "Not Found", "code": "..." } }
```

### Exemplos

```bash
# Ilhas
curl "http://localhost:4000/v1/islands"

# Concelhos da ilha de Santiago (islandId=7)
curl "http://localhost:4000/v1/municipalities?islandId=7&limit=50"

# Resolver um código qualquer
curl "http://localhost:4000/v1/locations/CV111"

# Trilho completo de um lugar: país → ilha → concelho → freguesia → zona → lugar
curl "http://localhost:4000/v1/locations/CV111111111011110101/breadcrumb"

# Filhos diretos de um concelho (as suas freguesias)
curl "http://localhost:4000/v1/locations/CV111/children?limit=50"

# Pesquisa tolerante a acentos e erros, só ao nível do lugar (level=6)
curl "http://localhost:4000/v1/locations/search?q=cha+de+enrike&level=6"
```

A pesquisa é *fuzzy*: insensível a maiúsculas e acentos, com correspondência por subcadeia e por similaridade trigram, e ordenada por pontuação (correspondência exata e por prefixo sobem ao topo).

---

## Stack técnica

Em resumo, uma API TypeScript enxuta sobre PostgreSQL, com a pesquisa a viver na base de dados.

| Camada | Tecnologia | Papel |
|---|---|---|
| Runtime | **Node.js + TypeScript** | — |
| Framework HTTP | **[Fastify 5](https://fastify.dev)** | Servidor, rotas, hooks, rate-limit, CORS |
| Validação & tipos | **[Zod 4](https://zod.dev)** + `fastify-type-provider-zod` | Um só esquema por rota que valida *input*/*output* **e** gera o OpenAPI |
| Documentação | **`@fastify/swagger`** + Swagger UI | OpenAPI 3 e página interativa em `/docs` |
| Base de dados | **PostgreSQL 17** | Fonte de verdade |
| ORM & migrações | **[Drizzle ORM](https://orm.drizzle.team)** + `drizzle-kit` | Esquema tipado, migrações versionadas, seed |
| Pesquisa textual | Extensões **`pg_trgm`** + **`unaccent`** | Colunas geradas `name_normalized` (minúsculas, sem acentos) com índices GIN trigram; a query faz `UNION ALL` sobre os 6 níveis e pontua por similaridade |
| Logging | **[Pino](https://getpino.io)** | Logs estruturados |
| Gestor de pacotes | **pnpm** | — |

Ideias-chave do desenho:

- **Um esquema, três usos.** Cada rota declara um esquema Zod que serve simultaneamente de validação de pedido, de contrato de resposta e de definição OpenAPI — não há tipos duplicados nem documentação a divergir do código.
- **Pesquisa na base de dados.** Nada de índice externo. `pg_trgm` + colunas normalizadas geradas pelo Postgres dão pesquisa tolerante a erros com uma única dependência: a própria BD.
- **Códigos hierárquicos.** Como o código de cada nível é prefixo do nível abaixo, resolver ou navegar a hierarquia é aritmética de strings, não travessia de tabelas.
- **Stats pré-calculadas.** `/v1/locations/stats` serve constantes geradas por `pnpm seeds:count`, evitando seis `COUNT(*)` por pedido.

---

## Estrutura do projeto

```
src/
├── main.ts               # arranque + encerramento gracioso
├── server.ts             # construção da instância Fastify
├── config.ts             # env validado por Zod
├── routes.ts             # registo de todas as rotas
├── db/
│   ├── schemas/locations/ # tabelas Drizzle: countries … places
│   ├── migrations/        # SQL versionado
│   └── seeds/
│       ├── data/*.json    # dados da e-Fatura, já tratados
│       └── locations/     # carregadores idempotentes por nível
├── modules/
│   ├── locations/         # rotas CRUD de leitura por nível
│   └── search/            # pesquisa fuzzy multi-nível
├── plugins/               # cors, rate-limit, swagger, erros
└── shared/ · utils/       # paginação, erros, logger
```

---

## Scripts

| Comando | Ação |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento com reload |
| `pnpm build` / `pnpm start` | Compilar / correr a build |
| `pnpm db:setup` | `generate` + `migrate` + `seed` |
| `pnpm db:migrate` · `pnpm db:seed` | Passos individuais |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm seeds:count` | Recontar registos por nível (atualizar `LOCATION_STATS`) |
| `pnpm lint` · `pnpm format` | ESLint · Prettier |

---

## Estado e contribuição

Projeto em fase inicial (MVP). A API de leitura e a pesquisa estão funcionais; a geometria dos níveis inferiores é o principal trabalho em aberto. Correções aos dados — nomes, códigos, ligações entre níveis — são especialmente bem-vindas, já que a fonte é imperfeita.

---

## Licença

[MIT](LICENSE) © 2026 Nuno Lima.

Os dados de localização derivam do Manual Técnico da e-Fatura, uma fonte pública; verifica os termos de uso da e-Fatura para o teu caso concreto.
