import * as viewmodel from "./viewmodel.js"

// 画面要素取得
const elements = {
  container: document.getElementById("hot"),
  input: {
    inputA: document.getElementById("itemA"),
    inputB: document.getElementById("itemB"),
    inputC: document.getElementById("itemC"),
    inputId: document.getElementById("tabeIdInput"),
    importFile: document.getElementById("excelInput")
  },

  button: {
    addBtn: document.getElementById("addRow"),
    showBtn: document.getElementById("showTableBtn"),
    saveBtn: document.getElementById("saveBtn"),
    exportExcelBtn : document.getElementById("exportExcelBtn"),
    deleteDbBtn : document.getElementById("deleteTableBtn"),
    importExcelBtn: document.getElementById("importExcelBtn")
  }
}

const initialize = () => {
  elements.button.addBtn.onclick = addRowTable
  elements.button.showBtn.onclick = showTable
  elements.button.saveBtn.onclick = saveTable
  elements.button.deleteDbBtn.onclick = deleteTable
  elements.button.exportExcelBtn.onclick = exportExcelFile
  elements.button.importExcelBtn.onclick = importExcelFile
}

let selectedRowIndex = null

const initialData = [
  { itemA: "1", itemB: "2", itemC: "a" },
  { itemA: "2", itemB: "4", itemC: "a" },
  { itemA: "3", itemB: "5", itemC: "a" }
]

const columns = [
  { data: "itemA" },
  { data: "itemB" },
  { data: "itemC" },
  { data: "deleteCell" }
]

const deleteCol = columns.length - 1

// 削除セル描画
const deleteRender = (hot, td) => {
  td.innerHTML = "削除"
  td.style.backgroundColor = "#ccc"
  td.style.textAlign = "center"
  td.style.cursor = "pointer"
}

// セルスタイル
const styleCells = (row, col) => {
  const props = {}
  const classes = []

  //選択した列が削除列なら
  if (col === deleteCol) {
    props.renderer = deleteRender
    classes.push("delete-cell")
  }
  //選択した行が削除列じゃないなら
  if (row === selectedRowIndex && col !== deleteCol) {
    classes.push("highlighted-row")
  }

  props.className = classes.join(" ")
  return props
}

// 表本体
const hot = new Handsontable(elements.container, {
  data: [...initialData],
  columns,
  colHeaders: ["itemA", "itemB", "itemC", ""],
  colWidths: [null, null, null, 80],
  stretchH: "all",
  width: 600,
  readOnly: true,
  disableVisualSelection: true,
  rowHeaders: false,
  className: "htCenter htMiddle",
  cells: styleCells
})

// クリック処理
elements.container.addEventListener("mousedown", (e) => {
  const td = e.target.closest("td")
  if (!td) return
  const { row, col } = hot.getCoords(td)

  if (row < 0 || col < 0) return

  if (col === deleteCol) {
    hot.alter("remove_row", row)
    if (selectedRowIndex === row) selectedRowIndex = null
    else if (selectedRowIndex > row) selectedRowIndex--
  } else {
    selectedRowIndex = row
  }

  hot.render()
})


//行追加機能
const addRowTable = () => {
  const valueA = $(elements.input.inputA).val()
  const valueB = $(elements.input.inputB).val()
  const valueC = $(elements.input.inputC).val()

  const newRowIndex = hot.countRows()
  hot.alter("insert_row", newRowIndex)
  hot.setDataAtRowProp(newRowIndex, "itemA", valueA)
  hot.setDataAtRowProp(newRowIndex, "itemB", valueB)
  hot.setDataAtRowProp(newRowIndex, "itemC", valueC)

  $(elements.input.inputA).val('')
  $(elements.input.inputB).val('')
  $(elements.input.inputC).val('')

  hot.render()
}

//テーブル検索表示
const showTable = async() => {
  const id = Number($(elements.input.inputId).val())
  if (!id) return

  const result = await viewmodel.getTableDataInfo(id)
  if( result.status === "ok") {
    hot.loadData(result.data)
    hot.render()
  }

}

//DB更新・追加
const saveTable = async() => {
  const id = Number($(elements.input.inputId).val())
  const data = hot.getSourceData()

  if ( !data || data.length === 0 ) {
    data = [{itemA:"",itemB:"",itemC:""}]
  }

  if (!Number.isFinite(id) ) {
    id = ""
  }

  const result = await viewmodel.upsertTableData(id,data)

  if ( result.status === "ok") {
    $(elements.input.inputId).val(result.id)
  }
}

// テーブルデータ削除
const deleteTable = async() => {
  const id = Number($(elements.input.inputId).val())
  if (!id) {
    await Swal.fire("不正なID","数値を入力してください","error")
    return
  }
const { isConfirmed } = await Swal.fire({
  title: "本当に削除しますか？",
  text: `ID: ${id} のデータを削除します。`,
  showCancelButton: true,
  confirmButtonText: "削除する",
  cancelButtonText: "キャンセル",
  reverseButtons: true,
  focusCancel: true
})
if ( !isConfirmed ) return

  const result = await viewmodel.deleteTableData(id)

  if ( result.status === "ok" ) {
    hot.loadData([])
    await Swal.fire("削除しました", "","success")
  } else if (result.message === "not found") {
    await Swal.fire("見つかりません",`ID: ${id} のデータが見つかりません`, "warning")
  } else {
    await Swal.fire("エラー", result.message || "削除に失敗しました", "error")
  }
}

// Excelファイル出力
const exportExcelFile = async() => {
  const data = hot.getSourceData()

  const result = await viewmodel.exportExcelFile(data)
  if (result.status === "ng") {
    alert("失敗しました")
    return
  }

  // 文字列に整形
  const b64 = String(result.base64)
  //base64をデコードしてバイナリ配列に
  const bin = atob(b64)

  // バイナリからバイト配列にループ処理
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) {

    bytes[i] = bin.charCodeAt(i)

  }

  const mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  const blob = new Blob([bytes], {type: mime})

  saveAs(blob, "テーブルデータ.xlsx")

}


// Excelファイル読み込み
const importExcelFile = () => {
  const inputEl = elements.input.importFile
  if ( !inputEl ) return

  //同じファイルを選んでもchangeが発火するように空
  inputEl.value = ""

  inputEl.addEventListener("change", async(e) => {
    const file = e.currentTarget.files?.[0]
    if ( !file ) return

    try {

      // ファイルをArrayBufferrに
      const ab = await file.arrayBuffer()

      // ブック作成読み込み
      const wb = new ExcelJS.Workbook()
      await wb.xlsx.load(ab)

      //ワークシート取得
      const ws = wb.worksheets[0]
      if (!ws) return

      // 読み取り位置
      const startRow = 2
      const startCol = 2
      const toStr = (v) => {
        if(v == null) return ""
        if(typeof v === "object") {
          if (v.text != null) return String(v.text)
          if (v.result != null) return String(v.result)
          if (Array.isArray(v.richText)) return v.richText.map(t => t.text).join("")
        }
        // if (v instanceof Date) return v.toISOString()
        return String(v)
      }
      const readCell = (r, c) => {
        const cell = ws.getCell(r, c)
        const t = cell.text
        if (t !== "" && t != null) return t
        return toStr(cell.value)
      }

      // セルデータ取得
      const data = []
      const lastRow = ws.lastRow ? ws.lastRow.number: ws.rowCount || 0
      let seen = false

      for (let r = startRow + 1; r <= lastRow; r++) {
        const a = readCell(r, startCol + 0)
        const b = readCell(r, startCol + 1)
        const c = readCell(r, startCol + 2)
        const empty = (a === "" && b === "" && c === "")
        if (!seen && empty) continue
        if (seen && empty) break
        seen = true
        data.push({ itemA: a, itemB: b, itemC: c })
      }
      hot.loadData(data)
    } catch (err) {
      console.error(err)
      alert("Excelファイルの読み込みに失敗しました")
    }
  },{once: true})

  inputEl.click()
}
  
initialize()

