import {userMap} from "./config";

export const getUser = (userId) => {
    return userMap[userId];
}