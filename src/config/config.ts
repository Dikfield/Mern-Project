import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../Config.env') });

class Config {
  DATABASE: string | undefined;
  DATABASE_PASSWORD: string | undefined;
  JWT_SECRET: string | undefined;
  PORT: string | undefined;
  GITHUB_TOKEN: string | undefined;

  constructor() {
    this.DATABASE = process.env.DATABASE || '';
    this.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || '';
    this.JWT_SECRET = process.env.JWT_SECRET || '';
    this.PORT = process.env.PORT || '';
    this.GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

  }

  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuration ${key} undefined`);
      }
    }
  }
}

export const config: Config = new Config();
