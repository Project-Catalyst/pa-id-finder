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

    <div class="box fund-assessments" :key="fund.id" v-for="fund in assessedFunds">
      <h3> {{fund.title}} assessments</h3>
      <p>There are {{fund.assessments.length}} assessments for this fund.</p>
      <b-collapse
          class="card assessment"
          animation="slide"
          v-for="(assessment, index) of fund.assessments"
          :key="index"
          :open="false">
          <template #trigger="props">
            <div class="card-header" role="button">
              <p class="card-header-title">
                ASSESSMENT #{{ assessment.idAssessment }}
                <br>Challenge: {{assessment.challengeTitle.split(": ").pop()}}
                <br>Proposal: {{assessment.proposalTitle}}
              </p>
              <a class="card-header-icon"><b-icon :icon="props.open ? 'menu-up' : 'menu-down'"></b-icon></a>
            </div>
          </template>
          <div class="card-content">
            <div class="content columns is-multiline">
              <div class="column is-10">
                <p><b>Auditability Note</b>
                <br><small>{{ assessment.assessmentNoteAuditability }}</small></p>
              </div>
              <div class="column is-narrow">
                <b-rate size="is-small" v-model="assessment.assessmentRatingAuditability" disabled />
              </div>
              <div class="column is-10">
                <p><b>Feasibility Note</b>
                <br><small>{{ assessment.assessmentNoteFeasibility }}</small></p>
              </div>
              <div class="column is-narrow">
                <b-rate size="is-small" v-model="assessment.assessmentRatingFeasibility" disabled />
              </div>
              <div class="column is-10">
                <p><b>Impact Note</b>
                <br><small>{{ assessment.assessmentNoteImpact }}</small></p>
              </div>
              <div class="column is-narrow">
                <b-rate size="is-small" v-model="assessment.assessmentRatingImpact" disabled />
              </div>
            </div>
          </div>
      </b-collapse>
      <!-- <div class="list content" :key="assessment.idAssessment" v-for="assessment in fund.assessments">
        <assessment-full
          :assessment="assessment"    
        />
      </div> -->
    </div>

    <!-- <section class="other-list">
      <a @click="openFunds">Console log Funds</a>
    </section> -->
  </div>
</template>

<script>
// @ is an alias to /src
import AssessmentFull from '@/components/AssessmentFull';
import CatalystAPI from '@/api/catalyst.js';

export default {
  name: 'Assessor',
  components: {
    AssessmentFull,
  },
  data() {
    return {
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