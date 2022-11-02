const ANNOTATION_NAMESPACE = "annotation";

export const AnnotationEventMixin = {
    data() {
        return {
            annotationEvent: {
                deleted: `${ANNOTATION_NAMESPACE}Deleted`,
                updated: `${ANNOTATION_NAMESPACE}Updated`,
                created: `${ANNOTATION_NAMESPACE}Created`,
                annotationClicked: `${ANNOTATION_NAMESPACE}AnnotationClicked`,
            }
        }
    },
    methods: {
        registerAnnotationEvent(eventType, handler) {
            this.$eventBus.$on(eventType, (data) => {
                handler(data);
            });
        },
        triggerAnnotationEvent(eventType, data) {
            this.$eventBus.$emit(eventType, data)
        }
    }
}