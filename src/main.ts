#! /usr/bin/env-nodetsc
import * as querystring from "querystring";
import * as https from "https";
import md5 = require("md5");
import {appId, appSecret} from "./private";

const errorMap = {
    52003:"用户认证失败",
    52004:"error2",
    52005:"error3",
    unknown:"未知错误"
}
export const translate = (word = "") => {
    console.log(word);
    let from,to
    if(/[a-zA-Z]/.test(word[0])){
        from = "en";
        to = "zh";
    }else{
        from = "zh";
        to = "en";
    }
    const salt = Math.random()
    const sign = md5(appId + word + salt + appSecret)
    const query: string = querystring.stringify({
        q: word,
        from: from, to: to,
        appid: appId,
        salt: salt,
        sign: sign
    })
    const options = {
        hostname: 'api.fanyi.baidu.com',
        port: 443,
        path: '/api/trans/vip/translate?' + query,
        method: 'GET'
    };

    const request = https.request(options, (response: any) => {
        let chunks: Uint8Array[] = []
        response.on('data', (chunk: any) => {
            chunks.push(chunk)
        });
        response.on("end", () => {
            const string = Buffer.concat(chunks).toString()
            type BaiduResult = {
                from: string,
                to: string,
                error_msg?: string,
                error_code?: string,
                trans_result: {
                    src: string,
                    dst: string
                }[]
            }
            const object: BaiduResult = JSON.parse(string)
            if (object.error_code) {
                console.log(errorMap[object.error_code  as keyof typeof errorMap]||object.error_msg)
                process.exit(2)
            } else {
                console.log(object.trans_result[0].dst);
                process.exit(0)
            }

        })
    });

    request.on('error', (e: any) => {
        console.error(e);
    });
    request.end();
}