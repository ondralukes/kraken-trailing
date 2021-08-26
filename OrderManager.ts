import {API} from "./API";
import {Save} from "./Save";
import {Order} from "./Order";

export class OrderManager{
    api: API;
    save: Save;
    orders: Order[];
    updateTimeout: NodeJS.Timeout | null = null;
    running: boolean = false;
    constructor(save: Save, api: API) {
        this.save = save;
        this.api = api;
        this.orders = this.save.loadOrders();
        this.start();
    }
    start(){
        this.running = true;
        if(this.updateTimeout != null) return;
        this.updateTimeout = setTimeout(() => this.update(), 30000);
    }
    stop(){
        this.running = false;
        if(this.updateTimeout == null) return;
        clearTimeout(this.updateTimeout);
        this.updateTimeout = null;
    }

    place(asset: string, volume: number, relative: number){
        const wasRunning = this.running;
        if(wasRunning) this.stop();
        const o = new Order(asset, volume, relative);
        this.orders.push(o);
        this.save.saveOrders(this.orders);
        if(wasRunning) this.start();
    }

    cancel(index: number){
        const wasRunning = this.running;
        if(wasRunning) this.stop();
        this.orders[index].cancel = true;
        this.save.saveOrders(this.orders);
        if(wasRunning) this.start();
    }

    async update(){
        const openOrders = await this.api.getOpenOrders();
        this.orders = this.orders.filter(o => {
            if(o.txid === null) return true;
            if(openOrders.indexOf(o.txid) === -1){
                if(o.txid !== 'cancelled') console.log(`Order #${o.txid}(${o.asset}) lost or executed.`);
                return false;
            }
            return true;
        })
        for(const order of this.orders){
            await order.update(this.api)
        }
        this.save.saveOrders(this.orders);
        if(this.running){
            this.updateTimeout = setTimeout(() => this.update(), 30000);
        }
    }
}
