# 🏸 バドミントン スタッツ記録

試合ごとのスタッツ（得点の取り方・失点の仕方）を、1点ごとに「決まり方」を1タップで記録する練習用アプリ。記録は Firebase に保存され、同じ「チームの合言葉」の端末どうしで履歴を共有・蓄積できる。

得点カウンター（badminton-tournament / badminton-scorer）とは独立したアプリ。採点ロジックは流用しつつ、ライブ中継ではなく試合終了時に1試合＝1レコードとして保存する。

## 使い方
1. ホームで「新しい試合を記録」→ ラベル・得点方式・種目・選手名を入力して開始。
2. 得点した側をタップ → 「どう決まった？」で決まり方を1つ選ぶ（決め球 or 相手のミス）。1点あたり2タップ。
3. 試合終了でサマリー表示 →「クラウドに保存」。
4. ホームの「履歴を見る」で過去試合の一覧・個別サマリーを確認。各試合は × で削除可。

## 記録する項目
- 各ラリーの勝者サイド・決まり方（決め球の球種 / 相手のミスの種類 / 不明）
- 集計：選手（サイド）ごとに 得点・ウィナー数（球種別）・失点・自分のミス内訳

## ファイル
| ファイル | 役割 |
|---|---|
| `index.html` | アプリ本体（ホーム/設定/採点+記録/サマリー/履歴/詳細） |
| `store.js` | Firebase 保存層（stats/{team}/matches） |
| `firebase-config.js` | Firebase 設定（大会システムと同じプロジェクト、領域は stats/） |
| `firebase-boot.js` | Firebase SDK の起動 |

## チームの合言葉（team）
- 既定は `ojbad`。ホームの「変更」から変えられる（端末ローカルに記憶）。
- 同じ合言葉の端末どうしで履歴を共有。大会システムの room とは別領域 stats/ に保存。

## Firebase セキュリティルール（追加が必要）
大会システムの rooms に加えて stats を許可する。Realtime Database のルールに以下を含める:
```json
{
  "rules": {
    "rooms": {
      "$room": {
        "matches": {
          ".read": true,
          "$court": {
            ".write": true,
            ".validate": "newData.hasChildren(['court','scoreA','scoreB','status','updatedAt'])"
          }
        }
      }
    },
    "stats": {
      "$team": {
        "matches": {
          ".read": true,
          ".write": true
        }
      }
    }
  }
}
```

※ Firebase のウェブ設定キーはクライアント公開前提のもので秘密情報ではない。保護は Realtime Database のルールで行う。
