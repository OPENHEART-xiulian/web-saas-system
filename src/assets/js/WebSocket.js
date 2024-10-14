import SocketIo from 'socket.io-client';
import { DOMAIN_NAME } from '@/https/api';
import { storage } from '@/assets/js/utils';
export class WebSocket {
  socket;
  url;
  constructor (url, params) {
    this.url = url || DOMAIN_NAME;
    this.url += this.getQueryStr(params);
    this.socket = new SocketIo(this.url, {
      path: '/wstore/api/socket'
    });

    // this.socket.on('connect', data => {
    //   // 触发服务器获取通知消息
    //   console.log(data);
    // });
  
    // this.socket.on('PayNotify', data => {
    //   // 接收服务器传回的消息
    //   console.log(data);
    //   success(data);
    // });

    // this.socket.on('PayNotify', data => {
    //   // 触发更新
    //   console.log(data);
    // })
  }

  getQueryStr (params) {
    params = params || {
      authorization: storage.get('TOKEN')
    }
    let strArr = [];
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const element = params[key];
        strArr.push(key + '=' + element);
      }
    }
    return '?' + strArr.join('&');
  }
}
