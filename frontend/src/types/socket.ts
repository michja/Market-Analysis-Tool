import {Market} from './markets'
import {Tick} from './charts'

export interface SocketMessage {
  type: string
  data: any
}

export interface ResponseMarkets extends SocketMessage {
  data: Market[]
}

export interface ResponseTicks extends SocketMessage {
  data: {
    market: Market,
    ticks: Tick[]
  }
}
