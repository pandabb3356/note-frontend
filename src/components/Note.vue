<script>
import { createAnnotation } from "../api/annotation";

import { annotationMapper } from "../api/mapper";
import { selectedRange } from "../annotator/selection-observer";
import { describe as htmlDescribe, anchor as htmlAnchor } from "../annotator/integrations/html";
import { ADDER_TYPE } from "../annotator/adder/type";
import {removeAllHighlights} from "../annotator/highlighter";


export default {
  props: {
    note: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      mode: "view",
      adderDisplay: false,
      adders: [
          ADDER_TYPE.HIGHLIGHT,
          ADDER_TYPE.UNDERLINE
      ],
      selection: {
        text: "",
        position: {
          x: "",
          y: "",
        },
        ranges: [],
      },
      annotationForm: {
        text: "",
      },
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      this.initEvents();
      this.initWindowMethods();
      this.initAnnotations();
    },
    buildNoteSelectorId() {
      return `note-content-${this.note.id}`;
    },
    triggerClickedEvent(annotation) {
      return () => {
        this.triggerAnnotationEvent(this.annotationEvent.annotationClicked, {annotationId: annotation.id})
      }
    },
    initAnnotations() {
      this.note.annotations.forEach((annotation) => {
        try {
          annotation.target = typeof annotation.target === "string" ? JSON.parse(annotation.target) : annotation.target;

          const annotationData = annotationMapper(annotation.target, annotation);

          htmlAnchor(annotationData, this.noteBody(), this.triggerClickedEvent(annotationData));

        } catch (e) {
          console.log(`initAnnotations Error: ${e}`);
        }
      })
    },
    initWindowMethods() {
      window.onAnnotationSelect = (annotationId) => {
        const card = document.getElementById(`annotation-card-${annotationId}`);
        if (card) {
          card.scrollIntoView({ behavior: "smooth" });
        }
      };
    },
    clearSelectionRanges() {
      this.$set(this.selection, "ranges", []);
    },
    initEvents() {
      // selection event
      const initSelectEvent = () => {
        if (!this.noteBody()) {
          return
        }
        this.noteBody().addEventListener("mouseup", (e) => {
          this.selection.text = this.getCurrentSelectText();
          if (this.selection.text === "") {
            this.setAdderDisplay(false);
            this.clearSelectionRanges();
          } else {
            this.setAdderDisplay(true);

            // init selectedRange
            const range = selectedRange(window.document);
            this.selection.ranges = [range];
          }

          const contentRect = this.noteBody().getBoundingClientRect()
          this.selection.position.x = e.pageX - contentRect.x - 10;
          this.selection.position.y = e.pageY - contentRect.y + 10;
        });
      };

      // click event
      const initClickEvent = () => {
        window.addEventListener("click", () => {
          if (!this.getCurrentSelectText()) {
            this.setAdderDisplay(false);
          }
        });
      };

      // init events
      initSelectEvent();
      initClickEvent();

      const self = this;
      // register annotation deleted event
      this.registerAnnotationEvent(this.annotationEvent.deleted, () => {
        removeAllHighlights(this.noteBody());
        this.initAnnotations();
      })
    },
    noteBody() {
      return document.getElementById(this.buildNoteSelectorId());
    },
    async addAnnotation(adderType = ADDER_TYPE.HIGHLIGHT) {
      // to rangeSelectors
      const rangeSelectors = this.selection.ranges.map((range) =>
          htmlDescribe(this.noteBody(), range)
      );

      const target = rangeSelectors.map((selectors) => ({
        // In the Hypothesis API the field containing the selectors is called
        // `selector`, despite being a list.
        selector: selectors,
      }));

      // build form data
      const toFormData = () => {
        return {
          content: this.getCurrentSelectText(),
          text: this.getCurrentSelectText(),
          author_id: "1",
          start: this.getCurrentSelect().baseOffset,
          end: this.getCurrentSelect().extentOffset,
          target: JSON.stringify(target),
          type: adderType.toLowerCase(),
        };
      };

      // create an annotation
      const annotation = await createAnnotation(this.note.id, toFormData());

      // sync. annotations
      this.note.annotations = this.note.annotations || [];
      this.note.annotations.push(annotation);

      // hide actions
      this.setAdderDisplay(false);

      const annotationData = annotationMapper(target, annotation);

      htmlAnchor(annotationData, this.noteBody(), this.triggerClickedEvent(annotationData));

      this.clearSelectionRanges();
    },
    getCurrentSelectText() {
      let text = "";
      if (window.getSelection) {
        text = window.getSelection().toString();
      } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
      }
      return text;
    },
    getCurrentSelect() {
      return window.getSelection
        ? window.getSelection()
        : document.selection.createRange();
    },
    setAdderDisplay(visible) {
      this.adderDisplay = visible;
    },
  },
  computed: {
    actionsStyle() {
      return {
        left: `${this.selection.position.x || 0}px`,
        top: `${this.selection.position.y || 0}px`,
      };
    },
  },
};
</script>

<template>
  <div class="container">
    <div class="note-container">
      <h1 class="note-title">{{ note.title }}</h1>
      <div>
        <div class="note-content">
          <div :id="'note-content-' + note.id" v-html="note.content"></div>
          <div class="adder-popup" v-if="adderDisplay" :style="actionsStyle">
            <div class="actions-container">
              <button
                class="action"
                v-for="adder in adders"
                @click="addAnnotation(adder)"
              >
                <span>{{ adder.toLowerCase() }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.container {
  position: relative;
}

.adder-popup {
  position: absolute;
  background-color: white;
  z-index: 10;
  border: 1px solid #615d5d;
}
.note-container {
  padding: 10px;
  position: relative;
  min-height: 100%;
}

.note-container .note-content {
  position: relative;
  margin-top: 10px;
  border: 1px solid white;
  min-height: 300px;
  padding: 10px;
  border-radius: 8px;
}

.actions-container {
  display: flex;
}

.actions-container .action:not(:first-child) {
  border-left: 1px solid rgb(176, 169, 159);
}

.actions-container .action {
  min-height: 50px;
  padding: 10px;
  display: flex;
  line-height: 12px;
  border: 0;
  align-items: center;
  cursor: pointer;
  color: rgb(176, 169, 159);
  background-color: rgb(24, 26, 27);
}

.actions-container .action:hover {
  color: white;
}

.hypothesis-highlight {
  background-color: rgba(126, 126, 0, 0.4);
  cursor: pointer;
}

.hypothesis-underline {
  text-decoration: underline;
  cursor: pointer;
  text-decoration-color: rgba(227, 111, 14, 0.8);
}

h1.note-title {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}
</style>
