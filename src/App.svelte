<script>
  import { loadData, loadCountries } from './tools/searchTools';
	import { beforeUpdate, afterUpdate, onMount } from 'svelte';
  import lunr from 'lunr';
  import lunrstemmer from 'lunr-languages/lunr.stemmer.support';
  import lunrfr from 'lunr-languages/lunr.fr';

  lunrstemmer(lunr)
  lunrfr(lunr)

	let div;
  let data;
  let countries;
	let autoscroll;
  let lunrIdx;
  let countriesIdx;
  let etat = {};

  const normaliseSpelling = function (builder) {
    // Define a pipeline function that remove accents
    var pipelineFunction = function (token) {
      return token
        .replace('á', 'a')
        .replace('é', 'e')
        .replace('í', 'i')
        .replace('ó', 'o')
        .replace('ú', 'u')
        .replace('Á', 'A')
        .replace('É', 'E')
        .replace('Í', 'I')
        .replace('Ó', 'O')
        .replace('Ú', 'U');
    }

    // Register the pipeline function so the index can be serialised
    lunr.Pipeline.registerFunction(pipelineFunction, 'normaliseSpelling')

    // Add the pipeline function to both the indexing pipeline and the
    // searching pipeline
    builder.pipeline.before(lunr.stemmer, pipelineFunction)
    builder.searchPipeline.before(lunr.stemmer, pipelineFunction)
  }

  onMount(async () => {
    data = await loadData()
    countries = await loadCountries()
    countriesIdx = lunr(function () {
      this.use(lunr.fr)
      this.ref('id')
      this.field('country')

      countries.forEach((doc, idx) => {
        doc.id = idx
        this.add(doc)
      }, this)
    })
    lunrIdx = lunr(function () {
      console.log(`loaded ${data.length}`);
      this.use(normaliseSpelling)
      this.use(lunr.fr)
      this.ref('id')
      this.field('question', {boost: 10})
      this.field('response')
      //this.field('responseGN')

      data.forEach((doc, idx) => {
        doc.id = idx
        this.add(doc)
      }, this)
    })
  })

	beforeUpdate(() => {
		autoscroll = div && (div.offsetHeight + div.scrollTop) > (div.scrollHeight - 20);
	});

	afterUpdate(() => {
		if (autoscroll) div.scrollTo(0, div.scrollHeight)
	});

	let comments = [
		{ auth: 'chatbot', text: 'Bonjour,' },
		{ auth: 'chatbot', text: 'Je suis PIAC Bot' },
		{ auth: 'chatbot', text: 'Quelle est votre question ?' }
	];

  function handleSubmit(event) {
    if (event.which === 13) {
      event.preventDefault();
      const text = event.target.value;
      if (!text) return;

      comments = comments.concat({
        author: 'user',
        text
      });

      event.target.value = '';

      const cleanText = text.replace('l\'','')

      const goodbyeRegex = /(merci|bye|chao|au revoir)/gi
      const renseignementsRegex = /(renseignements|informations patrimoniales)/gim

      if (cleanText.match(renseignementsRegex) && (cleanText.match(renseignementsRegex).length > 0)) {
        const foundCountry = countriesIdx.search(`${cleanText}~1`).
          map(item => {
            return countries[item.ref]
          }).pop()
        if (foundCountry) {
          handleAnswer(`Par rapport à ${foundCountry.country}`)
          console.log(foundCountry);
          const hideMotifs = ['date', 'country', 'id']
          Object.values(foundCountry).forEach((motif, idx) => {
            console.log(motif, (motif != null), (hideMotifs.indexOf(Object.keys(foundCountry)[idx]) > -1))
            if ((motif != null) && (hideMotifs.indexOf(Object.keys(foundCountry)[idx]) === -1)) handleAnswer(`${Object.keys(foundCountry)[idx]}: ${motif}`)
          })
        } else {
          handleAnswer(`Vous cherchez de renseignements pour quel pays ?`)
        }
      } else if (cleanText.match(goodbyeRegex) && (cleanText.match(goodbyeRegex).length > 0)) {
        handleAnswer(`Merci, au revoir`)
      } else if (etat.results && etat.results.length > 0) {
        const regex = /[0-9]+/g;
        const found = cleanText.match(regex);
        console.log(found[0]);
        console.log(parseInt(found[0]));
        const indexResult = parseInt(found[0] - 1)
        console.log(indexResult);
        console.log(etat.results)
        console.log(data[indexResult])
        handleAnswer(`${data[indexResult].response}`)
        handleAnswer(`Voici plus de précision sur le sujet`)
        delete etat.results
      } else {
        etat.results = handleSearch(cleanText)
        if (etat.results.length > 0 ) {
          handleAnswer(`J'ai trouvé les résultats suivants`)
          etat.results.forEach(result => {
            setTimeout(() => { 
              handleAnswer(result.question); 
              setTimeout(() => { 
              }, 1000)
            }, 1000)
          })
          handleAnswer('Quel question vous voulez en savoir plus?'); 
        } else {
          handleAnswer(`Je n'ai pas trouvé de résultats`)
        }
      }
    }
  }

  const handleSearch = (searchTerm) => {
    if (searchTerm) {
      const results = lunrIdx.search(searchTerm)
      const filteredResults = results
        .filter(item => item.score > 0.9)
        .map(item => {
          console.log(item);
          return data[item.ref]
        })
      return filteredResults
    } else {
      return []
    }
  }

  const handleAnswer = (reply) => {
    setTimeout(() => {
      comments = comments.concat({
        author: 'otheruser',
        text: '...',
        placeholder: true
      });

      setTimeout(() => {
        comments = comments.filter(comment => !comment.placeholder).concat({
          author: 'otheruser',
          text: reply
        });
      }, 500 + Math.random() * 500);
    }, 200 + Math.random() * 200);
  }

</script>

<style>
	.chat {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.title {
		text-align: center;
		padding: 10px 0;
		color: var(--title-color);
		border-bottom: 1px solid var(--title-border-color);
		font-family: var(--font-highlight);
		font-size: 1.4em;
	}

	.scrollable {
		flex: 1 1 auto;
		overflow-y: auto;
		padding: 1em;
		background-color: var(--bg-scrollable);
	}

	article {
		margin: 0.5em 0;
	}

	.user {
		text-align: right;
	}

	span {
		padding: 0.5em 1em;
		display: inline-block;
	}

	.otheruser span {
		background-color: var(--color-conversation-otheruser);
		color: var(--color-conversation-otheruser-contrast);
		border-radius: 1em 1em 1em 0;
	}

	.user span {
		background-color: var(--color-conversation-user);
		color: var(--color-conversation-user-contrast);
		border-radius: 1em 1em 0 1em;
	}

	.form {
		padding: 0.6em 1em 0.2em 1em;
		display: flex;
		box-shadow: 0 -2px 1px rgba(0, 0, 0, 0.1);
		position: relative;
	}

	.form input {
		flex: 1 1 auto;
	}
</style>

<div class="chat">
	<h1 class="title">PIAC Bot</h1>

	<div class="scrollable" bind:this={div}>
		{#each comments as comment}
			<article class={comment.author}>
				<span>{comment.text}</span>
			</article>
		{/each}
	</div>

	<div class="form">
		<input on:keydown={handleSubmit}>
	</div>
</div>
