import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WsResponse } from '@nestjs/websockets';
import { Client, Socket } from 'socket.io';
import { EventsService } from './services/events/events.service';
import Jwt from "./services/jwt-passport"
@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private event: EventsService
  ) { }
  handleDisconnect(client: any) {
    this.event.event().subscribe().unsubscribe();
  }
  handleConnection(client: Socket, ...args: any[]) {

  }
  afterInit(server: any) {
    const logger = new Logger("Socket");
    logger.log("Socket service is running")
  }

  @SubscribeMessage('dataPop')
  handleEvent(client: Socket, data: any) {
    this.event.event().subscribe(dataEvent => {
      // if (data.tokenPop === dataEvent.key && Jwt.decode(data.authorization)) {
      //   client.emit(dataEvent.key, dataEvent.value)
      // }
      if (data.tokenPop === dataEvent.key) {
        client.emit(dataEvent.key, dataEvent.value)
      }
    })
    // return data;
  }
}
