export class BackendInterface {
    constructor() {
    }

    // note
    async getNote(noteId) {}

    // annotation
    async createAnnotation(noteId, formData) {}
    async getAnnotations(noteId) {}
    async deleteAnnotation(annotationId) {}

    // comment
    async updateComment(formData) {}
}
