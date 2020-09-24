<script>
  import NetworkGraph from './NetworkGraph.svelte';
	import { beforeUpdate, afterUpdate } from 'svelte';
  import { nodes, links } from './__CONVERSATION__';
  import { networkVisibility } from './stores';

	let div;
	let autoscroll;

	beforeUpdate(() => {
		autoscroll = div && (div.offsetHeight + div.scrollTop) > (div.scrollHeight - 20);
	});

	afterUpdate(() => {
		if (autoscroll) div.scrollTo(0, div.scrollHeight)
	});

  let state = {
    position: 0,
    childs: []
  }

  state.position = nodes.find(x => x.id === 'start').id
  state.childs = links.filter(x => x.source == state.position).map(x => x.target)

	let comments = [
		{ auth: 'chatbot', text: 'Bonjour,' },
    { auth: 'chatbot', text: nodes.find(x => x.id === 'start').question },
    { auth: 'chatbot', options: state.childs.map(child => nodes.filter(x => child == x.id)).map(x => {
      return {text: x[0].text, id: x[0].id}
    }) }
	];

  const handleRules = async (option, idx) => {
    if (option.id) {
      comments = comments.slice(0, idx + 1)
      comments[idx].options.forEach(option => delete option.selected)
      option.selected = true

      state.position = nodes.find(x => x.id === option.id).id
      state.childs = links.filter(x => x.source == state.position).map(x => x.target)
      await handleAnswer(nodes.find(x => x.id === state.position).question)

      if (state.childs.length > 1) {
        comments = comments.concat({
          author: 'chatbot',
          options: state.childs.map(child => nodes.filter(x => child == x.id)).map(x => {
            return {text: x[0].text, id: x[0].id}
          })
        });
      } else if (state.childs.length === 1) {
        if (state.childs[0].includes('questions-vehicule')) {
          handleRules(nodes.find(x => state.childs[0] == x.id))
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
    return new Promise((resolve, reject) => {
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
          resolve(comments)
        }, 500 + Math.random() * 500);
      }, 200 + Math.random() * 200);
    })
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

  .button {
    -moz-appearance: none;
    -webkit-appearance: none;
    align-items: center;
    border: 1px solid transparent;
    border-radius: 4px;
    box-shadow: none;
    display: inline-flex;
    font-size: 1rem;
    height: 2.5em;
    justify-content: flex-start;
    line-height: 1.5;
    padding-bottom: calc(0.5em - 1px);
    padding-left: calc(0.75em - 1px);
    padding-right: calc(0.75em - 1px);
    padding-top: calc(0.5em - 1px);
    position: relative;
    vertical-align: top;
  }

  button{
    margin: 0;
  }

  .button {
    background-color: white;
    border-color: #dbdbdb;
    border-width: 1px;
    color: #363636;
    cursor: pointer;
    justify-content: center;
    padding-bottom: calc(0.5em - 1px);
    padding-left: 1em;
    padding-right: 1em;
    padding-top: calc(0.5em - 1px);
    text-align: center;
    white-space: nowrap;
  }

  .selected {
    color: white;
    background-color: teal;
  }

  .buttons {
    align-items: left;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .buttons .button {
    margin-bottom: 0.5rem;
  }

  .buttons .button:not(:last-child):not(.is-fullwidth) {
    margin-right: 0.5rem;
  }

  .buttons:last-child {
    margin-bottom: -0.5rem;
  }

  .buttons:not(:last-child) {
    margin-bottom: 1rem;
  }

  .navbar-end {
    justify-content: flex-end;
    margin-left: auto;
  }
</style>

<NetworkGraph nodesInput={nodes} linksInput={links}/>

<div class="chat">

  <h1 class="title">PIAC Bot</h1>
  <div class="navbar-end">
    <button on:click={() => $networkVisibility = true} class="button">Graphe</button>
  </div>


	<div class="scrollable" bind:this={div}>
		{#each comments as comment, idx}
        {#if comment.text}
			<article class="otheruser">
          <span>{@html comment.text}</span>
			</article>
        {/if}
        {#if comment.options}
			<article>
          <div class="buttons user">
          {#each comment.options as option}
            <button class="button { option.selected ? 'selected' : ''}" on:click={handleRules(option, idx)}>{option.text}</button>
          {/each}
          </div>
			</article>
        {/if}
		{/each}
	</div>
</div>
