# js_webApp

Excel を **Webで読み込み・編集・保存** できる学習用 Web アプリです。  
フロントは Handsontable + ExcelJS、サーバは Node.js/Express、DB は MongoDB を使用します。

---

## 🗺 アーキテクチャ概要

```
UI(Handsontable) → viewmodel.js → model.js → network.js → Express API → MongoDB
```

- **viewmodel.js**: 画面イベントから呼ばれる“橋渡し”。リクエスト整形だけを担当。  
- **model.js**: いまは network を re-export（将来はバリデーション/整形/業務ロジックをここに集約）。  
- **network.js**: fetch を使った通信層。APIのURLやHTTP処理を一本化。  
- **server.mjs**: Express 起動・静的配信・API ルーティング・DB 接続。  
- **src/tableApi.mjs**: CRUD と Excel 出力の実処理。  
- **src/dbconnect.mjs**: MongoDB 接続（`mongodb://localhost:27017/beutuki`）。

---

## 📂 ディレクトリ構成

```
project-root/
├─ public/
│  ├─ index.html
│  ├─ index.css
│  └─ src/
│     ├─ table.js        # Handsontable描画とUIイベント
│     ├─ viewmodel.js    # UI→モデルの橋渡し
│     ├─ model.js        # networkのre-export（将来のロジック置き場）
│     └─ network.js      # API通信(fetch)
├─ src/
│  ├─ dbconnect.mjs      # MongoDB接続
│  └─ tableApi.mjs       # CRUD / Excel出力 実装
├─ temporary/            # Excel一時出力
├─ server.mjs            # Expressサーバのエントリ
├─ server.bat            # Windows起動( node server.mjs )
├─ package.json
└─ README.md
```

---

## 🧰 必要環境

- Node.js 18+  
- MongoDB（ローカル起動、デフォルト: `localhost:27017`）  
- Windows（`server.bat` を使う場合）

---

## ⚙️ セットアップ

### 1) 依存インストール
```bash
npm install
```

### 2) MongoDB を起動
```bash
mongod --dbpath "C:\data\db"
```
> DB 名は `beutuki`、コレクションは `tablecollection` を使用します。

### 3) サーバー起動
- Windows: `server.bat` を実行  
- それ以外: `node server.mjs`
  
起動すると `http://localhost:3000` でアクセスできます。

---

## 🔌 API 仕様（すべて POST / JSON）

| パス | 説明 | 例 |
|---|---|---|
| `/api/table/createTableData` | サンプル1件を挿入（テスト用） | — |
| `/api/table/getTableDataInfo` | 1件取得 | `{"id":1}` |
| `/api/table/upsertTableData` | 追加/更新（id有→更新, 無→採番して追加） | `{"id":1,"data":[{"itemA":"1","itemB":"2","itemC":"a"}]}` |
| `/api/table/deleteTableData` | 1件削除 | `{"id":2}` |
| `/api/table/exportExcelFile` | Excel出力（Base64返却） | `{"data":[{"itemA":"1","itemB":"2","itemC":"a"}]}` |

**Response例**  
- get: `{"id":1,"data":[...],"status":"ok"}` / not found: `{"id":null,"data":null,"status":"ng"}`  
- upsert: `{"id":1,"action":"更新","status":"ok"}` or `{"id":2,"action":"追加","status":"ok"}`  
- delete: 成功 `{"status":"ok"}` / 404 `{"status":"ng","message":"not found"}`  
- export: `{"status":"ok","base64":"<xlsx base64>"}`

**cURL（例）**
```bash
# 取得
curl -X POST http://localhost:3000/api/table/getTableDataInfo   -H "Content-Type: application/json"   -d '{"id":1}'

# 追加/更新
curl -X POST http://localhost:3000/api/table/upsertTableData   -H "Content-Type: application/json"   -d '{"data":[{"itemA":"1","itemB":"2","itemC":"a"}]}'
```

---

## 🖥 画面の使い方（/public/index.html）

- **入力エリア**: itemA/B/C を入力 → 「追加」で表に行追加  
- **テーブル操作**: 「表示」で指定 ID を読み込み／「DBから削除」で削除  
- **保存/出力**: 「DB保存」で upsert／「Excel出力」で XLSX ダウンロード  
- **Excel読み込み**: 既存ファイルを取り込んで表に反映

> Handsontableの表は、右端の削除列をクリックで行削除。強調行・カスタムレンダラあり。

---

## 🧩 主要スクリプトの役割

- `public/src/table.js`  
  - Handsontableインスタンス生成、行追加/削除、Excel入出力のUI処理
- `public/src/viewmodel.js`  
  - `getTableDataInfo / upsertTableData / deleteTableData / exportExcelFile` を公開
- `public/src/model.js`  
  - 現状は `network.js` の関数を再公開（将来の拡張点）
- `public/src/network.js`  
  - fetch を使った API 呼び出しラッパー（URL・ヘッダ統一）
- `src/tableApi.mjs`  
  - MongoDB CRUD と ExcelJS による XLSX 生成（Base64返却）
- `src/dbconnect.mjs`  
  - `mongodb://localhost:27017/beutuki` に接続

