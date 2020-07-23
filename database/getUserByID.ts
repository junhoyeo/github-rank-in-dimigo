import database from '.';
import { IUser } from '../models/User';

export default function getUserByID(userID: string): IUser {
  const user = database
    .get('users')
    .find({ id: userID })
    .value();
  return user as IUser || null;
}
