<script>
  import { loadData } from './tools/searchTools';
	import { beforeUpdate, afterUpdate, onMount } from 'svelte';
  import lunr from 'lunr';
  import lunrstemmer from 'lunr-languages/lunr.stemmer.support';
  import lunrfr from 'lunr-languages/lunr.fr';

  lunrstemmer(lunr)
  lunrfr(lunr)

	let div;
  let data;
	let autoscroll;
  let lunrIdx;


  onMount(async () => {
    data = await loadData()
    lunrIdx = lunr(function () {
      console.log(`loaded ${data.length}`);
      this.use(lunr.fr)
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

	beforeUpdate(() => {
		autoscroll = div && (div.offsetHeight + div.scrollTop) > (div.scrollHeight - 20);
	});

	afterUpdate(() => {
		if (autoscroll) div.scrollTo(0, div.scrollHeight)
	});

	let comments = [
		{ auth: 'chatbot', text: 'hello' },
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

      const results = handleSearch(text)
      console.log(data);
      console.log(results);

      if (results.length > 0 ) {
        handleAnswer(`J'ai trouvé les resultats suivants`)
        results.forEach(result => {
          setTimeout(() => { handleAnswer(result.response); }, 300)
        })
      } else {
        handleAnswer(`Je n'ai pas trouvé de resultats`)
      }
    }
  }

  const handleSearch = (searchTerm) => {
    if (searchTerm) {
      const results = lunrIdx.search(searchTerm)
      const filteredResults = results.map(item => {
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
