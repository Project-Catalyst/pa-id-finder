<template>
  <div class="assessor-preview">
    <div class="columns is-multiline">
      <div class="column is-8">
        Sensed Problem #{{sensed.id}}
        <div class="buttons mt-4">
          <b-button
            tag="router-link" 
            :to="{ name: 'edit', params: { id: sensed.id} }"
            size="is-small"
            icon-left="pencil"
            type="is-primary">
            Edit problem
          </b-button>
          <b-button
            size="is-small"
            icon-left="delete"
            type="is-danger"
            @click="removeSensed">
            Delete problem
          </b-button>
        </div>
      </div>
      <div class="column is-4">
        <b-progress
          type="is-success"
          class="complete-progress mt-2"
          :value="completed"
          size="is-medium"
          show-value
          >
          Problem Completion
        </b-progress>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'AssessorPreview',
  props: ['sensed'],
  data() {
    return {
    }
  },
  computed: {
    completed() {
      const reducer = (previousValue, currentValue) => previousValue + currentValue;
      let fields =  ["description", "importance", "gap", "value", "tags"]
        .map((el) => (this.sensed[el].length > 0) ? 1 : 0 )
        .reduce(reducer)
      return parseInt((100 * fields) / 5)
    }
  },
  methods: {
    removeSensed() {
      this.$buefy.dialog.confirm({
        title: 'Delete Sensed Problem',
        message: `By confirming, you will permanently remove this problem 
                  from you local storage. Restoring it will not be possible.`,
        cancelText: 'Cancel',
        confirmText: 'Delete',
        type: 'is-danger',
        onConfirm: () => {
          this.$store.commit('sensed/deleteSensed', this.sensed.id);
        }
      })
    }
  },
  mounted() {
  }
}
</script>


<style lang="scss">
  .assessor-preview {
    padding: 10px 20px;
    width: 100%;
    &:nth-child(2n + 1) {
      background: #f1f1f1;
      progress::-webkit-progress-bar {
        background-color: #fff !important;
      }
      progress::-moz-progress-bar {
        background-color: #fff !important;
      }
    }
    &:nth-child(2n) {
    }
  }
</style>
