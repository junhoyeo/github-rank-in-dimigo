import database from ".";
import { IUser } from "../models/User";
import getUserByID from "./getUserByID";

export default function updateUser(user: IUser): void {
  const { id: userID } = user;

  const previousUserData = getUserByID(userID);

  if (previousUserData) {
    const changes = user.stars - previousUserData.stars;
    database
      .get("users")
      .find({ id: userID })
      .assign({ ...user, changes })
      .write();
    return;
  }

  database.get("users").push(user).write();
}
