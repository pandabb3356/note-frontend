import { getBackend } from "../shared/global";


export const createAnnotation = async (noteId, formData) => {
    const { data } = await getBackend().createAnnotation(noteId, formData);
    return data;
};


export const deleteAnnotation = async (annotationId) => {
    return await getBackend().deleteAnnotation(annotationId);
};


export const updateComment = async (formData) => {
    const { data } = await getBackend().updateComment(formData);
    return data;
}

