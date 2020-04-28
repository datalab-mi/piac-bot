<script>
  //import { onMount } from 'svelte';
  //import lunr from 'lunr';
  //import lunrstemmer from 'lunr-languages/lunr.stemmer.support';
  //import lunrfr from 'lunr-languages/lunr.fr';

  //lunrstemmer(lunr)
  //lunrfr(lunr)

  //let data
	//let searchTerm = "";
  //let results
  //let filteredResults
  //let lunrIdx

  //const contractionRemover = function (builder) {

  //  const RemoveApp = function (token) {
  //    return token.replace(/(l')$/, "")
  //  }

  //  lunr.Pipeline.registerFunction(lunr.stopWordFilter, 'contractionTrimmer')

  //  var englishContractions = function (idx) {
  //    //builder.pipeline.after(lunr.trimmer, lunr.contractionTrimmer)
  //    builder.pipeline.before(this.pipeline._stack[0], lunr.contractionTrimmer)
  //  }
  //}

  //onMount(async() => {
  //  const res = await fetch('faq-saisis.json')
  //  data = await res.json()
  //  console.log(data);

  //  lunrIdx = lunr(function () {
  //    this.use(lunr.fr)
  //    this.use(contractionRemover)
  //    this.ref('id')
  //    this.field('question')
  //    this.field('response')
  //    //this.field('responseGN')

  //    data.forEach((doc, idx) => {
  //      doc.id = idx
  //      this.add(doc)
  //    }, this)
  //  })

  //})

  //const handleSearch = () => {
  //  if (searchTerm) {
  //    results = lunrIdx.search(searchTerm)
  //    filteredResults = results.map(item => {
  //      console.log(item);
  //      return data[item.ref]
  //    })
  //  } else {
  //    results = []
  //  }
  //}

  //function updateSearch() {
  //  if (searchTerm) {
  //    results = data.filter(item => item.body.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)
  //    filteredResults = results.map(item => {
  //      let positionArray = []
  //      let position = item.body.toLowerCase().indexOf(searchTerm.toLowerCase())
  //      while (position !== -1) {
  //        positionArray.push(position)
  //        position = item.body.toLowerCase().indexOf(searchTerm.toLowerCase(), position + 1)
  //      }
  //      item.positions = positionArray
  //      return item
  //    })
  //  } else {
  //    results = []
  //  }
  //}

  //function getExtract(body, position) {
  //  const len = 180
  //  let min = (position - 180) < 0 ? 0 : (position - 180)
  //  let max = (position + 180) > body.length ? body.length : (position + 180)
  //  return body.substring(min, max)
  //}
	import Chatbot from './tools/chatbotEngine';
	import { beforeUpdate, afterUpdate } from 'svelte';

	let div;
	let autoscroll;

	beforeUpdate(() => {
		autoscroll = div && (div.offsetHeight + div.scrollTop) > (div.scrollHeight - 20);
	});

	afterUpdate(() => {
		if (autoscroll) div.scrollTo(0, div.scrollHeight)
	});

	const chatbot = new Chatbot();

	let comments = [
		{ auth: 'chatbot', text: chatbot.getInitial() }
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

			const reply = chatbot.transform(text);

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
	<h1 class="title">Talk to me baby</h1>

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
