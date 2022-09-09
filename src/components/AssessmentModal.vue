<template>
  <div class="card">
    <div class="card-content">
      <!-- <div class="media">
        <div class="media-content">
          <p class="subtitle is-6" v-html="$t('proposerModal.NOTE')"></p>
        </div>
      </div> -->
      <div class="content">
        <div class="media">
          <div class="media-left">
              <b-icon icon="file-document-outline" size="is-medium"></b-icon>
          </div>
          <div class="media-content">
            <h1 class="title">Assessment #{{assessment.idAssessment}}</h1>
          </div>
        </div>
        <h5>Assessor: {{assessment.idAssessor}}</h5>
        <h5>Fund: {{assessment.fundId.toUpperCase()}}</h5>
        <h5>Challenge: {{assessment.challengeTitle.split(": ").pop()}}</h5>
        <h5>Proposal: {{assessment.proposalTitle}}</h5>

        <div class="content box columns is-multiline">
          <div class="column is-10">
            <h4>Auditability Note</h4>
            <p>{{ assessment.assessmentNoteAuditability }}</p>
          </div>
          <div class="column is-narrow">
            <b-rate v-model="assessment.assessmentRatingAuditability" disabled />
          </div>
          <div class="column is-10">
            <h4>Feasibility Note</h4>
            <p>{{ assessment.assessmentNoteFeasibility }}</p>
          </div>
          <div class="column is-narrow">
            <b-rate v-model="assessment.assessmentRatingFeasibility" disabled />
          </div>
          <div class="column is-10">
            <h4>Impact Note</h4>
            <p>{{ assessment.assessmentNoteImpact }}</p>
          </div>
          <div class="column is-narrow">
            <b-rate v-model="assessment.assessmentRatingImpact" disabled />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: ['assessment'],
  data() {
    return {
    }
  },
  methods: {
  }
}
</script>

