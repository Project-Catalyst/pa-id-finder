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
        <!-- <h4> assessments submitted from {{fundsText}}</h4> -->
        <!-- <h5 v-if="proposerAmountSum>0">Proposal Funding requested: {{proposerAmountSum | currency}}</h5> -->
        <!-- <h5 v-if="proposerAmountSum>0">Proposal Funding approved*: {{proposerAmountFunded | currency}}</h5> -->
        <!-- <h5 v-if="hasChallengeSetting">Challenge Funds suggested: {{proposerCsAmountSum | currency}}</h5> -->
        <!-- <h5 v-if="hasChallengeSetting">Challenge Funds approved*: {{proposerCsAmountFunded | currency}}</h5> -->
        <!-- <p><small>* Is the total funds approved by community vote. Funds are provided on conditions and therefore may not yet be fully distributed to the proposer. Funding information is not available to all Funds: check out the table below for detailed information.</small></p> -->

        <!-- <b-field label="Explore the author's proposals across funds:"></b-field> -->

        <!-- <b-table
          :data="tableData"
          ref="table"
          :loading="isLoading"
          detailed
          hoverable
          custom-detail-row
          :opened-detailed="[proposerFunds[0]]"
          detail-key="proposal"
          @details-open="(row, index) => $buefy.toast.open(`Expanded ${row.proposal}`)"
          :show-detail-icon="true">

          <b-table-column field="proposal" label="Title" v-slot="props">
            <b>{{ props.row.proposal }}</b>
          </b-table-column>

          <b-table-column field="count" label="#" numeric centered v-slot="props">
            <b>{{ props.row.count }}</b>
          </b-table-column>

          <b-table-column field="challenge" label="Challenge Setting" centered v-slot="props">
            <b>{{ props.row.challenge }}</b>
          </b-table-column>

          <b-table-column field="reviews" label="N. of reviews" numeric centered v-slot="props">
            <b>{{ props.row.reviews }}</b>
          </b-table-column>

          <b-table-column field="amount" label="Funds requested" numeric centered v-slot="props">
            <b>{{ props.row.amount | currency }}</b>
          </b-table-column>

          <b-table-column field="funded" label="Funded status" centered v-slot="props">
            <span v-if="props.row.funded === 0" style="color:#993404;">
              <b>{{ props.row.funded }}</b><b-icon icon="check-bold"></b-icon>
            </span>
            <span v-else style="color:green;">
                <b>{{ props.row.funded }}</b><b-icon icon="check-bold"></b-icon>
            </span>
          </b-table-column>

          <template slot="detail" slot-scope="props">
            <tr v-for="item in props.row.items" :key="item.id">
              <td></td>
              <td><a @click="goToProposal(item)">{{ item.proposal }}</a></td>
              <td class="has-text-centered">{{ item.count }}</td>
              <td class="has-text-centered">{{ item.challenge }}</td>
              <td class="has-text-centered">{{ item.reviews }}</td>
              <td class="has-text-centered">
                <span v-if="item.funded === 'funded'" style="color:green;">
                    {{ item.amount | currency }}
                </span>
                <span v-else>
                    {{ item.amount | currency }}
                </span>
              </td>
              <td class="has-text-centered">
                <span v-if="item.funded === fundedValue" class="tag is-success">
                  &emsp;  {{ item.funded }} &emsp;
                </span>
                <span v-else-if="item.funded === overBudValue" class="tag is-warning">
                   {{ item.funded }}
                </span>
                <span v-else class="tag is-danger">
                    {{ item.funded }}
                </span>
              </td>
            </tr>
          </template>
        </b-table> -->

      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'AssessorPreview',
  props: ['assessorId', 'funds', 'challenges', 'proposals'],
  data() {
    return {
    }
  },
  computed: {
    fundsText() {
      return this.funds.map(f => f.title)
    },
  },
  methods: {
    removeSensed() {
      this.$buefy.dialog.confirm({
        title: 'Delete Sensed Problem',
        message: `By confirming, you will permanently remove this problem 
                  from you local storage. Restoring it will not be possible.`,
        cancelText: 'Cancel',
        confirmText: 'Delete',
        type: 'is-danger',
        onConfirm: () => {
          this.$store.commit('sensed/deleteSensed', this.sensed.id);
        }
      })
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
