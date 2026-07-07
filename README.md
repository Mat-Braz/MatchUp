# MatchUp

MatchUp e um aplicativo mobile para conectar atletas, instituicoes e campeonatos. O projeto usa Expo/React Native com Expo SDK 56, Expo Router e `expo-dev-client`.

Este projeto deve ser executado no Android usando uma **development build** instalada no celular. O Expo Go nao e o fluxo principal deste projeto.

## Estado atual

- Fluxo de autenticacao com telas de splash, login, criacao de conta, recuperacao de senha e verificacao de codigo.
- Area protegida com navegacao por abas para inicio, explorar, contatos, notificacoes e perfil seguindo o design Pencil.
- Estrutura preparada para modulos de atleta, instituicao, campeonatos e chat.
- Componentes compartilhados de UI em `src/components` e componentes especificos de autenticacao em `src/features/auth`.

## Estrutura principal

```txt
src/
  app/                 Rotas do Expo Router
  components/          Componentes reutilizaveis de UI, cards e layout
  constants/           Rotas, tema e constantes compartilhadas
  data/mock/           Espaco para dados mockados de desenvolvimento
  features/auth/       Componentes e fluxo visual de autenticacao
```

## Requisitos

- Node.js compativel com Expo SDK 56.
- npm.
- Android SDK Platform Tools com `adb` disponivel no terminal.
- Um dispositivo Android com depuracao USB ativada.
- Development build do MatchUp instalada no dispositivo.

## Instalar dependencias

Na raiz do projeto:

```sh
npm install
```

## APK da development build

O APK/AAB da development build fica no painel do Expo/EAS, na lista de builds do projeto:

```txt
https://expo.dev/accounts/mano_mb/projects/MatchUp/builds
```

Procure uma build Android com perfil `development` e distribution `internal`. Baixe e instale o APK no celular.

Se precisar gerar uma nova development build:

```sh
npx eas build --platform android --profile development
```

Depois que a build terminar, o EAS mostra um link para download. Tambem e possivel encontrar o mesmo link no painel acima.

## Configurar o celular Android

No celular:

1. Ative **Opcoes do desenvolvedor**.
2. Ative **Depuracao USB**.
3. Conecte o celular no PC via cabo USB de dados.
4. Aceite o popup **Permitir depuracao USB?**.
5. Se aparecer opcao de USB, selecione **Transferencia de arquivos / Android Auto**.

Em celulares Samsung, se a opcao USB nao aparecer:

1. Va em **Configuracoes > Opcoes do desenvolvedor**.
2. Abra **Configuracao USB padrao**.
3. Selecione **Transferencia de arquivos**.

## Configurar o PC para usar adb

Verifique se o dispositivo aparece:

```sh
adb devices
```

O resultado esperado e algo como:

```txt
List of devices attached
XXXXXXXX    device
```

Se o comando `adb` nao existir, adicione o Android Platform Tools ao `PATH` do Windows:

```txt
C:\Users\mateu\AppData\Local\Android\Sdk\platform-tools
```

Tambem da para executar usando o caminho completo:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

Se o dispositivo aparecer como `unauthorized`, desbloqueie o celular e aceite o popup de depuracao USB.

Se a lista vier vazia, tente:

```sh
adb kill-server
adb start-server
adb devices
```

Se ainda nao aparecer, troque o cabo USB, use outra porta USB ou instale o Samsung USB Driver/Smart Switch.

## Rodar via USB

Com o celular conectado e aparecendo como `device`:

```sh
adb reverse tcp:8081 tcp:8081
npx expo start --dev-client --android
```

O Expo deve abrir automaticamente a development build instalada no celular.

Se o app ja estiver aberto, ele sera recarregado. Se estiver fechado, o comando tenta abrir sozinho. Se o celular estiver bloqueado, desbloqueie para ver o app abrir.

## Rodar manualmente pelo app

Tambem e possivel iniciar o Metro e abrir a build manualmente:

```sh
npx expo start --dev-client
```

Depois, no celular:

1. Abra o app **MatchUp** instalado pela development build.
2. Use a opcao de escanear QR Code ou conectar ao servidor de desenvolvimento.
3. Se estiver via USB, mantenha o reverse ativo:

```sh
adb reverse tcp:8081 tcp:8081
```

## Package Android

O package Android configurado no projeto e:

```txt
com.mano_mb.MatchUp
```

Esse valor precisa bater com a development build instalada no celular. Se o Expo disser que nao encontrou uma development build instalada, confira os packages no dispositivo:

```sh
adb shell pm list packages | findstr /i "match expo mano"
```

Se o package instalado for diferente, ajuste `expo.android.package` em `app.json` ou instale uma build gerada com o package atual.

## Comandos uteis

Iniciar o projeto:

```sh
npm start
```

Iniciar com development client:

```sh
npx expo start --dev-client
```

Abrir no Android via USB:

```sh
npx expo start --dev-client --android
```

Forcar conexao USB com Metro:

```sh
adb reverse tcp:8081 tcp:8081
```

Limpar/reiniciar adb:

```sh
adb kill-server
adb start-server
adb devices
```

## Problemas comuns

### `adb` nao e reconhecido

O Platform Tools nao esta no `PATH`. Adicione:

```txt
C:\Users\mateu\AppData\Local\Android\Sdk\platform-tools
```

Feche e reabra o terminal depois de alterar o `PATH`.

### `adb devices` aparece vazio

O PC nao esta enxergando o celular via USB de dados. Troque o cabo, use outra porta USB, ative depuracao USB, aceite o popup no celular ou instale o driver USB da Samsung.

### `No development build (...) for this project is installed`

A build instalada no celular tem package diferente do `android.package` em `app.json`, ou a development build ainda nao foi instalada.

Instale a build correta ou confira o package com:

```sh
adb shell pm list packages | findstr /i "match expo mano"
```

### O app abre, mas mostra erro de JavaScript

Nesse caso a conexao funcionou. O erro esta no codigo do app e deve aparecer nos logs do Metro no terminal.
