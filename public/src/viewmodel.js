import * as model from "./model.js"


export const getTableDataInfo = async(data) => {
    const post = {
        id: data
    }
    const json = await model.getTableDataInfo(post)
    return json
}

export const upsertTableData = async(id,data) => {
    const post = {
        id: id,
        data: data
    }
    const json = await model.upsertTableData(post)
    return json
}

export const deleteTableData = async(data) => {
    const post = {
        id: data
    }
    const json = await model.deleteTableData(post)
    return json
}

export const exportExcelFile = async(data) => {
    const post = {
        data: data
    }
    const json = await model.exportExcelFile(post)
    return json
}