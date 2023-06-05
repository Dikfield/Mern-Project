import { config } from './config';
import mongoose from 'mongoose';

const db = config.DATABASE!.replace('<password>', config.DATABASE_PASSWORD!);

export const connectDB = async () => {
  try {
    await mongoose.connect(db);

    console.log('MongoDB Connected...');
  } catch (err) {
    console.log(err);

    return process.exit(1);
  }
};
