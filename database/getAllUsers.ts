import database from '.';
import { IUser } from '../models/User';

export default function getAllUsers(): IUser[] {
  return database.get('users').value();
}
