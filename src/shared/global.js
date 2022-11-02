import global from "../global";
import {cloneDeep} from "./utils";
import {generateID} from "./random";

export const getBackend = () => {
    return global.value.backend;
}

export const useAnnotations = () => {
    return {
        annotations: global.value.annotations
    }
}

/**
 * Use note
 *
 * @returns {{note: *}}
 */
export const useNote = () => {
    const { annotations } = useAnnotations()
    global.value.note.annotations = annotations;
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
        const { annotations } = useAnnotations();

        const newAnnotation = Object.assign({id: generateID()}, annotation);

        // TODO: refactor
        annotations.push(newAnnotation)

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
        return global.value.annotations;
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
        const { annotations } = useAnnotations();
        const idx = (annotations || []).findIndex((a) => a.id === annotationId);
        if (idx < 0) {
            return;
        }
        return cloneDeep(annotations.splice(idx, 1)[0]);
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
        const { annotations } = useAnnotations();

        const newComment = Object.assign({id: generateID()}, comment, {replies: []});

        const annotationIdx = (annotations || []).findIndex((a) => a.id === comment.annotation_id);
        if (annotationIdx < 0) {
            return;
        }

        const annotation = annotations[annotationIdx]

        if (!newComment.parent_id) {
            annotation.comment = newComment;
        } else {
            const replies = (annotation.comment && annotation.comment.replies) || [];
            replies.push(newComment);
        }

        annotations.splice(annotationIdx, 1)
        annotations.splice(annotationIdx, 0, annotation);

        // console.log(note.annotations);
        // console.log(global.value.note)

        return cloneDeep(newComment);
    }

    return {
        updateComment,
    }
}