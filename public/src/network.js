const WEB_API_GET_TABLEDATAINFO = "/api/table/getTableDataInfo"
const WEB_API_UPSERT_TABLEDATA = "/api/table/upsertTableData"
const WEB_API_DELETE_TABLEDATA = "/api/table/deleteTableData"
const WEB_API_EXPORT_EXCELFILE = "/api/table/exportExcelFile"

export const getTableDataInfo = async(post) => {
    try {
        const res= await fetch(WEB_API_GET_TABLEDATAINFO, {
            method: "POST",
            body: JSON.stringify(post),
            headers: {"content-type":"application/json"},
        })
        const json = await res.json()
        return json
    } catch (err) {
        console.error(err)
    }
}


export const upsertTableData = async(post) => {
    try {
        const res = await fetch(WEB_API_UPSERT_TABLEDATA, {
            method:"POST",
            body: JSON.stringify(post),
            headers: {"content-type":"application/json"}
        })
        const json = await res.json()
        return json
    } catch (err) {
        console.error(err)
    }
}


export const deleteTableData = async(post) => {
    try {
        const res = await fetch(WEB_API_DELETE_TABLEDATA, {
            method:"POST",
            body: JSON.stringify(post),
            headers: {"content-type":"application/json"}
        })
        const json = await res.json()
        return json
    } catch (err) {
        console.error(err)
    }
}

export const exportExcelFile = async(post) => {
    try {
        const res = await fetch(WEB_API_EXPORT_EXCELFILE, {
            method: "POST",
            body: JSON.stringify(post),
            headers: {"content-type":"application/json"}
        })
        const json = await res.json()
        return json
    } catch (err) {
        console.error(err)
    }
}