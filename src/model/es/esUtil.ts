import { FileManager, FileModel } from "@/common/filesManager";
import { ConnectionManager } from "@/service/connectionManager";
import { QueryUnit } from "@/service/queryUnit";
import * as vscode from 'vscode';
import { ElasticMatch } from "./provider/ElasticMatch";

export class EsUtil {

    public static async executeEsQueryFile(em: ElasticMatch, parse: boolean) {
        const node = ConnectionManager.tryGetConnection();
        if (node == null) {
            vscode.window.showErrorMessage("No active es server found!")
            return;
        }
        if (parse) {
            QueryUnit.runQuery(`${em.Method.Text} ${em.Path.Text}\n${em.Body.Text}`, node, { split: true })
            return;
        }
        (await node.getConnection()).query(`${em.Method.Text} ${em.Path.Text}\n${em.Body.Text}`, 'dontParse', async (err, data) => {
            const response = err?.message || JSON.stringify(data, null, 2);
            vscode.window.showTextDocument(
                await vscode.workspace.openTextDocument(await FileManager.record(`${node.getUid()}#result.json`, response, FileModel.WRITE)),
                vscode.ViewColumn.Two, true
            )
        })
    }

}