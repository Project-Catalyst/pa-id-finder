<template>
  <div class="content" v-if="assessorId">
    <b-message type="is-warning" has-icon>
      <em>The <b>Proposal Assessor ID</b> is independent for each Fund</em>, and may or may not represent the same person accross different Funds.
      <br>For identification purposes, one should consider a specific Fund.
    </b-message>

    <div class="media">
      <div class="media-left">
          <b-icon icon="account-details" size="is-medium"></b-icon>
      </div>
      <div class="media-content">
        <h1 class="title">{{assessorId}}</h1>
      </div>
    </div>

    <section class="general-information">
      <h3> Funds assessed: {{assessedFundsInText}}</h3>
      <h3> Total assessments: {{totalAssessments}}</h3>
    </section>
          

    <div class="box fund-assessments" :key="fund.id" 
      v-for="fund in assessedFunds">
        <h3> {{fund.title}} assessments</h3>
        <p>There are {{fund.assessments.length}} assessments for this fund.</p>

        <b-table
          :data="fund.assessments"
          ref="table"
          hoverable
          detailed
          custom-detail-row
          detail-key="idAssessment"
          @details-open="(row, index) => $buefy.toast.open(`Expanded Assessment #${row.idAssessment}`)"
          :show-detail-icon="true">
          
          <b-table-column field="assessment" v-slot="props">
            <b>Assessment #{{ props.row.idAssessment }}</b>
          </b-table-column>

          <b-table-column field="challenge" v-slot="props">
            <b>Challenge:</b> {{ props.row.challengeTitle.split(": ").pop() }}
          </b-table-column>

          <b-table-column field="proposal" v-slot="props">
            <b>Proposal:</b> {{ props.row.proposalTitle }}
          </b-table-column>

          <template slot="detail" slot-scope="props">
            <tr>
              <td></td>
              <td>
                <b-rate size="is-small" v-model="props.row.assessmentRatingAuditability" disabled />
                <p><b>Auditability Note</b>
                <br><small>{{ props.row.assessmentNoteAuditability }}</small></p>
              </td>
              <td>
                <b-rate size="is-small" v-model="props.row.assessmentRatingFeasibility" disabled />
                <p><b>Feasibility Note</b>
                <br><small>{{ props.row.assessmentNoteFeasibility }}</small></p>
              </td>
              <td>
                <b-rate size="is-small" v-model="props.row.assessmentRatingImpact" disabled />
                <p><b>Impact Note</b>
                <br><small>{{ props.row.assessmentNoteImpact }}</small></p>
              </td>
            </tr>
          </template>
        </b-table>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import AssessmentFull from '@/components/AssessmentFull.vue';
import CatalystAPI from '@/api/catalyst.js';

export default {
  name: 'Assessor',
  components: {
    AssessmentFull,
  },
  data() {
    return {
      isOpen: 0,
      funds: { 
        'f9': {
          id: 'f9',
          title: "Fund 9",
          assessments: [],
          isAssessed: false
        },
        'f8': {
          id: 'f8',
          title: "Fund 8",
          assessments: [],
          isAssessed: false
        },
        'f7': {
          id: 'f7',
          title: "Fund 7",
          assessments: [],
          isAssessed: false
        },
        'f6': {
          id: 'f6',
          title: "Fund 6",
          assessments: [],
          isAssessed: false
        },
        // 'f5': {
        //   id: 'f5',
        //   title: "Fund 5",
        //   assessments: [],
        //   isAssessed: false
        // },
        // 'f4': {
        //   id: 'f4',
        //   title: "Fund 4",
        //   assessments: [],
        //   isAssessed: false
        // }
      },
    }
  },
  computed: {
    assessorId() {
      if (this.$route) {
        return this.$route.params.assessor
      }
      return false
    },
    assessedFunds() {
      return this.fundsKeys.map(fId=>this.funds[fId]).filter( (f) => f.isAssessed===true )
    },
    assessedFundsInText() {
      return this.assessedFunds.map(f=>f.title).join(', ')
    },
    totalAssessments() {
      return this.assessedFunds.map(f=>f.assessments.length).reduce((partialSum, a) => partialSum + a, 0)
    },
    fundsKeys() {
      return Object.keys(this.funds)
    },
  },
  methods: {
  },
  mounted(){  // same as Finder.vue but loads only Assessor's assessments
    const loadingComponent = this.$buefy.loading.open({})
    this.fundsKeys.forEach((f) => {
      CatalystAPI.assessments(f).then((r) => {
        // compute properties
        let assessments = r.data.filter( (ass) => ass.idAssessor===this.assessorId)
        if(assessments.length > 0) {
          // populate this.funds properties
          this.funds[f].isAssessed = true;
          this.funds[f].assessments = assessments.map( (obj) => ({...obj, fundId:f}) );
        }
      })
    })
    loadingComponent.close()
  }
}
</script>
<style lang="scss">
.general-information {
  h3{
    margin-top: 0.5em !important;
    margin-bottom: 0.5rem !important;
  }
}
.fund-assessments {
  margin-top: 1.5em !important;
}
.assessment {
  .column {
    padding-bottom: 0rem;
  }
}
.inline {
  display: flex;
  justify-content: space-between;
}
</style>