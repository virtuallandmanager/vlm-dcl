import { FlatFetchInit, signedFetch } from '~system/SignedFetch'
import { VLMSessionManager } from './VLMSession.logic'
import { VLMDebug } from './VLMDebug.logic'

export abstract class VLMLogManager {
  public static debug: boolean = false

  static logError: CallableFunction = async (error: any, metadata: any) => {
    try {
      const platformData = await VLMSessionManager.getPlatformData()
      const payload: FlatFetchInit = {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ error, metadata: { ...platformData, ...metadata, ts: Date.now() / 1000 } }),
      }

      const config = await signedFetch({ url: 'https://api.vlm.gg/log/error', init: payload })
      if (config.ok) {
        return config.body
      }
    } catch (error) {
      this.reportOutage()
    }
  }

  static reportOutage: CallableFunction = async () => {
    try {
      const platformData = await VLMSessionManager.getPlatformData()
      const payload: FlatFetchInit = {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ error: 'Connection to the server could not be established.', metadata: { ...platformData, ts: Date.now() / 1000 } }),
      }
      VLMDebug.log('Connection error. Attempting to report to server.')
      await signedFetch({ url: 'https://alerts.vlm.gg/report/outage', init: payload })
      VLMDebug.log('Message successfully sent to inform VLM of outage.')
    } catch (error) {
      VLMDebug.log("Could not connect to VLM's alert service either. Internet outage likely.")
    }
  }
}
