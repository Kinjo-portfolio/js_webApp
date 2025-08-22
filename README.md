# js_webApp

## 📌 概要
このプロジェクトは **ExcelデータをWeb上で読み込み・編集・保存** できるWebアプリケーションです。  
- フロントエンドで [Handsontable v6.2.2](https://handsontable.com/) を利用して表形式のUIを実装  
- [ExcelJS](https://github.com/exceljs/exceljs) によるExcelファイルの入出力  
- Node.js + Express でAPIを構築し、MongoDBと連携してデータをCRUD操作可能

---

## 🛠️ 技術スタック
- **Frontend** : HTML, CSS, JavaScript, Handsontable, ExcelJS  
- **Backend** : Node.js, Express  
- **Database** : MongoDB  
- **開発環境** : VS Code  

---

## 🚀 主な機能
- ExcelファイルをインポートしてWeb上に表示  
- Handsontableで行の追加・削除・ハイライト編集  
- 編集内容をMongoDBに保存（CRUD対応API）  
- データをExcel形式でエクスポート  

---

## 📂 ディレクトリ構成
```
/public
  ├─ index.html        # 画面本体
  ├─ index.css         # スタイル
  └─ src/
       ├─ viewmodel.js # UIイベント制御
       ├─ model.js     # 業務ロジック・データ整形
       ├─ network.js   # API通信処理
       └─ table.js     # Handsontable関連処理
/server
  └─ tableApi.mjs      # Express + MongoDB API
```

---

## ⚙️ セットアップ
### 1. リポジトリをクローン
```bash
git clone https://github.com/Kinjo-portfolio/js_webApp.git
cd js_webApp
```

### 2. 依存パッケージをインストール
```bash
npm install
```

### 3. 環境変数を設定
`.env.example` をコピーして `.env` を作成し、MongoDB接続情報を記入：
```
MONGODB_URI=mongodb+srv://<USER>:<PASS>@<CLUSTER>/<DB>
PORT=3000
```

### 4. 開発サーバーを起動
```bash
npm run dev
```
ブラウザで [http://localhost:3000](http://localhost:3000) を開く。

---

## 📖 APIエンドポイント
- `GET /api/table/:id` … テーブル情報取得  
- `PUT /api/table/:id` … テーブル更新  
- `DELETE /api/table/:id` … テーブル削除  

---

## 📝 備考
- Handsontableは **無償版 v6.2.2** を利用（ライセンスキー不要）  
- `.env` ファイルは `.gitignore` に設定済み（リポジトリには含まれません）  
- 本プロジェクトは学習・ポートフォリオ用です  

---

