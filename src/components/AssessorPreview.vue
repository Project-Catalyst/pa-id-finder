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
            <h4 class="subtitle"> {{totalNumberOfAssessments}} total assessments on {{fund.title}}</h4>
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

          <b-table-column field="id" label="Assessment ID" v-slot="props">
            <b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {{ props.row.id }}<b-icon icon="email-open-outline"></b-icon></b>
          </b-table-column>

          <template slot="detail" slot-scope="props">
            <tr v-for="item in props.row.items" :key="item.id">
              <td></td>
              <td><a @click="goToProposal(item)">{{ item.proposal }}</a></td>
              <td><a @click="goToAssessment(item)">
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                #{{item.id}}
              </a></td>
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
  props: ['assessorId', 'assessments', 'filterSelection'],
  data() {
    return {
    }
  },
  computed: {
    fund() {
      return this.filterSelection.selectedFund
    },
    totalNumberOfAssessments() {
      let allAssessments = this.filterSelection.selectedFund.assessments.filter(ass=>ass.idAssessor===this.assessorId);
      return allAssessments.length
    },
    tableData() {
      const data =[];
      let template = {
        id: '',
        proposal: '',
        challenge: '',
        // items: []
      };
      let challenges = []
      if( this.filterSelection.selectedChallenges.length === 0 ){
        let chIds = [...new Set(this.assessments.map(ass=>ass.challengeId))]
        challenges = chIds.map(chId => this.getChallenge(chId))
      }
      else { challenges = this.filterSelection.selectedChallenges }

      challenges.forEach( (ch) => data.push(this.getChallengeData(ch, template)) )
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
      data.challenge = assessment.challengeTitle;
      data.url = assessment.proposalUrl;
      return data
    },
    getChallenge(id){
      return this.filterSelection.selectedFund.challenges.filter(ch=>ch.id===id)[0]
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
