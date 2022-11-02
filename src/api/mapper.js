/**
 * Mapper
 *
 * map api data to frontend data
 */

import {generateHexString} from "../shared/random";

export const commentMapper = (commentData) => {
    return {
        id: commentData.id,
        content: commentData.content,
        replies: commentData.replies
    }
}

export const annotationMapper = (target, annotation) => {
    return {
        target,
        $highlight: true,
        $cluster: "user-highlights",
        $tag: "a:" + generateHexString(8),
        type: annotation.type,
        id: annotation.id,
    }
};