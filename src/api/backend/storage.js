import {BackendInterface} from "./base";
import {useComment, useCreateAnnotation, useDeleteAnnotation, useGetAnnotations, useNote} from "../../shared/global";
import {cloneDeep} from "../../shared/utils";

export class LocalStorage extends BackendInterface {
    async getNote(noteId) {
        const { note } = useNote();
        return { data: cloneDeep(note) };
    }

    async createAnnotation(noteId, formData) {
        const { createAnnotation } = useCreateAnnotation();
        return {data: createAnnotation(formData)}
    }

    async getAnnotations(noteId) {
        const { getAnnotations } = useGetAnnotations();
        return getAnnotations();
    }

    async deleteAnnotation(annotationId) {
        const { deleteAnnotation } = useDeleteAnnotation();
        return deleteAnnotation(annotationId);
    }

    async updateComment(formData) {
        const { updateComment } = useComment();
        return {data: updateComment(formData)};
    }
}