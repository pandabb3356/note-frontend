<template>
  <div class="annotation-card" :id="'annotation-card-' + annotation.id">
    <!-- card header   -->
    <div class="card-header">
      <div class="user-info">
        <span>{{ userName(annotation.author_id) }}</span>
      </div>
    </div>
    <!-- annotation text -->
    <div class="annotation-text">
      {{ annotation.content || "" }}
    </div>
    <!-- comments container -->
    <div class="comments-container">
      <!--  comment view -->
      <div class="comment" v-if="!isEditComment && hasComment">
        {{ form.content || annotation.comment.content }}
      </div>
      <!--  comment edit -->
      <textarea
        class="comment-textarea"
        v-model="form.content"
        v-else-if="isEditComment"
      ></textarea>

      <!-- edit mode operations -->
      <div class="operations" v-if="isEditComment">
        <button class="oper-btn" :disabled="!form.content" @click="addComment">
          Post
        </button>
        <button class="oper-btn" @click="cancelPost(optionsType.comment)">Cancel</button>
      </div>
      <div class="operations" v-else>
        <button class="oper-btn" @click="editComment">Edit</button>
        <button class="oper-btn" @click="editReply" v-if="hasComment">Reply</button>
        <button class="oper-btn danger" @click="deleteAnnotation">
          Delete
        </button>
      </div>

      <!-- replies -->
      <template v-if="hasComment">
        <div class="replies-container" v-if="showReplies">
          <button @click="setRepliesVisible(false)" class="oper-btn primary">Hide Replies ({{ repliesCount }})</button>
          <textarea class="comment-textarea reply" v-model="replyForm.content" v-if="isEditReply"></textarea>
          <div class="operations" v-if="isEditReply">
            <button class="oper-btn" :disabled="!replyForm.content" @click="addReply">
              Post
            </button>
            <button class="oper-btn" @click="cancelPost(optionsType.reply)">Cancel</button>
          </div>
          <div class="replies" v-if="hasComment" v-for="reply in replies">
            <div>{{ reply.content }}</div>
          </div>
        </div>
        <div class="replies-container" v-else-if="!showReplies">
          <button @click="setRepliesVisible(true)" class="oper-btn primary">Show Replies ({{ repliesCount }})</button>
        </div>
      </template>

    </div>
  </div>
</template>
<script>
import { updateComment, deleteAnnotation } from "../../api/annotation";
import { commentMapper } from "../../api/mapper";


const optionsType = {
  comment: "comment",
  reply: "reply",
}

// Mode
const MODE = {
  VIEW: "VIEW",
  EDIT: "EDIT",
};

// Operation
const OPERATION = {
  POST: "POST",
  EDIT: "EDIT",
  CANCEL: "CANCEL",
  REPLY: "REPLY",
  DELETE: "DELETE",
};

const currentUser = {
  id: 1,
  name: "Guest"
}

export default {
  props: {
    annotation: {
      type: Object,
      default() {
        return {};
      },
    },
    handler: {
      type: Function,
      default() {
        return () => {};
      },
    },
  },
  data() {
    return {
      mode: MODE.VIEW,
      form: {
        content: "",
      },
      replyForm: {
        content: ""
      },
      options: {
        [optionsType.comment]: {
          mode: MODE.VIEW
        },
        [optionsType.reply]: {
          mode: MODE.VIEW
        }
      },
      optionsType: optionsType,
      showReplies: false
    };
  },
  mounted() {
    if (!this.hasComment) {
      //   this.switchMode(MODE.EDIT);
    }

    this.initViewContent();
  },
  computed: {
    hasComment() {
      return !!this.annotation.comment;
    },
    isEditComment() {
      return this.options[optionsType.comment].mode === MODE.EDIT;
    },
    isEditReply() {
      return this.options[optionsType.reply].mode === MODE.EDIT;
    },
    replies() {
      return (this.annotation.comment && this.annotation.comment.replies) || [];
    },
    repliesCount() {
      return this.replies.length;
    }
  },
  methods: {
    initViewContent(type) {
      const defaultHandler = () => {};

      const handlerMap = {
        [optionsType.comment]: () => {
          this.form.content = this.hasComment
              ? this.annotation.comment.content
              : "";
        },
        [optionsType.reply]: () => {
          this.replyForm.content = "";
        }
      }

      const handler = handlerMap[type] || defaultHandler;

      handler();
    },
    cancelPost(type) {
      this.initViewContent();
      this.switchMode(MODE.VIEW, type);
    },
    async addComment() {
      // build form data
      const toFormData = () => {
        return {
          content: this.form.content,
          annotation_id: this.annotation.id,
          author_id: this.annotation.id,
        };
      };

      // update comment
      const comment = await updateComment(toFormData());

      // map result
      this.annotation.comment = commentMapper(comment);

      // switch view mode
      this.switchMode(MODE.VIEW);
    },
    async addReply() {
      // build form data
      const toFormData = () => {
        return {
          content: this.replyForm.content,
          annotation_id: this.annotation.id,
          parent_id: this.annotation.comment && this.annotation.comment.id,
        };
      };

      // update comment
      const reply = await updateComment(toFormData());

      // map result
      this.annotation.comment.replies.push(commentMapper(reply))

      // switch view mode
      this.switchMode(MODE.VIEW, optionsType.reply);

      this.initViewContent(optionsType.reply);
    },
    switchMode(mode, type = optionsType.comment) {
      this.options[type].mode = mode;
    },
    editComment() {
      this.switchMode(MODE.EDIT);
      if (this.hasComment) {
        this.form.content = this.annotation.comment.content;
      }
    },
    editReply() {
      this.switchMode(MODE.EDIT, optionsType.reply);
      this.setRepliesVisible(true);
    },
    async deleteAnnotation() {
      await deleteAnnotation(this.annotation.id);
      this.triggerAnnotationEvent(this.annotationEvent.deleted, {annotationId: this.annotation.id})
    },
    setRepliesVisible(visible) {
      this.showReplies = visible;
    }
  },
};
</script>
<style>
.annotation-card {
  padding: 12px;
  border-radius: 2px;
  border: 1px solid #544f4f;
}

.annotation-text {
  margin: 12px 0;
  border: 0 solid;
  border-left-width: 3px;
  padding: 0 1em;
  font-style: italic;
  min-height: 14px;
  line-height: 20px;
  font-size: 14px;
  overflow: unset;
}

.comments-container {
  padding: 10px 0;
}

.comment-textarea {
  background: none;
  border-radius: 4px;
  width: 100%;
  color: white;
}

.comment,
.comment-textarea {
  margin-bottom: 10px;
}

.comment-textarea.reply {
  margin-top: 20px;
}

.operations {
  display: flex;
  column-gap: 0.75em;
}

.oper-btn {
  background-color: rgb(67, 73, 75);
  border: 1px solid transparent;
  border-radius: 2px;
  padding: 5px 10px;
  color: white;
  cursor: pointer;
}

.oper-btn:hover {
  background-color: rgb(47, 51, 43);
}

.oper-btn:disabled {
  color: grey;
  background-color: rgb(67, 73, 75);
  cursor: not-allowed;
}

.oper-btn.danger {
  background-color: #bd1919;
}

.oper-btn.danger:hover {
  background-color: #971b1b;
}

.oper-btn.danger:disabled {
  color: grey;
  background-color: #640b0b;
}

.oper-btn.primary {
  background-color: #0ea52c;
}

.oper-btn.primary:hover {
  background-color: #0b8926;
}

.oper-btn.primary:disabled {
  color: grey;
  background-color: #08721f;
}

.replies-container {
  padding: 20px 0;
}

.replies-container .replies {
  padding: 20px 0;
}
</style>
