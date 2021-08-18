import {API} from "./API";
import {Save} from "./Save";
import {OrderManager} from "./OrderManager";
import * as readline from 'readline';

const save = new Save();
const api = new API(save);
const mgr = new OrderManager(save, api);

const stdio = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
});

stdio.on('line', (line) => {
    const args = line.split(' ');
    if(args.length === 0){
        return;
    }
    switch (args[0]){
        case 'help':
            console.log('list - list managed orders.');
            console.log('place <asset> <EUR volume> <percentage above market price> - place an order');
            console.log('start/stop - Starts or stops order updating.');
            console.log('balance - Prints EUR balance.');
            console.log('cancel <index> - Cancels order.');
            break;
        case 'list':
            console.log(`Currently managing ${mgr.orders.length} orders.`);
            mgr.orders.forEach((o, idx) => {
                if(o.txid !== null && o.currentPrice !== null){
                    console.log(`${idx}: Buy ${o.asset} worth ${o.volume.toFixed(6)}EUR at stop-loss ${(o.relative*100).toFixed(2)}% above market price (now placed at ${o.currentPrice.toFixed(6)}EUR)`);
                } else {
                    console.log(`${idx}: Buy ${o.asset} worth ${o.volume.toFixed(6)}EUR at stop-loss ${(o.relative*100).toFixed(2)}% above market price (not yet placed)`);
                }
            })
            break;
        case 'place':
            if(args.length < 4){
                console.log('Too few arguments.');
                break;
            }
            const asset = args[1];
            const volume = parseFloat(args[2]);
            const relative = parseFloat(args[3])/100;
            mgr.place(asset, volume, relative);
            break;
        case 'cancel':
            if(args.length < 2){
                console.log('Too few arguments.');
                break;
            }
            const index = parseInt(args[1]);
            mgr.cancel(index);
            break;
        case 'start':
            mgr.start();
            break;
        case 'stop':
            mgr.stop();
            break;
        default:
            console.log('Unknown command. Type "help" for help.');
            break;
    }
});

