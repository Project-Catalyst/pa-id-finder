<template>
  <div class="container" v-if="assessorId">
    <div class="hero mb-6">
      <p class="title is-6 mb-2">
          Insert something here
      </p>
      <p class="title is-3">
        {{ assessorId }}
      </p>
      <p class="subtitle is-6">
        Assessed Funds: {insert here the funds assessed}
      </p>
      <div class="box proposal-content">
        <div class="columns">
          <h1> Some information here </h1>
        </div>
      </div>
    </div>
    <section class="reviews-list">
      <h1> Some information here </h1>
    </section>
  </div>
</template>

<script>
import CatalystAPI from '@/api/catalyst.js';
import AssessmentFull from '@/components/AssessmentFull';
export default {
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
    }
  },
  components: {
    AssessmentFull,
  },
  computed: {
    assessorId() {
      if (this.$route) {
        return this.$route.params.assessor
      }
      return false
    },
    fundsKeys() {
      return Object.keys(this.funds)
    },
  },
  methods: {
  },
  mounted(){  // same as Finder.vue
    const loadingComponent = this.$buefy.loading.open({})
    this.fundsKeys.forEach((f) => {
      CatalystAPI.assessments(f).then((r) => { // change to <f>
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
    // this.funds = {...this.funds}
  },
}
</script>
<style lang="scss">
  @import 'bulma/sass/utilities/mixins';
  .proposal-content {
    @include desktop {
      position: relative;
    }
    p {
      white-space: pre-line;
    }
  }
  .my-progress {
    max-width: 450px;
  }
  .notices .notification {
    pointer-events: initial;
  }
  .inline {
    display: flex;
    justify-content: space-between;
  }
</style>