import express from "express";
import path from "path"
import { fileURLToPath } from "url";
import connectDB from "./src/dbconnect.mjs";
import bodyParser from "body-parser"

import * as tableApi from "./src/tableApi.mjs"


const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB()

//publicフォルダ公開
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")));
app.use("/libs",express.static(path.join(__dirname, "node_modules")))

//APIルート登録
app.post("/api/table/createTableData", tableApi.createTableData)
app.post("/api/table/getTableDataInfo", tableApi.getTableDataInfo)
app.post("/api/table/upsertTableData", tableApi.upsertTableData)
app.post("/api/table/deleteTableData", tableApi.deleteTableData)
app.post("/api/table/exportExcelFile", tableApi.exportExcelFile)


app.listen(PORT, () => {
    console.log(`localhost:${PORT}"`)
})