/**
 * AWS Secrets Manager Integration
 * Manages secure retrieval of secrets from AWS Secrets Manager
 */

import {
  GetSecretValueCommand,
  PutSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { getSecretsManagerClient } from "./config";

interface SecretCache {
  value: any;
  expiresAt: number;
}

// In-memory cache for secrets (with TTL)
const secretCache = new Map<string, SecretCache>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface PixraySecrets {
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STEAM_API_KEY?: string;
  WINDOWS_AMI_ID?: string;
  WINDOWS_AMI_ID_2025?: string;
  HOST_AGENT_SECRET?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

/**
 * Retrieves a secret from AWS Secrets Manager with caching
 */
export async function getSecret(
  secretName: string,
  useCache: boolean = true
): Promise<string | null> {
  const client = getSecretsManagerClient();

  // Check cache first
  if (useCache) {
    const cached = secretCache.get(secretName);
    if (cached && cached.expiresAt > Date.now()) {
      console.log(`[Secrets] Cache hit for ${secretName}`);
      return cached.value;
    }
  }

  try {
    console.log(`[Secrets] Fetching ${secretName} from Secrets Manager`);
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await client.send(command);

    const secretValue = response.SecretString || null;

    // Cache the secret
    if (useCache && secretValue) {
      secretCache.set(secretName, {
        value: secretValue,
        expiresAt: Date.now() + DEFAULT_CACHE_TTL,
      });
    }

    return secretValue;
  } catch (error: any) {
    console.error(`[Secrets] Error fetching secret ${secretName}:`, error.message);
    return null;
  }
}

/**
 * Retrieves a JSON secret from AWS Secrets Manager and parses it
 */
export async function getJSONSecret<T = any>(
  secretName: string,
  useCache: boolean = true
): Promise<T | null> {
  const secretValue = await getSecret(secretName, useCache);
  if (!secretValue) {
    return null;
  }

  try {
    return JSON.parse(secretValue) as T;
  } catch (error: any) {
    console.error(`[Secrets] Error parsing JSON secret ${secretName}:`, error.message);
    return null;
  }
}

/**
 * Stores a secret in AWS Secrets Manager
 */
export async function putSecret(
  secretName: string,
  secretValue: string
): Promise<boolean> {
  const client = getSecretsManagerClient();

  try {
    const command = new PutSecretValueCommand({
      SecretId: secretName,
      SecretString: secretValue,
    });
    await client.send(command);

    // Invalidate cache
    secretCache.delete(secretName);

    console.log(`[Secrets] Successfully stored secret ${secretName}`);
    return true;
  } catch (error: any) {
    console.error(`[Secrets] Error storing secret ${secretName}:`, error.message);
    return false;
  }
}

/**
 * Retrieves all Pixray secrets in a single call
 * Expects a JSON secret named "pixray/production" or "pixray/staging"
 */
export async function getPixraySecrets(
  environment: string = process.env.NODE_ENV || "production"
): Promise<PixraySecrets> {
  const secretName = `pixray/${environment}`;
  const secrets = await getJSONSecret<PixraySecrets>(secretName);

  if (!secrets) {
    console.warn(`[Secrets] Failed to load ${secretName}, falling back to environment variables`);
    return {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      STEAM_API_KEY: process.env.STEAM_API_KEY,
      WINDOWS_AMI_ID: process.env.WINDOWS_AMI_ID,
      WINDOWS_AMI_ID_2025: process.env.WINDOWS_AMI_ID_2025,
      HOST_AGENT_SECRET: process.env.HOST_AGENT_SECRET,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
  }

  return secrets;
}

/**
 * Clears the secret cache (useful for testing or forced refresh)
 */
export function clearSecretCache(): void {
  secretCache.clear();
  console.log("[Secrets] Cache cleared");
}
