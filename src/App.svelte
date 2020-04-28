<script>
  import { onMount } from 'svelte';
  let data
	let searchTerm = "";
  let results
  let filteredResults

  onMount(async() => {
    const res = await fetch('data.json')
    data = await res.json()
  })

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
  <input class="input"  type="text" placeholder="ex: perquisition" bind:value={searchTerm} on:input|preventDefault={updateSearch}/>
  {#if filteredResults}
    {#each filteredResults as filteredResult, i}
      <h2 class="subtitle">{filteredResult.titre}</h2>
      {#each filteredResult.positions as position}
        <p>
          {position} - {getExtract(filteredResult.body, position)}
        </p>
      {/each}
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
