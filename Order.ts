import {API} from "./API";

export class Order{
    asset: string;
    currentPrice: number | null = null;
    relative: number;
    txid: string | null = null;
    volume: number;
    cancel: boolean = false;
    constructor(asset: string, volume: number, relative: number) {
        this.asset = asset;
        this.relative = relative;
        this.volume = volume;
    }

    async update(api: API){
        if(this.cancel){
            if(this.txid !== null){
                console.log(`Order #${this.txid} cancelled`);
                await api.cancelOrder(this.txid);
            }
            this.txid = 'cancelled';
            return;
        }
        const p = await api.getPrice(this.asset);
        if(this.currentPrice !== null && this.txid !== null){
            const currentRelative = this.currentPrice/p-1;
            if(currentRelative < this.relative*1.1) {
                console.log(`Order #${this.txid} untouched: target ${(this.relative*100).toFixed(2)}%, now at ${(currentRelative*100).toFixed(2)}% ${this.currentPrice.toFixed(6)}EUR`);
            } else {
                try {
                    await api.cancelOrder(this.txid);
                } catch (e){
                    console.log(`Failed to cancel order #${this.txid}. Skipping update.`);
                    return;
                }
                console.log(`Order #${this.txid} cancelled: target ${(this.relative*100).toFixed(2)}%, now at ${(currentRelative*100).toFixed(2)}% ${this.currentPrice.toFixed(6)}EUR`);
                this.txid = null;
                this.currentPrice = null;
            }
        }
        if(this.currentPrice === null && this.txid === null){
            const orderPrice = p + p*this.relative;
            const avolume = this.volume/orderPrice;
            try {
                this.currentPrice = orderPrice;
                this.txid = await api.placeOrder(this.asset, avolume, orderPrice);
            } catch (e) {
                console.log('Failed to place order.');
                this.txid = null;
                this.currentPrice = null;
                return;
            }

            console.log(`Placed order #${this.txid}: buy ${avolume.toFixed(6)}${this.asset} as stop-loss ${orderPrice.toFixed(6)}, ${(this.relative*100).toFixed(2)}% above current market price`);
        }
    }
}
