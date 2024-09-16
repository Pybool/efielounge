import { Injectable } from '@angular/core';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

@Injectable({
  providedIn: 'root',
})
export class DeviceIdService {
  private readonly localStorageKey = 'efl-deviceId';
  private fpPromise = FingerprintJS.load();

  constructor() {}

  async getDeviceId(): Promise<string> {
    const storedDeviceId = localStorage.getItem(this.localStorageKey);

    if (storedDeviceId) {
      return storedDeviceId;
    }

    const fp = await this.fpPromise;
    const result = await fp.get();
    const deviceId = result.visitorId;

    localStorage.setItem(this.localStorageKey, deviceId);

    return deviceId;
  }
}
