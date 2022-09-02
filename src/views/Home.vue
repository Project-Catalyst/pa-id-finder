<template>
  <div class="home">
    <section class="box">
      <div class="columns is-multiline">
        <div class="column is-12">
          <div class="title">{{$t('general.TITLE')}}</div>
          <div class="subtitle" v-html="$t('general.SUBTITLE')"></div>
        </div>
        <div class="column is-12">
          <div class="content" v-html="$t('general.EXPLANATION')"></div>
        </div>
      </div>
      <div class="buttons is-flex is-justify-content-center">
        <b-button tag="router-link"
          :to="{ name: 'finder'}" type="is-primary is-large">
          Open {{ $t('general.FINDER') }}
        </b-button>
      </div>
    </section>
    <!-- <b-button
      tag="a"
      @click="open = !open"
      type="is-primary is-light" outlined>
      {{openMsg}}
    </b-button>
    <section class="box list-problems" v-if="open">
      <div class="title">My Sensed Problems</div>
      <div class="subtitle" v-if="sensedProblems.length === 0">
        You haven't created any Sensed Problem yet. Let's try your first!
      </div>
      <div class="list content">
        <sensed-preview
          :key="sensed.id"
          v-for="sensed in sensedProblems"
          :sensed="sensed"
        />
      </div>
      <div class="content">
        <b-message class="buttons" v-if="sensedProblems.length > 0">
          <b-button 
            icon-left="download" 
            type="is-primary is-light" 
            @click="exportSensed">
            Export assessments
          </b-button>
          <b-button
            icon-left="delete" type="is-danger is-light"
            @click="confirmClear">
            Clear local database
          </b-button>
        </b-message>
      </div>
    </section> -->
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  components: {
    // HelloWorld
  }
}
</script>
