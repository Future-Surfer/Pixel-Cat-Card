import {browserServer} from './server.mjs';
export default async function setup(){
 const port=Number(process.env.PIXEL_CAT_BROWSER_PORT||8774);
 if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid browser-test port');
 const server=browserServer(port);
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
 return async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));};
}
