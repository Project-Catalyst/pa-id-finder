<template>
  <div class="finder">
    <section class="box">
      <div class="columns is-multiline">
        <div class="column is-12">
          <div class="title">{{$t('finder.TITLE')}}</div>
          <div class="subtitle" v-html="$t('finder.SUBTITLE')"></div>
        </div>
      </div>

      <div class="filters">
        <div class="columns is-multiline">
          <div class="column is-12">
            <b-field><template #label>Assessment Text</template>
              <b-input 
                type="textarea" 
                v-model="assessmentSlice"
                placeholder="Insert here a slice of your assessment text">
              </b-input>
            </b-field>   
            <b-button
              @click="advancedFilters = !advancedFilters"
              type="is-primary is-light" outlined>
              {{advancedFiltersMsg}}
            </b-button>
          </div>
        </div>
        
        <b-collapse
          animation="slide"
          v-model="advancedFilters">
          <template #trigger></template>

          <p> ADVANCED FILTERING </p>

        </b-collapse>
      </div>

      <div class="buttons is-flex is-justify-content-center">
        <b-button 
          type="is-primary is-large"
          :disabled="!canSearch"
          @click="searchId">
          Search ID
        </b-button>
      </div>
    </section>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'Finder',
  components: {
  },
  data() {
    return {
    minSlice: 20,
    assessmentSlice: '',
    advancedFilters: false
    }
  },
  computed: {
    canSearch() {
      return (this.assessmentSlice >= this.minSlice)  // add condition for other filters
    },
    advancedFiltersMsg(){
      return (this.advancedFilters) ? 'Close advanced filtering' : 'Open advanced filtering'
    }
  },
  methods: {
    searchId() {

    }
    // getFilteredTags(text) {
    //   let filteredTags
    //   if (text) {
    //     filteredTags = this.tags.filter((option) => {
    //       return option
    //           .toString()
    //           .toLowerCase()
    //           .indexOf(text.toLowerCase()) >= 0
    //     })
    //   } else {
    //     filteredTags = this.tags
    //   }
    //   this.filteredTags = filteredTags.filter((option) => {
    //     return this.input.tags.indexOf(option) === -1
    //   })
    // }
  },
  mounted() {
  }
}
</script>

