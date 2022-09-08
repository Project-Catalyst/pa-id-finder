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
          detail-key="id"
          @details-open="(row, index) => $buefy.toast.open(`Expanded ${row.proposal}`)"
          :show-detail-icon="true">

          <b-table-column field="id" label="ID" v-slot="props">
            <b>{{ props.row.id }}</b>
          </b-table-column>

          <b-table-column field="proposal" label="Proposal title" v-slot="props">
            <b>{{ props.row.proposal }}</b>
          </b-table-column>

          <b-table-column field="count" label="#" numeric centered v-slot="props">
            <b>{{ props.row.count }}</b>
          </b-table-column>

          <b-table-column field="challenge" label="Challenge Setting" centered v-slot="props">
            <b>{{ props.row.challenge }}</b>
          </b-table-column>

          <b-table-column field="assessment" label="See assessment" centered v-slot="props">
            <b>{{ props.row.assessment }}</b>
          </b-table-column>

          <template slot="detail" slot-scope="props">
            <tr v-for="item in props.row.items" :key="item.id">
              <td></td>
              <td class="has-text-centered">{{ item.id }}</td>
              <td><a @click="goToProposal(item)">{{ item.proposal }}</a></td>
              <td class="has-text-centered">{{ item.count }}</td>
              <td class="has-text-centered">{{ item.challenge }}</td>
              <td class="has-text-centered">{{item.assessment}}</td>
            </tr>
          </template>
        </b-table>

      </div>
    </div>
  </div>
</template>

<script>

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
        count: '',
        challenge: '',
        assessment: 'open'
        // items: []
      };
      data.push(this.getFundData(this.filterSelection.fundId, template))
      return data
    },
  },
  methods: {
    getFundData(fId, templateData) {
      /*
      templateData = {
            id: '',
            proposal: '',
            count: '',
            challenge: '',
            assessment: 'open'
            items: [] // [... assessmentData]
          }
      */
      const data = {...templateData};
      let fundAssessments = this.assessments.filter( (ass) => ass.fundId === fId );
      // id
      data.id = '';
      // proposal
      data.proposal = this.funds[fId].title.concat(" ", "assessed proposals");
      // count
      data.count = fundAssessments.length;
      // challenge
      data.challenge = fId.toUpperCase().concat(' challenges');
      // assessment
      data.assessment = '';
      // items
      data.items = fundAssessments.map( (ass) => this.getAssessmentData(ass, templateData) );
      data.items.sort(this.sortAssessmentsByChallenge);
      return data
    },
    getAssessmentData (assessment, templateData) {
      /*
      templateData = {
            id: '',
            proposal: '',
            count: '',
            challenge: '',
            assessment: 'open'
            // items: []
          }
      */
      const data = {...templateData};
      data.id = assessment.idAssessment;
      data.proposal = assessment.proposalTitle;
      data.count = '';
      data.challenge = assessment.challengeTitle.split(": ").pop();
      data.assessment = 'open';
      data.url = assessment.proposalUrl;
      return data
    },
    goToProposal(item) {
      window.open(item.url, '_blank');
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
