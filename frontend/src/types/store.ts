import {Market} from './markets'
import {IChart} from './charts'


export interface Store {
  helpVisible: boolean
  markets: Market[]
  charts: IChart[]
}
