import { Provider } from '../../../uploads/types'

export default class DummyProvider implements Provider {
  upload = async (): Promise<string> => ''
  exists = async (): Promise<boolean> => false
}
