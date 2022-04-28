import { BlinkerDevice } from './lib/blinker';
import { ButtonWidget, NumberWidget } from './lib/widget';
import { getBattery, getCpuTemp, getCpuUsage, getLoadAvg, getMemUsage, isCharging, setCharging } from './utils';

let state: {temp: number} = {
    temp: 0
}
let device = new BlinkerDevice('fd68a3c4fdb8',{
    webSocket:false
});


// 注册组件
let chargeBtn: ButtonWidget = device.addWidget(new ButtonWidget('btn-charge'));
let cpuTemp: NumberWidget = device.addWidget(new NumberWidget('temp'));
device.addWidget(new NumberWidget('cpu'));
device.addWidget(new NumberWidget('mem'));


device.ready().then(() => {  
    device.heartbeat.subscribe(message => {
        console.log('heartbeat:', message);
        cpuTemp.value(state.temp).update();
        const batt = getBattery()
        const icon = getBatteryIcon(batt);
        if(isCharging()){
            chargeBtn.color('#36a84d').icon('far fa-battery-bolt').text(`充电中: ${batt}%`).update();
        }else{
            chargeBtn.icon(icon).text(`未充电: ${batt}%`).update();
        }
        device.builtinSwitch.setState('on').update();
    })

    chargeBtn.listen().subscribe(message => {
        console.log('charge:', message);
        const batt = getBattery()
        const icon = getBatteryIcon(batt)
        if(message.data === "on"){
            setCharging(true)
            chargeBtn.turn('on').color('#36a84d').icon('far fa-battery-bolt').text(`充电中: ${batt}`).update();
        }else{
            setCharging(false)
            chargeBtn.turn('off').icon(icon).text(`未充电: ${batt}`).update();
        }
    })

    setInterval(async () => {
        state.temp = getCpuTemp()
        const loadavg = getLoadAvg()
        device.saveTsData({
            one: loadavg[0],
            five:loadavg[1],
            ten: loadavg[2]
        });
    }, 10000)
})

device.realtimeRequest.subscribe(keys => {
    keys.forEach(key => {
        switch (key) {
            case 'mem':
                device.sendRtData('mem', ()=> getMemUsage() * 100)
                break;
            case 'cpu':
                device.sendRtData('cpu', async () => await getCpuUsage() * 100)
                break;
            default:
                break;
        }
    });
})


const getBatteryIcon = (batt:number)=>{
    if(batt > 90){
        return "far fa-battery-full"
    }else if(batt > 70){
        return "far fa-battery-three-quarters"
    }else if(batt > 50){
        return "far fa-battery-half"
    }else{
        return "far fa-battery-quarter"
    }
}
