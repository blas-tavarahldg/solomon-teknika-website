// Copyright (c) 2026 TAVARA Holdings / Solomon Teknika. All rights reserved.
// Proprietary and confidential.

import { Platform } from 'react-native';

type StorageType = 'secure' | 'memory';
const memoryStorage = new Map<string, string>();

interface SessionMetadata {
  token: string;
  lastActivity: number;
  createdAt: number;
}

const LAST_ACTIVITY_KEY = '__LAST_ACTIVITY__';
const SESSION_VALIDITY_WINDOW = 24 * 60 * 60 * 1000;
let SecureStoreModule: any = null;

try {
  SecureStoreModule = require('expo-secure-store');
} catch (e) {
  SecureStoreModule = null;
}

class SecureStorage {
  private storageType: StorageType;

  constructor() {
    this.storageType = this.initializeStorage();
  }

  private initializeStorage(): StorageType {
    if (SecureStoreModule && Platform.OS !== 'web') {
      return 'secure';
    }
    return 'memory';
  }

  async saveToken(key: string, value: string): Promise<void> {
    try {
      const metadata: SessionMetadata = { token: value, lastActivity: Date.now(), createdAt: Date.now() };
      const serialized = JSON.stringify(metadata);
      if (this.storageType === 'secure' && SecureStoreModule) {
        await SecureStoreModule.setItemAsync(key, serialized);
      } else {
        memoryStorage.set(key, serialized);
      }
      await this.updateLastActivity();
    } catch (error) {
      console.error(`Failed to save token for key: ${key}`, error);
      throw new Error(`Secure storage save failed: ${error}`);
    }
  }

  async getToken(key: string): Promise<string | null> {
    try {
      let serialized: string | null = null;
      if (this.storageType === 'secure' && SecureStoreModule) {
        serialized = await SecureStoreModule.getItemAsync(key);
      } else {
        serialized = memoryStorage.get(key) ?? null;
      }
      if (!serialized) return null;
      const metadata: SessionMetadata = JSON.parse(serialized);
      await this.updateLastActivity();
      return metadata.token;
    } catch (error) {
      console.error(`Failed to retrieve token for key: ${key}`, error);
      return null;
    }
  }

  async deleteToken(key: string): Promise<void> {
    try {
      if (this.storageType === 'secure' && SecureStoreModule) {
        await SecureStoreModule.deleteItemAsync(key);
      } else {
        memoryStorage.delete(key);
      }
    } catch (error) {
      console.error(`Failed to delete token for key: ${key}`, error);
      throw new Error(`Secure storage delete failed: ${error}`);
    }
  }

  async clearAllTokens(): Promise<void> {
    try {
      if (this.storageType === 'secure' && SecureStoreModule) {
        const keys = Array.from(memoryStorage.keys());
        for (const key of keys) {
          await SecureStoreModule.deleteItemAsync(key);
        }
      } else {
        memoryStorage.clear();
      }
    } catch (error) {
      console.error('Failed to clear all tokens', error);
      throw new Error(`Secure storage clear failed: ${error}`);
    }
  }

  async rotateToken(
    supabaseUrl: string,
    supabaseKey: string,
    refreshToken: string
  ): Promise<string | null> {
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) throw new Error(`Token refresh failed: ${response.status}`);
      const data = await response.json();
      const newAccessToken = data.access_token;
      const newRefreshToken = data.refresh_token;
      await this.saveToken('access_token', newAccessToken);
      if (newRefreshToken) await this.saveToken('refresh_token', newRefreshToken);
      await this.updateLastActivity();
      return newAccessToken;
    } catch (error) {
      console.error('Token rotation failed', error);
      throw new Error(`Token rotation failed: ${error}`);
    }
  }

  async isSessionValid(): Promise<boolean> {
    try {
      let lastActivitySerialized: string | null = null;
      if (this.storageType === 'secure' && SecureStoreModule) {
        lastActivitySerialized = await SecureStoreModule.getItemAsync(LAST_ACTIVITY_KEY);
      } else {
        lastActivitySerialized = memoryStorage.get(LAST_ACTIVITY_KEY) ?? null;
      }
      if (!lastActivitySerialized) return false;
      const lastActivity = parseInt(lastActivitySerialized, 10);
      return (Date.now() - lastActivity) <= SESSION_VALIDITY_WINDOW;
    } catch (error) {
      console.error('Session validation check failed', error);
      return false;
    }
  }

  async getSessionRemainingTime(): Promise<number> {
    try {
      let lastActivitySerialized: string | null = null;
      if (this.storageType === 'secure' && SecureStoreModule) {
        lastActivitySerialized = await SecureStoreModule.getItemAsync(LAST_ACTIVITY_KEY);
      } else {
        lastActivitySerialized = memoryStorage.get(LAST_ACTIVITY_KEY) ?? null;
      }
      if (!lastActivitySerialized) return 0;
      const lastActivity = parseInt(lastActivitySerialized, 10);
      return Math.max(0, SESSION_VALIDITY_WINDOW - (Date.now() - lastActivity));
    } catch (error) {
      console.error('Failed to get session remaining time', error);
      return 0;
    }
  }

  private async updateLastActivity(): Promise<void> {
    try {
      const timestamp = Date.now().toString();
      if (this.storageType === 'secure' && SecureStoreModule) {
        await SecureStoreModule.setItemAsync(LAST_ACTIVITY_KEY, timestamp);
      } else {
        memoryStorage.set(LAST_ACTIVITY_KEY, timestamp);
      }
    } catch (error) {
      console.error('Failed to update last activity', error);
    }
  }

  getStorageType(): StorageType {
    return this.storageType;
  }
}

export const secureStorage = new SecureStorage();
export type { SessionMetadata, StorageType };
