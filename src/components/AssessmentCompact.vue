<template>
  <div class="card">
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