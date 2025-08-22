import mongoose, { mongo } from "mongoose";
import ExcelJS from "exceljs"
import fs from "node:fs/promises"
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


//DBに追加保存#APIテスト用
export const createTableData = async (req, res) => {
    let curentId = 1

    const data = [
        { itemA: "1", itemB: "2", itemC: "a" },
        { itemA: "2", itemB: "4", itemC: "a" },
        { itemA: "3", itemB: "5", itemC: "a" }
    ];
    try {
        const db = mongoose.connection.useDb("beutuki")
        const collection = db.collection("tablecollection")

        const id = curentId++

        await collection.insertOne({ id, data, createdAt: new Date() })

        res.json({ id, result: "ok" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ result: "ng" })
    }
};

//テーブル取り出し
export const getTableDataInfo = async (req, res) => {
    // console.log(req.body.id)
    const id = req.body.id

    let result = {
        id: null,
        data: null,
        status: "ng"
    }

    try {

        //DB接続設定
        const db = mongoose.connection.useDb("beutuki")
        const collection = db.collection("tablecollection")

        const record = await collection.findOne({ id })

        if (record) {
            result.id = record.id
            result.data = record.data
            result.status = "ok"
        } else {
            result.status = "ng"
        }
    } catch (err) {
        console.error(err)
        result.status = "error"
    }
    res.json(result)
}

// テーブル更新・追加
export const upsertTableData = async (req, res) => {
    const id = req.body.id

    const data = req.body.data

    let result = {
        id: null,
        action: null,
        status: "ng"
    }

    try {

        const db = mongoose.connection.useDb("beutuki")
        const collection = db.collection("tablecollection")

        //idが見つかった場合に更新
        if (id !== undefined) {
            const found = await collection.findOne({ id })
            if (found) {
                await collection.updateOne(
                    { id },
                    { $set: { data, updatedAt: new Date() } }
                )
                result.id = id,
                    result.status = "ok"
                result.action = "更新"
                return res.json(result)
            }
        }

        //idがなく新規追加
        const maxDoc = await collection.find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();

        const newId = maxDoc.length ? maxDoc[0].id + 1 : 1

        await collection.insertOne({ id: newId, data, createdAt: new Date() })

        result.id = newId,
            result.status = "ok",
            result.action = "追加"
        return res.json(result)
    } catch (err) {
        console.error(err)
        return res.status(500).json({ id: null, status: "error" })
    }
}

// テーブル削除
export const deleteTableData = async (req, res) => {
    const id = req.body.id

    let result = {
        status: "ng"
    }

    try {

        if (!id) {
            return res.status(400).join({ status: "ng", message: "id is required" })
        }

        const db = mongoose.connection.useDb("beutuki")
        const collection = db.collection("tablecollection")


        const found = await collection.findOne({ id })
        if (!found) {
            return res.status(404).json({ status: "ng", message: "not found" })
        }

        const delRes = await collection.deleteOne({ id })
        if (delRes.deletedCount > 0) {
            result.status = "ok"
        }
        return res.json(result)

    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: "ng", message: "server error" })
    }
}

// Excelファイル出力
export const exportExcelFile = async (req, res) => {
    const data = req.body.data

    let result = {
        status: "ng",
        base64: null
    }

    const tmpDir = path.join(__dirname, "..","temporary")
    const tmpPath = path.join(tmpDir, `export_${Date.now()}.xlsx`)


    try {

        await fs.mkdir(tmpDir, {recursive: true})
        
        //新規でワークブックとワークシートを作成
        const wb = new ExcelJS.Workbook()
        const ws = wb.addWorksheet("Sheet1")

        // レイアウトの基本設定
        const headers = ["itemA", "itemB", "itemC"]
        const startRow = 2
        const startCol = 2

        // ヘッダーのセル設定
        headers.forEach((h, i) => {
            const cell = ws.getCell(startRow, startCol + i)
            cell.value = h
            cell.font = { bold: true }
            cell.alignment = { horizontal: "center", vertical: "middle" }
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBFE8F5" } }
            ws.getColumn(startCol + i).width = 12
        })

        if (data.length > 0) {
            const dataStartRow = startRow + 1
            data.forEach((rowObj, r) => {
                headers.forEach((key, c) => {
                    const v = rowObj?.[key]
                    ws.getCell(dataStartRow + r, startCol + c).value = v === undefined ? undefined : v
                })
            })

            const lastDataRow = startRow + data.length
            const endCol = startCol + headers.length - 1

            for (let r = dataStartRow; r <= lastDataRow; r++ ) {
                for (let c = startCol; c <= endCol; c++ ) {
                    ws.getCell(r, c).alignment = { horizontal:"center", vertical:"middle"}
                }
            }

            const thin = { style: "thin", color: { argb: "FF000000" } }
            const thick = { style: "medium", color: { argb: "FF000000" } }

            for (let r = startRow; r <= lastDataRow; r++) {
                for (let c = startCol; c <= endCol; c++) {
                    ws.getCell(r, c).border = {
                        top: r === startRow ? thick : thin,
                        bottom: r === lastDataRow ? thick : thin,
                        left: c === startCol ? thick : thin,
                        right: c === endCol ? thick : thin
                    }
                }
            }
        }

        await wb.xlsx.writeFile(tmpPath)
        const buf = await fs.readFile(tmpPath)
        result.base64 = buf.toString("base64")
        result.status = "ok"

        return res.json(result)
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: "ng", base64:null, message: "server error" })
    } 
    finally {
        try {
            await fs.unlink(tmpPath)
        } catch {}
    }
}

// Excelファイルインポート
export const importExcelFle = async (req, res) => {
    
}