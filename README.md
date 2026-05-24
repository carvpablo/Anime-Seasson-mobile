# 🌸 AnimeSeason

Uma aplicação mobile premium e repleta de recursos desenvolvida em React Native com Expo, Jikan API (MyAnimeList) e Supabase. O **AnimeSeason** permite aos usuários acompanhar os animes que estão sendo transmitidos na temporada atual, explorar calendários de lançamentos semanais, personalizar perfis, realizar buscas com filtros avançados SFW/NSFW e favoritar suas séries prediletas.

---

## 🌟 Principais Funcionalidades

*   **🔒 Autenticação Segura**: Fluxo completo de cadastro, login e persistência de sessão de usuário gerenciado pelo **Supabase Auth**.
*   **👤 Perfis Interativos**: Perfis de usuário customizáveis com um seletor interativo de avatares locais, estatísticas dinâmicas de conta e desconexão segura (sign-out).
*   **📺 Feed da Temporada em Tempo Real**: Navegue pelos animes em exibição na temporada atual diretamente pela **Jikan API (V4)**, com paginação infinita (infinite scroll) fluida e atualização por gesto de arrastar (pull-to-refresh).
*   **📅 Calendário de Lançamento Semanal**: Abas organizadas pelos dias da semana que exibem exatamente quais animes vão ao ar em cada dia, incluindo horários de transmissão, notas do MAL (score) e chips de gêneros.
*   **🔍 Busca e Descoberta Avançada**: Filtros profundos para buscar animes por palavras-chave, estúdio produtor, formato de mídia (TV, Filme, OVA, ONA, Especial), nota mínima, contagem de episódios e gêneros específicos.
*   **🛡️ Filtro de Busca Segura (SFW) Opcional**: Um filtro geral de conteúdo que bloqueia animes adultos ou explícitos (Hentai, Ecchi, Erotica). Inclui uma confirmação descontraída ao tentar desativá-lo.
*   **🔖 Favoritos Inteligentes (Bookmarks)**: Salve séries em sua lista pessoal de favoritos com micro-animações elegantes (botão de bookmark com efeito elástico elástico-spring). Desenvolvido usando **Atualizações Otimistas (Optimistic Updates)** integradas ao Supabase para respostas locais instantâneas e rollback automático em caso de falha de conexão.
*   **✨ Design de UI/UX Primoroso**: Tema escuro elegante com acentos neon marcantes, cartões com efeito translúcido (estilo glassmorphism), cabeçalhos de imagens com efeito parallax elástico ao rolar, loaders com efeito skeleton e transições de tela fluidas.

---

## 🛠️ Arquitetura e Tecnologias

*   **Framework Principal**: [React Native](https://reactnative.dev/) com [Expo SDK 54](https://expo.dev/) (compatível com iOS, Android e Web).
*   **Gerenciamento de Estado**: React Context (`AuthContext`, `FavoritesContext`, `SafeSearchContext`) para controle de estados unificado e reativo.
*   **Navegação**: [React Navigation 7](https://reactnavigation.org/) combinando Stack, Bottom Tabs e Drawer navigations para proporcionar uma navegação fluida e intuitiva.
*   **Backend e Banco de Dados**: [Supabase](https://supabase.com/) para armazenamento na nuvem, autenticação e sincronização segura de dados.
*   **Comunicação de Rede**: [Axios](https://axios-http.com/) para consumo da API do Jikan. Utiliza um **algoritmo de retry com recuo exponencial (exponential backoff)** para contornar de forma elegante os limites de requisições do MAL (`429 Too Many Requests`).
*   **Adaptador de Armazenamento Personalizado**: Um utilitário inteligente de armazenamento multiplataforma. Usa automaticamente `localStorage` na Web, e particiona os tokens JWT grandes do Supabase em múltiplos fragmentos utilizando `expo-secure-store` em dispositivos nativos, contornando a limitação nativa de chaves de até 2KB.

---

## 📂 Estrutura do Projeto

```text
├── assets/                  # Imagens do app, ícones e arquivos de avatares locais
├── src/
│   ├── components/          # Elementos de interface reutilizáveis (AnimeCard, Loaders, ErrorState, Tabs)
│   ├── constants/           # Tema de estilo (cores, espaçamento, tipografia) e metadados de APIs
│   ├── context/             # Provedores de contexto globais do React (Auth, Favorites, SafeSearch)
│   ├── hooks/               # Hooks customizados para listagem seasonal, calendário e paginação
│   ├── navigation/          # Roteadores do React Navigation, configurações de Stack e Tabs
│   ├── screens/             # Componentes de tela (Home, Search, Details, Profile, Bookmarks)
│   │   └── auth/            # Telas de fluxo de Login e Registro
│   ├── services/            # Clientes Supabase e camadas de consumo de API do Jikan
│   └── utils/               # Formatação de datas/horários, sanitizadores de textos e ajudantes de arrays
├── App.js                   # Inicializador raiz do aplicativo
├── app.json                 # Configurações do Expo
└── package.json             # Dependências do projeto e scripts de execução
```

---

## ⚡ Como Iniciar o Projeto

### Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) e o aplicativo [Expo Go](https://expo.dev/expo-go) (ou um emulador mobile) instalados em seu computador.

### 1. Clonar e Instalar
```bash
# Clone o repositório
git clone https://github.com/carvpablo/Anime-Seasson-mobile.git
cd Anime-Seasson-mobile

# Instale as dependências
npm install
```

### 2. Configurar o Backend (Supabase)
Certifique-se de que seu banco de dados Supabase possua as tabelas PostgreSQL estruturadas da seguinte forma:

#### Tabela `profiles`
Armazena informações adicionais do perfil do usuário:
```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  avatar_id text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### Tabela `favorites`
Armazena os animes favoritos de cada usuário com suporte a atualizações otimistas:
```sql
create table favorites (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  mal_id bigint not null,
  title text,
  title_english text,
  image_url text,
  score double precision,
  type text,
  episodes integer,
  status text,
  favorited_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, mal_id)
);
```

> **Nota**: Não se esqueça de preencher as chaves de acesso (`SUPABASE_URL` e `SUPABASE_ANON_KEY`) no arquivo [src/services/supabaseClient.js](file:///c:/Users/Pablo/Documents/projeto-mobile-original/src/services/supabaseClient.js).

### 3. Executar o Aplicativo
```bash
# Inicie o servidor de desenvolvimento do Expo
npm run start
```
*   Pressione `a` para rodar em um emulador ou dispositivo físico Android.
*   Pressione `i` para rodar em um simulador iOS.
*   Pressione `w` to rodar a versão Web no navegador.
*   Escaneie o QR Code exibido no terminal com o aplicativo **Expo Go** em seu celular para rodar o app diretamente no seu dispositivo físico.

---

## 🎨 Sistema de Design
Todos os elementos visuais seguem uma paleta de cores escura inspirada em tons cyberpunk, definida no arquivo [src/constants/theme.js](file:///c:/Users/Pablo/Documents/projeto-mobile-original/src/constants/theme.js):
- **Background**: Tons pretos profundos e obsidiana (`#0D0D0D` / `#151515`)
- **Accent**: Rosa/Carmim vibrante e destacado (`#E94560`)
- **Accent Light**: Acento carmim translúcido e suave (`rgba(233,69,96,0.12)`)
- **Tipografia**: Hierarquias tipográficas responsivas e legíveis tanto para títulos quanto para pequenos rótulos de metadados.

---

## 📄 Licença
Este projeto é de código aberto e está licenciado sob a licença MIT.
