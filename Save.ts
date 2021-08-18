import * as fs from 'fs';
import {Order} from "./Order";

export class Save{
    apiKey: string;
    secretApiKey: Buffer;
    constructor() {
        if(!process.env.KRAKEN_API_KEY){
            console.log('API key not found. Please provide your API key in KRAKEN_API_KEY env.');
            process.exit(1);
        }
        this.apiKey = process.env.KRAKEN_API_KEY;
        if(!process.env.KRAKEN_API_SECRET_KEY){
            console.log('API secret key not found. Please provide your API key in KRAKEN_API_SECRET_KEY env.');
            process.exit(1);
        }
        this.secretApiKey = Buffer.from(process.env.KRAKEN_API_SECRET_KEY, 'base64');
    }

    loadOrders(): Order[]{
        if(!fs.existsSync('orders')){
            return [];
        }
        const loaded = JSON.parse(fs.readFileSync('orders').toString());
        const orders: Order[] = [];
        for(const lo of loaded){
            const o = new Order(lo.asset, lo.volume, lo.relative);
            o.txid = lo.txid;
            o.currentPrice = lo.currentPrice;
            o.cancel = lo.cancel;
            orders.push(o);
        }
        return orders;
    }

    saveOrders(orders: Order[]){
        fs.writeFileSync('orders', JSON.stringify(orders));
    }
}
