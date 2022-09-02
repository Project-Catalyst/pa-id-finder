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
        <div class="default-filters columns is-multiline">
          <div class="column is-12">
            <!-- Fund Selection -->
            <b-field label="Select from Funds"
            :type="{ 'is-danger': !hasFund }"
            :message="{ 'Fund selection is required': !hasFund }">
              <b-taginput
                  ref="fundTagSelection"
                  v-model="selectedFunds"
                  :data="dropdownFunds"
                  autocomplete
                  field="title"
                  icon="label"
                  :open-on-focus="true"
                  placeholder="Filter by specific funds"
                  @remove="loadDropdownFunds(false)"
                  @typing="loadDropdownFunds"
                  @input="updateFundFilters()"
                  type="is-primary is-light"
                  close-type="is-primary is-light"
                  attached>
                  <template v-slot="props">
                      {{props.option.title}}
                  </template>
                  <template #empty>
                      There are no items
                  </template>
              </b-taginput>
            </b-field>
            <!-- Text Assessment Input -->
            <b-field><template #label>Assessment Text</template>
              <b-input 
                type="textarea" 
                v-model="debouncedText"
                @input="updateSearchStatus()"
                placeholder="Insert here a slice of your assessment text">
              </b-input>
            </b-field>   
            <b-button
              :disabled="!hasFund"
              @click="advancedFilters = !advancedFilters"
              type="is-primary is-light" 
              outlined>
              {{advancedFiltersMsg}}
            </b-button>
          </div>
        </div>
        <b-collapse class="advanced-filters"
          animation="slide"
          v-model="advancedFilters">
          <template #trigger></template>

          <!-- Challenge Selection -->
          <b-field label="Select from Challenges you have assessed">
            <b-taginput
              ref="challengeTagSelection"
              v-model="selectedChallenges"
              :data="dropdownChallenges"
              autocomplete
              field="title"
              icon="label"
              :open-on-focus="true"
              placeholder="Filter by specific challenges"
              @remove="loadDropdownChallenges(false)"
              @typing="loadDropdownChallenges"
              @input="updateChallengeFilters()"
              type="is-primary is-light"
              close-type="is-primary is-light"
              attached>
              <template v-slot="props">
                  {{props.option.title}}
              </template>
              <template #empty>
                  There are no items
              </template>
            </b-taginput>
          </b-field>
          <!-- Proposal Selection -->
          <b-field label="Select from Proposals you have assessed">
            <b-taginput
              ref="proposalTagSelection"
              v-model="selectedProposals"
              :data="dropdownProposals"
              autocomplete
              field="title"
              icon="label"
              :open-on-focus="true"
              placeholder="Filter by specific proposals"
              @remove="loadDropdownProposals(false)"
              @typing="loadDropdownProposals"
              @input="updateSearchStatus()"
              type="is-primary is-light"
              close-type="is-primary is-light"
              attached>
              <template v-slot="props">
                  {{props.option.fundId.toUpperCase()}}: {{props.option.title}}
              </template>
              <template #empty>
                  There are no items
              </template>
            </b-taginput>
          </b-field>
          <!-- Number of Proposals Assessed Selection -->
          <b-field label="Select from an interval of assessed Proposals" class="column is-4">
            <b-numberinput @input="updateSearchStatus()" type="is-primary is-light" size="is-small" controls-alignment="left" controls-position="compact" min="0"></b-numberinput>
            <b-numberinput @input="updateSearchStatus()" type="is-primary is-light" size="is-small" controls-alignment="right" controls-position="compact" min="0"></b-numberinput>
          </b-field>

          <b-button 
            type="is-primary is-small"
            @click="logFunds">
            Log funds
          </b-button>

        </b-collapse>
      </div>

      <div class="buttons is-flex is-justify-content-center">
        <b-tooltip :active="!canSearch" position="is-top" type="is-danger is-light"
          label="Insert an assessment text or select advanced filtering">
          <b-button 
            type="is-primary is-large"
            :disabled="!canSearch"
            @click="searchId">
            Search ID &nbsp; <b-icon v-if="searchStatus" icon="update" size="is-small"></b-icon>
          </b-button>
        </b-tooltip>
      </div>
    </section>

    <section class="box list-problems" v-if="hasSearch">
      <div class="title">Searched PA-IDs</div>
      <div class="subtitle" v-if="sensedProblems.length === 0">
        You haven't created any Sensed Problem yet. Let's try your first!
      </div>
      <div class="list content">
        <assessor-preview
          :key="sensed.id"
          v-for="sensed in sensedProblems"
          :sensed="sensed"
        />
      </div>
    </section>
  </div>
</template>

<script>
// @ is an alias to /src
import AssessorPreview from '@/components/AssessorPreview.vue'
import CatalystAPI from '@/api/catalyst.js';
import debounce from 'lodash.debounce';

export default {
  name: 'Finder',
  components: {
    AssessorPreview
  },
  data() {
    return {
      fund: 'f9',
      funds: { 
        'f9': {
          fundId: 'f9',
          title: "Fund 9",
          assessments: [],
          challenges: [],
          proposals: []
        },
        'f8': {
          fundId: 'f8',
          title: "Fund 8",
          assessments: [],
          challenges: [],
          proposals: []
        },
        'f7': {
          fundId: 'f7',
          title: "Fund 7",
          assessments: [],
          challenges: [],
          proposals: []
        },
        'f6': {
          fundId: 'f6',
          title: "Fund 6",
          assessments: [],
          challenges: [],
          proposals: []
        },
        'f5': {
          fundId: 'f5',
          title: "Fund 5",
          assessments: [],
          challenges: [],
          proposals: []
        },
        'f4': {
          fundId: 'f4',
          title: "Fund 4",
          assessments: [],
          challenges: [],
          proposals: []
        }
      },
      hasSearch: false,
      searchStatus: false,
      minSlice: 20,
      assessmentSlice: '',
      advancedFilters: false,
      dropdownFunds: [],
      selectedFunds: [],
      dropdownChallenges: [],
      selectedChallenges: [],
      dropdownProposals: [],
      selectedProposals: [],
    }
  },
  computed: {
    hasFund() {
      return this.selectedFunds.length > 0
    },
    canSearch() {
      return this.hasFund && (this.assessmentSlice.length >= this.minSlice)  // add condition for other filters
    },
    advancedFiltersMsg(){
      return (this.advancedFilters) ? 'Close advanced filtering' : 'Open advanced filtering'
    },
    fundsKeys() {
      return Object.keys(this.funds)
    },
    debouncedText: {
      get() {
        return this.assessmentSlice;
      },
      set: debounce(function(val) {
        this.setValue('assessmentText', val)
      }, 500)
    },
    filteredChallenges(){
      if(this.selectedFunds.length > 0){
        let selection = [];
        this.selectedFunds.forEach( (f) => {
          selection = selection.concat( f.challenges )
        })
        return selection
      }
      return []
    },
    filteredProposals(){
      if(this.selectedFunds.length > 0){
        let selection = [];
        this.selectedFunds.forEach( (f) => {
          if( this.selectedChallenges.map(ch=>ch.fundId).includes(f.fundId) ) {
            let chRef = this.selectedChallenges.filter(ch => ch.fundId===f.fundId).map( (ch) => ch.id)
            selection = selection.concat( f.proposals.filter( (p) => chRef.includes(p.challengeId) ) )
          }
          else {
            selection = selection.concat( f.proposals )
          }
        })
        return selection
      }
      return []
    }
  },
  methods: {
    logFunds(){
      console.log(this.funds)
      console.log(this.selectedFunds)
    },
    searchId() {
      console.log('searchId')
      this.updateSearch = false;
      // this.hasSearch = true;
    },
    updateFundFilters(){
      this.loadDropdownChallenges()    // populate Challenges filter
      this.loadDropdownProposals()     // populate Proposals filter
      this.updateSearchStatus()
    },
    updateChallengeFilters(){
      this.loadDropdownProposals()     // populate Proposals filter
      this.updateSearchStatus()
    },
    updateSearchStatus() {
      (this.hasSearch) ? this.searchStatus=true : this.searchStatus=false
    },
    loadDropdownFunds(text) {
      let dropdown;
      let selection = Object.values(this.funds);
      if (text) {
        dropdown = this.funds.filter((option) => {
          return option.title
            .toString()
            .toLowerCase()
            .indexOf(text.toLowerCase()) >= 0
        })
      } else {
        dropdown = selection
      }
      this.dropdownFunds = dropdown.filter((option) => {
        return this.selectedFunds.indexOf(option) === -1
      })
    },
    loadDropdownChallenges(text) {
      let dropdown;
      let selection = this.filteredChallenges;
      if (text) {
        dropdown = selection.filter((option) => {
          return option.title
            .toString()
            .toLowerCase()
            .indexOf(text.toLowerCase()) >= 0
        })
      } else {
        dropdown = selection
      }
      this.dropdownChallenges = dropdown.filter((option) => {
        return this.selectedFunds.indexOf(option) === -1
      })
    },
    loadDropdownProposals(text) {
      let dropdown;
      let selection = this.filteredProposals;
      if (text) {
        dropdown = selection.filter((option) => {
          return option.title
            .toString()
            .toLowerCase()
            .indexOf(text.toLowerCase()) >= 0
        })
      } else {
        dropdown = selection
      }
      this.dropdownProposals = dropdown.filter((option) => {
        return this.selectedFunds.indexOf(option) === -1
      })
    },
    setValue(field, val) {
      if(field === 'assessmentText'){ this.assessmentSlice = val }
    }
  },
  mounted() {
    this.fundsKeys.forEach((f) => {
      CatalystAPI.assessments('f9').then((r) => { // change to <f>
        // compute properties
        let assessments = r.data
        let challenges = assessments.map( (ass) => (
            {
              id: ass.challengeId , 
              title: ass.challengeTitle,
              fundId: f
            }
          ))
        let proposals = assessments.map( (ass) => (
            {
              id: ass.proposalId , 
              title: ass.proposalTitle,
              url: ass.proposalUrl,
              challengeId: ass.challengeId,
              fundId: f
            }
          ))
        // populate this.funds properties
        this.funds[f].assessments = assessments
        this.funds[f].challenges = challenges.filter((value, index, self) =>
          index === self.findIndex((t) => (
            t.id === value.id && t.title === value.title
          ))
        )
        this.funds[f].proposals = proposals.filter((value, index, self) =>
          index === self.findIndex((t) => (
            t.id === value.id && t.title === value.title && t.url === value.url && t.challengeId === value.challengeId
          ))
        )
      })
    })
    this.loadDropdownFunds()         // populate Funds filter
    this.loadDropdownChallenges()    // populate Challenges filter
    this.loadDropdownProposals()     // populate Proposals filter
  }
}
</script>

<style lang="scss">
.tags {
  .tag:not(.is-light) {
    cursor: pointer;
  }
}
.results {
  .tag {
    height: auto;
    white-space: initial !important;
    padding-top: 0.75em;
    padding-bottom: 0.75em;
  }
}
.autocomplete {
  .dropdown-menu {
    z-index: 2000;
    &.is-opened-top {
      .dropdown-content {
        max-height: 300px !important;
      }
    }
  }
  .dropdown-item {
    white-space: initial;
    overflow: initial;
    text-overflow: initial;
    span {
      white-space: initial;
    }
  }
}
.is-vertical-centered {
  span {
    vertical-align: middle;
    display: inline-block;
  }
}
</style>

