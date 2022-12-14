<template>
  <div class="finder">
    <section class="box">
      <div class="columns is-multiline">
        <div class="column is-12">
          <div class="title">{{$t('finder.TITLE')}}</div>
          <div class="subtitle" v-html="$t('finder.SUBTITLE')"></div>
        </div>
        <div class="column is-12">
          <div class="content" v-html="$t('finder.EXPLANATION')"></div>
        </div>
      </div>

      <div class="filters">
        <div class="default-filters columns is-multiline">
          <div class="column is-12">
            <!-- Fund Selection -->
            <b-field label="Fund to search" class="column is-6"
            :type="{ 'is-danger': !hasFund }"
            :message="{ 'Fund selection is required': !hasFund }">
              <b-select placeholder="Choose a Fund"
                v-model="selectedFund"
                @input="updateFundFilters()"
                expanded>
                <option
                    v-for="fund in dropdownFunds"
                    :value="fund"
                    :key="fund.id">
                    {{ fund.title }}
                </option>
              </b-select>
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
            <b-taginput class="column is-11"
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
            <b-button class="clear-btn" @click="clearChallengeFilter()" type="is-ghost" size="is-small">Clear filter</b-button>
          </b-field>
          <!-- Proposal Selection -->
          <b-field label="Select from Proposals you have assessed">
            <b-taginput class="column is-11"
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
            <b-button class="clear-btn" @click="clearProposalFilter()" type="is-ghost" size="is-small">Clear filter</b-button>
          </b-field>
          <!-- Number of Proposals Assessed Selection -->
          <div class="flex-container"> 
            <b-tooltip position="is-right" type="is-info is-light" class="info-icon"
              label="This filter is applied considering all Proposals in the selected Fund. Part of the assessments considered in this counting may not appear in the final search results." multilined>
              <b-icon icon="information" size="is-small"></b-icon>
            </b-tooltip>
            <b-field label="Set the minimum and/or maximum number of assessed Proposals (across all challenges)" class="column is-7"> 
              <b-numberinput type="is-primary is-light" size="is-small" :controls="false" :min="null"
                @input="updateSearchStatus()" 
                v-model="selectedAssessmentMin">
              </b-numberinput>
              <b-numberinput type="is-primary is-light" size="is-small" :controls="false" :min="null"
                @input="updateSearchStatus()" 
                v-model="selectedAssessmentMax">
              </b-numberinput>
              <b-button @click="clearNumberFilter()" type="is-ghost" size="is-small">Clear filter</b-button>
            </b-field>
          </div>

        </b-collapse>
      </div>

      <div class="buttons is-flex is-justify-content-center">
        <b-tooltip :active="!canSearch&&!invalidRange" position="is-top" type="is-danger is-light"
          label="Insert an assessment text longer than 20 characters or select advanced filtering">
        <b-tooltip :active="invalidRange" position="is-top" type="is-danger is-light"
          label="Invalid Range Filter: maximum value should be greater than minimum">
          <b-button 
            type="is-primary is-large"
            :disabled="!canSearch"
            @click="search()">
            Search ID &nbsp; <b-icon v-if="updateSearch" icon="update" size="is-small"></b-icon>
          </b-button>
        </b-tooltip>
        </b-tooltip>
      </div>
    </section>

    <section id="list-assessors" class="box list-assessors" v-if="hasSearch">
      <div class="subtitle" v-if="filteredAssessors.length === 0">
        There is no PA-ID identified for this search configuration.
      </div>
      <div v-else>
        <p class="search-result-info"><small>There are {{filteredAssessors.length}} assessors identified for this search</small></p>
        <div class="list content">
          <b-pagination
            :total="filteredAssessors.length"
            :current.sync="currentPage"
            :per-page="resultsPerPage"
            :range-after="2"
            @change="changePage()"
          >
          </b-pagination>
          <assessor-preview
            :key="assessor"
            v-for="assessor in paginatedAssessors"
            :funds="funds"
            :assessorId="assessor"
            :assessments="getFilteredAssessments(assessor)"
            :filterSelection="filterSelection"        
          />
          <b-pagination
            :total="filteredAssessors.length"
            :current.sync="currentPage"
            :per-page="resultsPerPage"
            :range-after="2"
            @change="changePage()"
          >
          </b-pagination>
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
import $ from "jquery";

export default {
  name: 'Finder',
  components: {
    AssessorPreview
  },
  data() {
    return {
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
        // 'f5': {
        //   id: 'f5',
        //   title: "Fund 5",
        //   assessments: [],
        //   challenges: [],
        //   proposals: []
        // },
        // 'f4': {
        //   id: 'f4',
        //   title: "Fund 4",
        //   assessments: [],
        //   challenges: [],
        //   proposals: []
        // }
      },
      currentPage: 1,
      resultsPerPage: 7,
      filteredAssessors: [],
      filteredAssessments: [],
      hasSearch: false,
      updateSearch: false,
      minSlice: 20,
      assessmentSlice: '',
      advancedFilters: false,
      selectedFund: {
        id: 'empty',
        title: '-- Select a Fund --'
      },
      dropdownChallenges: [],
      selectedChallenges: [],
      dropdownProposals: [],
      selectedProposals: [],
      selectedAssessmentMin: null,
      selectedAssessmentMax: null,
      filterSelection: {
        selectedFund: {},
        selectedChallenges: [],
        selectedProposals: [],
        selectedRange: [],
        textSlice: ''
      }
    }
  },
  computed: {
    dropdownFunds() {
      return [
        {
          id: 'empty',
          title: '-- Select a Fund --'
        }].concat(this.fundsKeys.map(fId => ({...this.funds[fId]})))
    },
    hasFund() {
      return (this.selectedFund.id==='empty')
      ? false
      : true
    },
    hasTextSlice() {
      return this.assessmentSlice.length >= this.minSlice
    },
    hasAdvancedFiltering() {
      return (this.selectedChallenges.length > 0) || (this.selectedProposals.length > 0) || (typeof(this.selectedAssessmentMin) === 'number') || (typeof(this.selectedAssessmentMax) === 'number')
    },
    hasNumberRange() {
      return (typeof(this.selectedAssessmentMin) === "number" || typeof(this.selectedAssessmentMax) === "number" )
    },
    invalidRange() {
      if(typeof(this.selectedAssessmentMin) === "number" && typeof(this.selectedAssessmentMax) === "number" ) {
        return (this.selectedAssessmentMin >= this.selectedAssessmentMax)
      }
      return false
    },
    canSearch() {
      return this.hasFund && (this.hasTextSlice || this.hasAdvancedFiltering) && !this.invalidRange
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
        let text = val.trim()
        this.setValue('assessmentText', text)
      }, 500)
    },
    fundChallenges(){
      return (this.hasFund)
      ? this.selectedFund.challenges
      : []
    },
    fundAssessors() {
      return [...new Set(this.selectedFund.assessments.map(ass=>ass.idAssessor))]
    },
    fundAssessments() {
      return this.selectedFund.assessments
    },
    filteredProposals(){
      if(this.hasFund){
        return ( this.selectedChallenges.length > 0 )
        ? this.selectedFund.proposals.filter( (p) => this.selectedChallenges.map(ch=>ch.id).includes(p.challengeId) ) 
        : this.selectedFund.proposals
      }
      return []
    },
    paginatedAssessors() {
      let page_number = this.currentPage-1
      return this.filteredAssessors.slice(page_number * this.resultsPerPage, (page_number + 1) * this.resultsPerPage);      
    }
  },
  methods: {
    getFilteredAssessments(assessorId) {
      return this.filteredAssessments.filter(ass => ass.idAssessor===assessorId)
    },
    search() {
      this.setFilteredAssessors()
      this.setFilterSelection();
      this.hasSearch = true;
      this.updateSearch = false;
    },
    setFilteredAssessors() {
      let filter = {
        ids: this.fundAssessors,
        assessments: this.fundAssessments
      }
      if(this.selectedChallenges.length > 0) { 
        filter = this.filterByChallenge(filter.ids, filter.assessments)
      }
      if(this.selectedProposals.length > 0) {
        filter = this.filterByProposal(filter.ids, filter.assessments)
      }
      if(this.hasNumberRange) {
        filter = this.filterAssessorsByRange(filter.ids, filter.assessments)
      }
      if(this.hasTextSlice) {
        filter = this.filterByText(filter.ids, filter.assessments, this.assessmentSlice)
      }    
      this.filteredAssessors = filter.ids;
      this.filteredAssessments = filter.assessments;
    },
    filterByText(ids, assessments, text) {
        let textAssessments = assessments.filter( (ass) => {
          if( ids.includes(ass.idAssessor) ) {
            let reviews = [ass.assessmentNoteAuditability, ass.assessmentNoteFeasibility, ass.assessmentNoteImpact];
            return reviews.join('; ').includes(text)
          }
          else { false }
        })
      return {
          ids: [...new Set(textAssessments.map(ass=>ass.idAssessor))],
          assessments: textAssessments
        }
    },
    filterByChallenge(ids, assessments) {
      let checker = arr => arr.every(v => v === true);
      let sChallenges = this.selectedChallenges.map(ch => ({
          id: ch.id,
          assessments: assessments.filter( (ass) => ass.challengeId===ch.id )
        }
      ))
      let filteredIds = [];
      let filteredAssessments = [];
      ids.forEach( (assessorId) => {
        let chHasAssessor = sChallenges.map( ch => ch.assessments.filter(ass => ass.idAssessor===assessorId).length > 0 )
        if( checker(chHasAssessor) ){   // verify if assessorId has assessments in all selected Challenges
          filteredIds.push(assessorId)
          filteredAssessments = filteredAssessments.concat( sChallenges.map( ch => ch.assessments.filter(ass => ass.idAssessor===assessorId) ).flat() )
        }
      })
      return {
          ids: filteredIds,
          assessments: filteredAssessments.flat()
        }

    },
    filterByProposal(ids, assessments) {
      let checker = arr => arr.every(v => v === true);
      let sProposals = this.selectedProposals.map(p => ({
        id: p.id,
        assessments: assessments.filter( (ass) => ass.proposalId===p.id )
      }))
      let pChallenges = [...new Set( this.selectedProposals.map(p=>p.challengeId) )]
      let filteredIds = [];
      let filteredAssessments = [];
      ids.forEach( (assessorId) => {
        let pHasAssessor = sProposals.map( p => p.assessments.filter(ass => ass.idAssessor===assessorId).length > 0 )
        if( checker(pHasAssessor) ){    // verify if assessorId has assessments in all selected Proposals
          filteredIds.push(assessorId)
          let assessorSelection = assessments.filter(ass => ass.idAssessor===assessorId);
          if (this.selectedChallenges.length > 0 ) {
            this.selectedChallenges.forEach( (ch) => {
                ( pChallenges.includes(ch.id) )
                ? filteredAssessments = filteredAssessments.concat( sProposals.map( p => p.assessments.filter(ass => ass.idAssessor===assessorId && ass.challengeId===ch.id).flat() ))
                : filteredAssessments = filteredAssessments.concat( assessorSelection.filter( ass => ass.challengeId===ch.id ) )
            })
          } 
          else {
            filteredAssessments = filteredAssessments.concat( sProposals.map( p => p.assessments.filter(ass => ass.idAssessor===assessorId).flat() ))
          }
        }
      })
      return {
          ids: filteredIds,
          assessments: filteredAssessments.flat()
        }
    },
    filterAssessorsByRange(ids, assessments) {
      let freqIds = this.selectedFund.assessments.map( (ass) => ass.idAssessor )
      let occurrences = freqIds.reduce(function (acc, curr) {
        return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
      }, {}); 

      let filteredIds = [];
      if( typeof(this.selectedAssessmentMax)!=="number" ) {
        filteredIds = ids.filter( (assessorId) => occurrences[assessorId] >= this.selectedAssessmentMin); 
      }
      else if( typeof(this.selectedAssessmentMin)!=="number" ) {
        filteredIds = ids.filter( (assessorId) => occurrences[assessorId] <= this.selectedAssessmentMax); 
      }
      else {
        filteredIds = ids.filter( (assessorId) => 
          occurrences[assessorId] >= this.selectedAssessmentMin && occurrences[assessorId] <= this.selectedAssessmentMax
        );
      }
      return {
        ids: filteredIds,
        assessments: assessments.filter( ass => filteredIds.includes(ass.idAssessor) )
      }
    },
    setFilterSelection() {
      this.filterSelection = {
        selectedFund: this.selectedFund,
        selectedChallenges: this.selectedChallenges,
        selectedProposals: this.selectedProposals,
        selectedRange: [this.selectedAssessmentMin, this.selectedAssessmentMax],
        textSlice: (this.hasTextSlice) ? this.assessmentSlice : ''
      }
    },
    resetFilters() {
      this.filteredAssessors = [];
      this.filteredAssessments = [];
      this.hasSearch = false;
      this.updateSearch = false;
      this.assessmentSlice = '';
      this.selectedChallenges = [];
      this.selectedProposals = [];
      this.selectedAssessmentMin = null;
      this.selectedAssessmentMax = null;
      this.filterSelection = {
        selectedFund: {},
        selectedChallenges: [],
        selectedProposals: [],
        selectedRange: [],
        textSlice: ''
      }
    },
    updateFundFilters(){
      this.loadDropdownChallenges();    // populate Challenges filter
      this.loadDropdownProposals();     // populate Proposals filter
      // this.updateSearchStatus();
      this.resetFilters();
    },
    updateChallengeFilters(){
      this.updateSelectedProposals()
      this.loadDropdownProposals()     // populate Proposals filter
      this.updateSearchStatus()
    },
    updateSearchStatus() {
      (this.hasSearch) ? this.updateSearch=true : this.updateSearch=false
    },
    updateSelectedProposals() {
      this.selectedProposals = this.selectedProposals.filter( p => this.selectedChallenges.filter(ch=>ch.fundId===p.fundId).map(ch=>ch.id).includes(p.challengeId) )
    },
    loadDropdownChallenges(text) {
      let dropdown;
      if (text) {
        dropdown = this.fundChallenges.filter((option) => {
          return option.title
            .toString()
            .toLowerCase()
            .indexOf(text.toLowerCase()) >= 0
        })
      } else {
        dropdown = this.fundChallenges
      }
      this.dropdownChallenges = dropdown.filter((option) => {
        return this.selectedChallenges.indexOf(option) === -1
      })
    },
    loadDropdownProposals(text) {
      let dropdown;
      if (text) {
        dropdown = this.filteredProposals.filter((option) => {
          return option.title
            .toString()
            .toLowerCase()
            .indexOf(text.toLowerCase()) >= 0
        })
      } else {
        dropdown = this.filteredProposals
      }
      this.dropdownProposals = dropdown.filter((option) => {
        return this.selectedProposals.indexOf(option) === -1
      })
    },
    clearChallengeFilter() {
      this.selectedChallenges = [];
      this.updateSearchStatus()
    },
    clearProposalFilter() {
      this.selectedProposals = [];
      this.updateSearchStatus()
    },
    clearNumberFilter() {
      this.selectedAssessmentMin = null;
      this.selectedAssessmentMax = null;
      this.updateSearchStatus()
    },
    changePage() {
      $([document.documentElement, document.body]).animate({
          scrollTop: $("#list-assessors").offset().top
      }, 1000);
    },
    setValue(field, val) {
      if(field === 'assessmentText'){ this.assessmentSlice = val }
    }
  },
  mounted() {
    const loadingComponent = this.$buefy.loading.open({})
    this.fundsKeys.forEach((f) => {
      CatalystAPI.assessments(f).then((r) => {
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
    loadingComponent.close()
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
.search-result-info {
  margin-bottom: 1em;
}
.tags {
  .tag:not(.is-light) {
    cursor: pointer;
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
.clear-btn {
  padding-top: 2.5em !important;
}
ul {
  margin-top: 0.1em !important;
  margin-bottom: 1em !important;
}
</style>

