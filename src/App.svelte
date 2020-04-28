<script>
  import { onMount } from 'svelte';
  import lunr from 'lunr';
  import lunrstemmer from 'lunr-languages/lunr.stemmer.support';
  import lunrfr from 'lunr-languages/lunr.fr';

  lunrstemmer(lunr)
  lunrfr(lunr)

  let data
	let searchTerm = "";
  let results
  let filteredResults
  let lunrIdx

  const contractionRemover = function (builder) {

    const RemoveApp = function (token) {
      return token.replace(/(l')$/, "")
    }

    lunr.Pipeline.registerFunction(lunr.stopWordFilter, 'contractionTrimmer')

    var englishContractions = function (idx) {
      //builder.pipeline.after(lunr.trimmer, lunr.contractionTrimmer)
      builder.pipeline.before(this.pipeline._stack[0], lunr.contractionTrimmer)
    }
  }

  onMount(async() => {
    const res = await fetch('faq-saisis.json')
    data = await res.json()
    console.log(data);

    lunrIdx = lunr(function () {
      this.use(lunr.fr)
      this.use(contractionRemover)
      this.ref('id')
      this.field('question')
      this.field('response')
      //this.field('responseGN')

      data.forEach((doc, idx) => {
        doc.id = idx
        this.add(doc)
      }, this)
    })

  })

  const handleSearch = () => {
    if (searchTerm) {
      results = lunrIdx.search(searchTerm)
      filteredResults = results.map(item => {
        console.log(item);
        return data[item.ref]
      })
    } else {
      results = []
    }
  }

  function updateSearch() {
    if (searchTerm) {
      results = data.filter(item => item.body.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)
      filteredResults = results.map(item => {
        let positionArray = []
        let position = item.body.toLowerCase().indexOf(searchTerm.toLowerCase())
        while (position !== -1) {
          positionArray.push(position)
          position = item.body.toLowerCase().indexOf(searchTerm.toLowerCase(), position + 1)
        }
        item.positions = positionArray
        return item
      })
    } else {
      results = []
    }
  }

  function getExtract(body, position) {
    const len = 180
    let min = (position - 180) < 0 ? 0 : (position - 180)
    let max = (position + 180) > body.length ? body.length : (position + 180)
    return body.substring(min, max)
  }
</script>

<main>
	<h1>Moteur de recherche</h1>
  <input class="input"  type="text" placeholder="ex: perquisition" bind:value={searchTerm} on:input={handleSearch}/>
  {#if filteredResults}
    {#each filteredResults as filteredResult, i}
      <h2 class="subtitle">{filteredResult.question}</h2>
      <p>
        {filteredResult.response}
      </p>
    {/each}
  {/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 2em;
		font-weight: 20;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
