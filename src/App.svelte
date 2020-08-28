<script>
  import { loadData, loadCountries } from './tools/searchTools';
	import { beforeUpdate, afterUpdate, onMount } from 'svelte';
  import { nodes, links } from './__CONVERSATION__';
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


  let state = {
    position: 0,
    end: 0,
    attribution: {
      child: null,
      comment: false
    }
  }

  state.position = nodes.find(x => x.id === 'A').id
  state.childs = links.filter(x => x.from == state.position).map(x => x.to)

  console.log(state);
  console.log( state.childs.map(child => nodes.filter(x => child == x.id)))

	let comments = [
		{ auth: 'chatbot', text: 'Bonjour,' },
    { auth: 'chatbot', text: nodes.find(x => x.id === 'A').question },
    { auth: 'chatbot', options: state.childs.map(child => nodes.filter(x => child == x.id)).map(x => x[0].text) }
	];

  const handleRules = (event) => {
    if (event.target) {
      console.log("This", event.target.innerHTML);
      comments = comments.concat({
        author: 'user',
        text: event.target.innerHTML
      });
      state.position = nodes.find(x => x.text === event.target.innerHTML).id
      state.childs = links.filter(x => x.from == state.position).map(x => x.to)
      // state.position = nodes.find(x => x.id === selectId).text
      comments = comments.concat({
        author: 'chatbot',
        text: nodes.find(x => x.id === state.position).question
      });
      comments = comments.concat({
        author: 'chatbot',
        options: state.childs.map(child => nodes.filter(x => child == x.id)).map(x => x[0].text)
      });
    }
  }

  const handleSubmit = (event) => {
    if (event.which === 13) {
      event.preventDefault();
      const text = event.target.value;
      if (!text) return;

      comments = comments.concat({
        author: 'user',
        text
      });

      const cleanText = text.replace('l\'','')

      const attributionRegex = /(attribution)/gim
      if (cleanText.match(attributionRegex) && (cleanText.match(attributionRegex).length > 0)) {
        state.attribution.comment = true
      }

      handleRules(state)

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
        {#if comment.text}
          <span>{comment.text}</span>
        {/if}
        {#if comment.options}
          {#each comment.options as option}
            <span on:click={handleRules}>{option}</span>
          {/each}
        {/if}
			</article>
		{/each}
	</div>

	<div class="form">
		<input on:keydown={handleSubmit}>
	</div>
</div>
