import global from "../global";
import {cloneDeep} from "./utils";
import {generateID} from "./random";

export const getBackend = () => {
    return global.value.backend;
}

/**
 * Use note
 *
 * @returns {{note: *}}
 */
export const useNote = () => {
    return {
        note: global.value.note,
    }
};

/**
 * Use create annotation
 *
 * @returns {{createAnnotation: (function(*=): any)}}
 */
export const useCreateAnnotation = () => {
    const createAnnotation = (annotation) => {
        const { note } = useNote();

        const newAnnotation = Object.assign({id: generateID()}, annotation);

        // TODO: refactor
        note.annotations.push(newAnnotation)

        return cloneDeep(newAnnotation);
    };

    return {
        createAnnotation,
    }
};


/**
 * Use get annotations
 *
 * @returns {{getAnnotations: (function(*=): any)}}
 */
export const useGetAnnotations = () => {
    const getAnnotations = () => {
        const { note } = useNote();
        return cloneDeep(note.annotations);
    };

    return {
        getAnnotations,
    }
};


/**
 * Use delete annotation
 *
 * @returns {{deleteAnnotation: (function(*): any)}}
 */
export const useDeleteAnnotation = () => {
    const deleteAnnotation = (annotationId) => {
        const { note } = useNote();
        const idx = (note.annotations || []).findIndex((a) => a.id === annotationId);
        if (idx < 0) {
            return;
        }
        return cloneDeep(note.annotations.splice(idx, 1)[0]);
    };

    return {
        deleteAnnotation,
    }
}


/**
 * Use comment
 */
export const useComment = () => {
    const updateComment = (comment) => {
        const { note } = useNote();

        const newComment = Object.assign({id: generateID()}, comment);

        if (!comment.parent_id) {
            note.comment = comment;
        } else {
            const replies = (note.comment && note.comment.replies) || [];
            replies.push(note.comment.replies.push(comment));
        }

        return cloneDeep(comment);
    }

    return {
        updateComment,
    }
}