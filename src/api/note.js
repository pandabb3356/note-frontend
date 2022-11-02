import {getBackend} from "../shared/global";

export const getNote = async (noteId) => {
    const { data } = await getBackend().getNote(noteId);
    return data;
}