<template>
  <div class="card mb-4">
    <div class="card-content">
      <div class="content">

        <div class="media">
          <div class="media-left">
              <b-icon icon="account-details" size="is-medium"></b-icon>
          </div>
          <div class="media-content">
            <h2 class="title">{{assessorId}}</h2>
          </div>
        </div>
        <h4> {{assessments.length}} <em>assessments</em> identified for this search:</h4>
        <b-table
          :data="tableData"
          ref="table"
          detailed
          hoverable
          custom-detail-row
          detail-key="proposal"
          @details-open="(row, index) => $buefy.toast.open(`Expanded ${row.proposal}`)"
          :show-detail-icon="true">
          
          <b-table-column field="proposal" label="Assessed Proposal" v-slot="props">
            <b>{{ props.row.proposal }}</b>
          </b-table-column>

          <b-table-column field="id" label="Assessment ID" cellClass="has-text-centered" v-slot="props">
            <b>{{ props.row.id }}<b-icon icon="email-open-outline"></b-icon></b>
          </b-table-column>

          <template slot="detail" slot-scope="props">
            <tr v-for="item in props.row.items" :key="item.id">
              <td></td>
              <td><a @click="goToProposal(item)">{{ item.proposal }}</a></td>
              <td class="has-text-centered"><a @click="goToAssessment(item)">#{{item.id}}</a></td>
            </tr>
          </template>
        </b-table>

      </div>
    </div>
  </div>
</template>

<script>
import AssessmentModal from '@/components/AssessmentModal.vue'

export default {
  name: 'AssessorPreview',
  props: ['funds', 'assessorId', 'assessments', 'filterSelection'],
  data() {
    return {
      filteredAssessments: []
    }
  },
  computed: {
    fundsText() {
      return this.funds.map(f => f.title)
    },
    tableData() {
      const data =[];
      let template = {
        id: '',
        proposal: '',
        challenge: '',
        // items: []
      };
      this.filterSelection.selectedChallenges.forEach( (ch) => data.push(this.getChallengeData(ch, template)) )
      return data
    },
  },
  methods: {
    getChallengeData(challenge, templateData) { 
      /* templateData = {
          id: '',
          proposal: '',
          items: [] // [... assessmentData]
        }
      */
      const data = {...templateData};
      let chAssessments = this.assessments.filter( (ass) => ass.challengeId === challenge.id );
      // id
      data.id = '';
      // proposal
      data.proposal = 'Challenge: '.concat(challenge.title.split(": ").pop().concat(' (# ', chAssessments.length, ')'));
      // items
      data.items = chAssessments.map( (ass) => this.getAssessmentData(ass, templateData) );
      data.items.sort(this.sortAssessmentsByChallenge);
      return data
    },
    getAssessmentData (assessment, templateData) {
      /* templateData = {
          id: '',
          proposal: '',
        }
      */
      const data = {...templateData};
      data.id = assessment.idAssessment;
      data.proposal = assessment.proposalTitle;
      data.challenge = '';
      data.url = assessment.proposalUrl;
      return data
    },
    goToProposal(item) {
      window.open(item.url, '_blank');
    },
    goToAssessment(item) {
      this.$buefy.modal.open({
        component: AssessmentModal,
        parent: this,
        props: {
          "assessment": this.assessments.filter(ass=>ass.idAssessment===item.id)[0],
        },
        trapFocus: true
      })
    },
    sortAssessmentsByChallenge(a, b) {
      return a.challenge.localeCompare(b.challenge)
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
