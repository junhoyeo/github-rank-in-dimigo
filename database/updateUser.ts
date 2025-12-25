import database from ".";
import { IUser } from "../models/User";
import getUserByID from "./getUserByID";
import getCurrentTimestamp from "../utils/getCurrentTimestamp";

export default function updateUser(user: IUser): void {
  const { id: userID } = user;

  const previousUserData = getUserByID(userID);

  const isMissingUpdate =
    user.status === 'suspected_missing' || user.status === 'confirmed_missing';

  const updatedUser: IUser = isMissingUpdate
    ? user
    : {
        ...user,
        status: 'active',
        consecutiveFailures: 0,
        lastSuccessfulUpdateAt: getCurrentTimestamp(),
      };

  if (previousUserData) {
    const changes = updatedUser.stars - previousUserData.stars;
    database
      .get("users")
      .find({ id: userID })
      .assign({ ...updatedUser, changes })
      .write();
    return;
  }

  database.get("users").push(updatedUser).write();
}
