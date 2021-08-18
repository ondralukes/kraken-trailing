import {Save} from "./Save";
import * as qs from 'qs';
import * as crypto from 'crypto';
import * as https from 'https';

export class API{
    save: Save;
    readonly apiRoot: string = '/0';
    constructor(save: Save) {
        this.save = save;
    }
    async getBalance(): Promise<number>{
        return parseFloat((await this.request('/private/Balance', {}))['ZEUR']);
    }
    async getPrice(asset: string): Promise<number>{
        const pair = asset+'EUR';
        const r = await this.publicRequest('/public/Ticker?pair='+pair);
        return parseFloat(r[Object.keys(r)[0]].a[0]);
    }
    async placeOrder(asset: string, volume: number, price: number): Promise<string>{
        const pair = asset+'EUR';
        const info = await this.publicRequest('/public/AssetPairs?pair='+pair);
        const pairInfo = info[Object.keys(info)[0]];
        const volumeDecimals = parseInt(pairInfo.lot_decimals);
        const priceDecimals = parseInt(pairInfo.pair_decimals);
        const r = await this.request(
            '/private/AddOrder',
            {
                pair: pair,
                type: 'buy',
                ordertype: 'stop-loss',
                price: price.toFixed(priceDecimals),
                volume: volume.toFixed(volumeDecimals)
            }
        );
        return r.txid[0];
    }
    async cancelOrder(txid: string){
        await this.request(
            '/private/CancelOrder',
            {
                txid: txid
            }
        );
    }
    async getOpenOrders(){
        const r = await this.request(
            '/private/OpenOrders',
            {}
        );
        return Object.keys(r['open']);
    }
    request(path: string, data: object): Promise<any>{
        path = this.apiRoot + path;
        const nonce = Date.now();
        (data as any).nonce = nonce;
        const encoded = qs.stringify(data);
        const hash = crypto.createHash('sha256');
        const hmac = crypto.createHmac('sha512', this.save.secretApiKey);
        const hash_result = hash.update(nonce+encoded).digest();
        const signature = hmac.update(path).update(hash_result).digest('base64');
        const options = {
            hostname: 'api.kraken.com',
            path: path,
            method: 'POST',
            headers: {
                'API-Key': this.save.apiKey,
                'API-Sign': signature,
                'User-Agent': 'JS script',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': encoded.length
            },
        };
        return new Promise((resolve, reject) => {
            const req = https.request(options, res => {
                res.setEncoding('utf-8');
                let resp = '';
                res.on('data', chunk => {
                    resp += chunk;
                });
                res.on('error', e => {
                    reject(e);
                });
                res.on('end', () => {
                    const r = JSON.parse(resp);
                    for(const e of r.error){
                        if(e.charAt(0) === 'E'){
                            console.error('API error', e);
                            reject(e);
                        } else if(e.charAt(0) === 'W'){
                            console.warn('API Warning', e);
                        }
                    }
                    resolve(r.result);
                });
            });
            req.write(encoded);
            req.end();
        });
    }
    publicRequest(path: string): Promise<any>{
        path = this.apiRoot+path;
        const options = {
            hostname: 'api.kraken.com',
            path: path,
            method: 'GET',
            headers: {
                'User-Agent': 'JS script',
            },
        };
        return new Promise((resolve, reject) => {
            const req = https.request(options, res => {
                res.setEncoding('utf-8');
                let resp = '';
                res.on('data', chunk => {
                    resp += chunk;
                });
                res.on('error', e => {
                    reject(e);
                });
                res.on('end', () => {
                    const r = JSON.parse(resp);
                    for(const e of r.error){
                        if(e.charAt(0) === 'E'){
                            console.error('API error', e);
                            reject(e);
                        } else if(e.charAt(0) === 'W'){
                            console.warn('API Warning', e);
                        }
                    }
                    resolve(r.result);
                });
            });
            req.end();
        });
    }
}
