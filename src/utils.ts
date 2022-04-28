import os from 'os'
import fs from 'fs'

const getCPUInfo = () => {
  const cpus = os.cpus();

  let user = 0, nice = 0, sys = 0, idle = 0, irq = 0, total = 0;

  for (let { times } of cpus) {
    user += times.user;
    nice += times.nice;
    sys += times.sys;
    irq += times.irq;
    idle += times.idle;
  }

  total = user + nice + sys + idle + irq;

  return {
    'idle': idle,
    'total': total
  };
}

export const getCpuUsage = (free = false) => {
  const stats1 = getCPUInfo();
  const startIdle = stats1.idle;
  const startTotal = stats1.total;

  return new Promise<number>((resolve, reject) => {
    setTimeout(() => {
      const stats2 = getCPUInfo();
      const endIdle = stats2.idle;
      const endTotal = stats2.total;

      const idle = endIdle - startIdle;
      const total = endTotal - startTotal;
      const perc = idle / total;
      return free === true ? resolve(perc) : resolve(1 - perc);
    }, 1000);
  })
}

export const getMemUsage = () => os.freemem() / os.totalmem();


/**
 * @returns cpu temperature
 */
export const getCpuTemp = () => {
  try {
    let temp = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8');
    return +(+temp / 1000).toFixed(1)
  } catch (error) {
    console.log(error)
    return 0
  }
}

export const getBattery = () => {
  try {
    let batt = fs.readFileSync('/sys/class/power_supply/battery/capacity', 'utf8');
    return +batt
  } catch (error) {
    console.log(error)
    return 0
  }
}

export const isCharging = () => {
  try {
    let status = fs.readFileSync('/sys/class/power_supply/battery/status', 'utf8');
    return status === "Charging"
  } catch (error) {
    console.log(error)
    return false
  }
}

export const setCharging = (enable = false) => {
  fs.writeFileSync('/sys/class/power_supply/battery/charging_enabled', enable ? "1" : "0");
}

export const getLoadAvg = () =>{
  try {
    let load = fs.readFileSync('/proc/loadavg', 'utf8');
    return load.split(' ').splice(0,3) 
  } catch (error) {
    console.log(error)
    return []
  }
}