# concurrent-progress-report-bot

![CI Badge](https://github.com/rassi0429/spotify4concurrent/actions/workflows/docker-build-release.yaml/badge.svg)
![License MIT](https://img.shields.io/github/license/rassi0429/spotify4concurrent)

concurrentの今日の一日を投稿するBotです。

## helm repo

`https://rassi0429.github.io/helmcharts/`

## 環境変数

helmのvaluesも同じ名前になっています。

## refresh tokenの取り方

```bash
npm run auth
```
でRefresh tokenを取得してください。
CLIENT_IDとCLIENT_SECRETをつけて起動してください。

| 環境変数名                  | 説明                                   |
|------------------------|--------------------------------------|
| CLIENT_ID              | Spotify client id                    |
| CLIENT_SECRET          | spotify client secret                |
| REFRESH_TOKEN          | your spotify refresh token           |
| CCID                   | Concurrent CCID                      |
| PRIVATE_KEY            | Concurrent Private key               |
| CONCURRENT_HOST        | Concurrent account host              |
| CONCURENT_POST_STREAMS | now listeningを流すストリームをカンマ区切りで入れてください |
