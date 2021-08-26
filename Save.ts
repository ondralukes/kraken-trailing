import * as fs from 'fs';
import {Order} from "./Order";
import path from "path";

export class Save{
    apiKey: string;
    secretApiKey: Buffer;
    ordersFilename: string;
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
        if(!process.env.DATA_PATH){
            this.ordersFilename = 'orders';
        } else {
            this.ordersFilename = path.join(process.env.DATA_PATH, 'orders');
        }
        console.log(`Storing orders in ${this.ordersFilename}`);
    }

    loadOrders(): Order[]{
        if(!fs.existsSync(this.ordersFilename)){
            return [];
        }
        const loaded = JSON.parse(fs.readFileSync(this.ordersFilename).toString());
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
        fs.writeFileSync(this.ordersFilename, JSON.stringify(orders));
    }
}
