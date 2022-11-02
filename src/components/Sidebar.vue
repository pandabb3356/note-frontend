<template>
  <div class="sidebar-container">
    <div class="annotations-container">
      <div class="query-selector">
        <div class="query-container">Count: {{ count }}</div>
      </div>
      <AnnotationCard
        v-for="annotation in filteredAnnotations"
        :annotation="annotation"
      />
    </div>
  </div>
</template>

<script>
import AnnotationCard from "./annotation/AnnotationCard.vue";

export default {
  components: {
    AnnotationCard,
  },
  props: {
    annotations: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      filteredAnnotations: [],
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.initAnnotations();
      this.registerAnnotationEvent(
          this.annotationEvent.deleted,
          this.onAnnotationDeleted
      )
    },
    initAnnotations() {
      this.filteredAnnotations = this.annotations.map((a) => a);
    },
    onAnnotationDeleted({annotationId}) {
      const aIdx = this.annotations.findIndex((a) => a.id === annotationId);
      this.annotations.splice(aIdx, 1);
      this.initAnnotations();
    },
  },
  computed: {
    count() {
      return this.annotations.length;
    },
  },
  watch: {
    annotations() {
      this.initAnnotations();
    },
  },
};
</script>

<style>
.sidebar-container {
  padding: 10px;
  height: 100%;
  width: 100%;
  background-color: rgb(27, 29, 30);
  max-height: 100vh;
}

.annotations-container {
  overflow-y: auto;
  max-height: 100%;
}

.query-selector {
  padding: 10px;
  margin-bottom: 10px;
  background-color: rgb(27, 29, 30);
  border-radius: 2px;
  border: 1px solid #544f4f;
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
