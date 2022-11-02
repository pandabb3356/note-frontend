import axios from "axios";
import {BackendInterface} from "./base";


export class LocalHost extends BackendInterface {
    async getNote(noteId) {
        return await axios.get(`/api/notes/${noteId}`);
    }

    async createAnnotation(noteId, formData) {
        return await axios.post(`/api/notes/annotation`, formData);
    }

    async getAnnotations(noteId) {
        return await axios.get(`/api/notes/${noteId}/annotations`);
    }

    async deleteAnnotation(annotationId) {
        return await axios.delete(`/api/annotations/${annotationId}`);
    }

    async updateComment(formData) {
        return await axios.put(`/api/annotations/comment`, formData);
    }
}
