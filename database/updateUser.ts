import database from '.';
import { IUser } from '../models/User';
import getUserByID from './getUserByID';

export default function updateUser(user: IUser): void {
  const { id: userID } = user;

  if (getUserByID(userID)) {
    database.get('users')
      .find({ id: userID })
      .assign(user)
      .write()
    return;
  }

  database.get('users')
    .push(user)
    .write();
}
