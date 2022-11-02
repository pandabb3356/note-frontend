<template>
  <div class="sidebar-container">
    <div class="annotations-container">
      <div class="query-selector">
        <div class="query-container">
          <div class="count">Count: {{ showingCount }}</div>
          <button class="oper-btn" @click="resetSearch" v-if="searchOptions.id.value">All ({{ count }})</button>
          <button class="oper-btn" @click="resetSearch" v-else-if="searchOptions.keyword.value">Clear Search</button>
        </div>
        <div class="search-container">
          <input type="text" placeholder="Search..." v-model="searchOptions.keyword.value">
        </div>
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
import {isFullMatch, isMatch} from "../shared/filter";

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
      searchOptions: {
        keyword: {
          value: "",
          queryKeys: ["content"]
        },
        id: {
          value: "",
          queryKeys: ["id"]
        }
      },
      options: {
        highlightClass: "annotation-content-highlight"
      }
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      // init. annotations
      this.initAnnotations();

      // register events
      this.initEvents();
    },
    initEvents() {
      this.registerAnnotationEvent(
          this.annotationEvent.deleted,
          ({annotationId}) => {
            const aIdx = this.annotations.findIndex((a) => a.id === annotationId);
            this.annotations.splice(aIdx, 1);
            this.resetSearch();
          }
      )

      this.registerAnnotationEvent(
          this.annotationEvent.annotationClicked,
          ({annotationId}) => {
            this.searchOptions.keyword.value = "";
            this.searchOptions.id.value = annotationId;
            this.onSearch();
          }
      )
    },
    hasSearchKeyword() {
      return !!this.searchOptions.keyword.value;
    },
    initAnnotation(annotation) {
      const replaceContent = (content) => {
        const replaceHTML = `<span class="${this.options.highlightClass}">${this.searchOptions.keyword.value}</span>`
        const pattern = new RegExp(this.searchOptions.keyword.value, "gi");

        return content.replace(pattern, replaceHTML);
      };

      return Object.assign({
        displayContent: this.hasSearchKeyword() ? replaceContent(annotation.content) : annotation.content
      }, annotation)
    },
    initAnnotations() {
      this.onSearch();
    },
    onSearch() {
      // filters
      const defaultFilter = (data) => true;

      const filterMap = {
        keyword: (data) => {
          const queryKeys = this.searchOptions.keyword.queryKeys;
          return !this.searchOptions.keyword.value ? true :
              queryKeys.some(
                  (key) => isMatch(data, key, this.searchOptions.keyword.value)
              );
        },
        id: (data) => {
          const queryKeys = this.searchOptions.id.queryKeys;
          return !this.searchOptions.id.value ? true :
              queryKeys.some(
                  (key) => isFullMatch(data, key, this.searchOptions.id.value)
              );
        }
      }

      // set filteredAnnotations
      this.filteredAnnotations = this.annotations.filter((annotation) => {
        return Object.keys(this.searchOptions).every((searchOption) => {
          const val = (filterMap[searchOption] || defaultFilter)(annotation);
          return val;
        })
      }).map((a) => this.initAnnotation(a))
    },
    resetSearch() {
      this.searchOptions.id.value = "";
      this.searchOptions.keyword.value = "";
      this.onSearch();
    }
  },
  computed: {
    showingCount() {
      return this.filteredAnnotations.length;
    },
    count() {
      return this.annotations.length;
    }
  },
  watch: {
    annotations() {
      this.initAnnotations();
    },
    "searchOptions.keyword.value": function () {
      this.onSearch();
    }
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
  padding: 15px 10px;
  margin-bottom: 10px;
  background-color: rgb(27, 29, 30);
  border-radius: 2px;
  border: 1px solid #544f4f;
  position: sticky;
  top: 0;
  z-index: 10;
}

.query-selector .search-container > input[type="text"] {
  border: 1px solid #ccc;
  float: none;
  display: block;
  text-align: left;
  width: 100%;
  margin: 10px 0 0 0;
  padding: 6px;
  font-size: 16px;
  border-radius: 4px;
}

.query-selector .query-container {
  display: flex;
  align-items: center;
}

.query-selector .query-container .count {
  width: 65%;
}

.oper-btn {
  background-color: rgb(67, 73, 75);
  border: 1px solid transparent;
  border-radius: 2px;
  padding: 5px 10px;
  color: white;
  cursor: pointer;
  overflow: hidden;
}

.oper-btn:hover {
  background-color: rgb(47, 51, 43);
}

</style>
