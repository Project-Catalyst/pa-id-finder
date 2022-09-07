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
            <b-field label="Funds to include in the search"
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
          <div class="flex-container"> 
            <b-tooltip position="is-right" type="is-info is-light" class="info-icon"
              label="This filter is applied individually to each selected Fund, considering the remaining filter configuration. It will be ignored for improper configuration." multilined>
              <b-icon icon="information" size="is-small"></b-icon>
            </b-tooltip>
            <b-field label="Select from an interval of assessed Proposals" class="column is-6"> 
              <b-numberinput @input="updateNumberFilters('min')" v-model="selectedAssessmentMin" type="is-primary is-light" size="is-small" controls-alignment="left" controls-position="compact" min="0"></b-numberinput>
              <b-numberinput @input="updateNumberFilters('max')" v-model="selectedAssessmentMax" type="is-primary is-light" size="is-small" controls-alignment="right" controls-position="compact" min="0"></b-numberinput>
              <b-button @click="clearNumberFilter()" type="is-ghost" size="is-small">Clear filter</b-button>
            </b-field>
          </div>

          <!-- <b-button 
            type="is-primary is-small"
            @click="logFunds">
            Log funds
          </b-button> -->

        </b-collapse>
      </div>

      <div class="buttons is-flex is-justify-content-center">
        <b-tooltip :active="!canSearch" position="is-top" type="is-danger is-light"
          label="Insert an assessment text or select advanced filtering">
          <b-button 
            type="is-primary is-large"
            :disabled="!canSearch"
            @click="setFilteredAssessors">
            Search ID &nbsp; <b-icon v-if="searchStatus" icon="update" size="is-small"></b-icon>
          </b-button>
        </b-tooltip>
      </div>
    </section>

    <section class="box list-problems" v-if="hasSearch">
      <!-- <div class="title">Searched PA-IDs</div> -->
      <div class="subtitle" v-if="filteredAssessors.length === 0">
        There is no PA-ID identified for this search configuration.
      </div>
      <div v-else>
        <!-- <p><small>There are #{{searchCount}} assessors identified for this search</small></p> -->
        <div class="list content">
          <assessor-preview
            :key="assessor.id"
            v-for="assessor in filteredAssessors"
            :funds="funds"
            :assessor="assessor"
            :assessments="getAssessments(assessor)"            
          />
        </div>
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
          id: 'f9',
          title: "Fund 9",
          assessments: [],
          challenges: [],
          proposals: []
        },
        'f8': {
          id: 'f8',
          title: "Fund 8",
          assessments: [],
          challenges: [],
          proposals: []
        },
        'f7': {
          id: 'f7',
          title: "Fund 7",
          assessments: [],
          challenges: [],
          proposals: []
        },
        'f6': {
          id: 'f6',
          title: "Fund 6",
          assessments: [],
          challenges: [],
          proposals: []
        },
        'f5': {
          id: 'f5',
          title: "Fund 5",
          assessments: [],
          challenges: [],
          proposals: []
        },
        'f4': {
          id: 'f4',
          title: "Fund 4",
          assessments: [],
          challenges: [],
          proposals: []
        }
      },
      filteredAssessors: [],
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
      selectedAssessmentMin: undefined,
      selectedAssessmentMax: undefined
    }
  },
  computed: {
    searchCount() {
      return this.filteredAssessors.lenght
    },
    hasFund() {
      return this.selectedFunds.length > 0
    },
    hasTextSlice() {
      return this.assessmentSlice.length >= this.minSlice
    },
    hasAdvancedFiltering() {
      return (this.selectedChallenges.length > 0) || (this.selectedProposals.length > 0) || (typeof(this.selectedAssessmentMin) === 'number') || (typeof(this.selectedAssessmentMax) === 'number')
    },
    hasNumberRange(){
      return (typeof(this.selectedAssessmentMin) === "undefined" || typeof(this.selectedAssessmentMin) === "undefined" )
        ? false
        : this.selectedAssessmentMin < this.selectedAssessmentMax
    },
    canSearch() {
      return this.hasFund && (this.hasTextSlice || this.hasAdvancedFiltering)
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
          if( this.selectedChallenges.map(ch=>ch.fundId).includes(f.id) ) {
            let chRef = this.selectedChallenges.filter(ch => ch.fundId===f.id).map( (ch) => ch.id)
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
    getAssessments(assessor) {
      return assessor.fundSelection.map(s=>s.fundId).map( fId => this.funds[fId].assessments.filter(ass=>ass.idAssessor===assessor.id) ).flat()
    },
    setFilteredAssessors() {
      let filteredIds = [];
      
      this.selectedFunds.map(f=>f.id).forEach( (fId) => {
        
        let assessorsIds = [...new Set(this.funds[fId].assessments.map(ass=>ass.idAssessor))]
        if(this.selectedChallenges.length > 0) { 
          assessorsIds = this.filterAssessorsByChallenge(assessorsIds, fId)
        }
        if(this.selectedProposals.length > 0) {
          assessorsIds = this.filterAssessorsByProposal(assessorsIds, fId)
        }
        if(this.hasNumberRange) {
          assessorsIds = this.filterAssessorsByRange(assessorsIds, fId)
        }
        if(this.hasTextSlice) {
          assessorsIds = this.filterAssessmentsByText(assessorsIds, fId, this.assessmentSlice)
        }    

        filteredIds.push(assessorsIds)
      })
      filteredIds = [...new Set(filteredIds)].flat()
      this.filteredAssessors = filteredIds.map( (assessorId) => ({
        id: assessorId,
        fundSelection: this.selectedFunds.map( (f) => {
          return {
            fundId: f.id,
            selectedChallenges: this.selectedChallenges.filter(ch => ch.fundId===f.id ).map(ch => ch.id),
            selectedProposals: this.selectedProposals.filter(p => p.fundId===f.id ).map(p => p.id),
            selectedRange: [this.selectedAssessmentMin, this.selectedAssessmentMax],
            textSlice: this.assessmentSlice
          }
        })
      }))
      console.log(this.filteredAssessors.length)
      this.searchStatus = false;
      this.hasSearch = true;
    },
    filterAssessmentsByText(ids, fId, text) {
        let textAssessments = this.funds[fId].assessments.filter( (ass) => {
          if( ids.includes(ass.idAssessor) ) {
            let reviews = [ass.assessmentNoteAuditability, ass.assessmentNoteFeasibility, ass.assessmentNoteImpact];
            return reviews.join('; ').includes(text)
          }
          else { false }
        })
      return [...new Set(textAssessments.map(ass=>ass.idAssessor))]
    },
    filterAssessorsByChallenge(ids, fId) {
      let checker = arr => arr.every(v => v === true);
      let fChallenges = this.selectedChallenges.filter(ch => ch.fundId===fId).map(ch => (
        {
          id: ch.id,
          assessments: this.funds[fId].assessments.filter( (ass) => ass.challengeId===ch.id )
        }
      ))
      let filteredIds = [];
       
      if(fChallenges.length > 0) {
        ids.forEach( (assessorId) => {
          let chHasAssessor = fChallenges.map( ch => ch.assessments.filter(ass => ass.idAssessor===assessorId).length > 0 )
          if( checker(chHasAssessor) ){
            filteredIds.push(assessorId)
          }
        })
      }
      // if not Fund Challenges, all assessors from such Fund are ignored from filter (the Fund will be only info-displayed)
      return filteredIds

    },
    filterAssessorsByProposal(ids, fId) {
      let checker = arr => arr.every(v => v === true);
      let fProposals = this.selectedProposals.filter(p => p.fundId===fId).map(p => ({
        id: p.id,
        assessments: this.funds[fId].assessments.filter( (ass) => ass.proposalId===p.id )
      }))
      let filteredIds = [];
       
      if(fProposals.length > 0) {
        ids.forEach( (assessorId) => {
          let pHasAssessor = fProposals.map( p => p.assessments.filter(ass => ass.idAssessor===assessorId).length > 0 )
          if( checker(pHasAssessor) ){
            filteredIds.push(assessorId)
          }
        })
      }
      // if not Fund Proposals, all assessors from such Fund are ignored from filter (the Fund will be only info-displayed)
      return filteredIds
    },
    filterAssessorsByRange(ids, fId) {
        let freqIds = this.funds[fId].assessments.map( (ass) => ass.idAssessor )
        let occurrences = freqIds.reduce(function (acc, curr) {
          return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
        }, {}); 

        let filteredIds = ids.filter( (assessorId) => 
          occurrences[assessorId] >= this.selectedAssessmentMin && occurrences[assessorId] <= this.selectedAssessmentMax 
        )        
      return filteredIds
    },
    updateFundFilters(){
      this.loadDropdownChallenges()    // populate Challenges filter
      this.loadDropdownProposals()     // populate Proposals filter
      this.updateSearchStatus()
    },
    updateChallengeFilters(){
      this.updateSelectedProposals()
      this.loadDropdownProposals()     // populate Proposals filter
      this.updateSearchStatus()
    },
    updateNumberFilters(filterRef) {
      if(filterRef === 'min' && typeof(this.selectedAssessmentMax) === 'undefined') { this.selectedAssessmentMax = 3 }
      if(filterRef === 'max' && typeof(this.selectedAssessmentMin) === 'undefined') { this.selectedAssessmentMin = 0 }
      this.updateSearchStatus()
    },
    updateSearchStatus() {
      (this.hasSearch) ? this.searchStatus=true : this.searchStatus=false
    },
    updateSelectedProposals() {
      this.selectedProposals = this.selectedProposals.filter( p => this.selectedChallenges.filter(ch=>ch.fundId===p.fundId).map(ch=>ch.id).includes(p.challengeId) )
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
        return this.selectedChallenges.indexOf(option) === -1
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
        return this.selectedProposals.indexOf(option) === -1
      })
    },
    clearNumberFilter() {
      this.selectedAssessmentMin = undefined;
      this.selectedAssessmentMax = undefined;
      this.updateSearchStatus()
    },
    setValue(field, val) {
      if(field === 'assessmentText'){ this.assessmentSlice = val }
    }
  },
  mounted() {
    this.fundsKeys.forEach((f) => {
      CatalystAPI.assessments('f9').then((r) => { // change to <f>
        // compute properties
        let assessments = r.data.map( (obj) => ({...obj, fundId:f}) )
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
    this.funds = {...this.funds}
    console.log(this.funds)
    this.loadDropdownFunds()         // populate Funds filter
    this.loadDropdownChallenges()    // populate Challenges filter
    this.loadDropdownProposals()     // populate Proposals filter
  }
}
</script>

<style lang="scss">
.flex-container {
  display: flex;
}
.info-icon {
  padding-top: 0.75rem;
}
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

