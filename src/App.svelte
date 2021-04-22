<script>
  import NetworkGraph from './NetworkGraph.svelte';
	import { beforeUpdate, afterUpdate, onMount } from 'svelte';
  import { networkVisibility } from './stores';

	let div;
	let autoscroll;
  let state;
  let editMode = false;
  let nodes = [];
  let links = [];
  let comments = [];

  const getData = async (filename) => {
    const res = await fetch(filename)
    if (res) {
      return await res.json()
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
            text: reply.question,
            tooltip: reply.questionTooltip ? reply.questionTooltip : false,
            id: reply.id && reply.id
          });
          resolve(comments)
        }, 500 + Math.random() * 500);
      }, 200 + Math.random() * 200);
    })
  }

  const downloadData = (nodes, links) => {
    fetch('/form', {
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
	nodes: nodes,
	links: links
	})
    })
      .then(response => response.text())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  const editNode = () => {
    if (editMode) {
      comments.forEach(comment => {
        if (comment.id) {
          const nodeIdx = nodes.findIndex(x => x.id === comment.id)
          if (nodeIdx > -1) {
            nodes[nodeIdx]['question'] = comment.text
          }
        }
        if (comment.options !== undefined) {
          comment.options.forEach(option => {
            const optionIdx = nodes.findIndex(x => x.id === comment.id)
            if (optionIdx !== undefined &&  optionIdx >= 0) {
              nodes[optionIdx]['text'] = option.text
            }
          })
        }
      })
      downloadData(nodes, links)
    }
    editMode = !editMode
  }

  const handleRules = async (option, idx) => {
    if (option.id) {
      if (idx) {
        comments.forEach((comment, index) => {
          if (comment.options && index === idx) {
            comment.options.forEach(option => option.selected = "unselected")
          }
          if (comment.options && index > idx) {
            comment.options.forEach(option => option.selected = null)
          }
        })
        comments = comments.slice(0, idx + 1)
        option.selected = "selected"
      }

      state.position = nodes.find(x => x.id === option.id)
      state.childs = links.filter(x => x.source == state.position.id).map(x => x.target)
      await handleAnswer({...state.position})

      if (state.childs.length > 1) {
        comments = comments.concat({
          author: 'chatbot',
          options: state.childs.map(child => nodes.find(x => child == x.id))
        });
      } else if (state.childs.length === 1) {
        if (state.childs[0].includes('questions-vehicule')) {
          handleRules(nodes.find(x => state.childs[0] == x.id))
        }
      }
    }
  }

  const handleNewOption = (idx) => {
    const parentId = links.find(x => x.target === comments[idx].options[0].id).source
    const uniqueId = `node_${Date.now()}-${Math.round(Math.random() * 1E9)}`
    comments[idx].options = [...comments[idx].options, {text: "test", question: "Question ?", id: uniqueId}]
    nodes = [...nodes, {text: "texte", question: "Question ?", id: uniqueId}]
    links = [...links, {source: parentId, target: uniqueId}]
  }

  const createNewChild = (idx, option) => {
    const uniqueId = `node_${Date.now()}-${Math.round(Math.random() * 1E9)}`
    nodes = [...nodes, {text: "texte", question: "Question ?", id: uniqueId}]
    links = [...links, {source: option.id, target: uniqueId}]
    handleRules(option, idx)
  }

  const removeChild = (idx, option) => {
    const commentIdx = comments[idx].options.findIndex(x => x.id === option.id)
    const nodeIdx = nodes.findIndex(x => x.id === option.id)
    const linkIdx = links.findIndex(x => x.target === option.id)
    comments[idx].options.splice(commentIdx, 1)
    nodes.splice(nodeIdx, 1)
    links.splice(linkIdx, 1)
    editMode = !editMode
    editMode = !editMode
  }

  const selectNode = (option, checked) => {
    if (checked) {
      state.sourceNode = option
    } else {
      state.sourceNode = null
    }
  }

  onMount(async () => {
    nodes = await getData('__NODES__.json')
    links = await getData('__LINKS__.json')
    state = {
      position: 0,
      childs: []
    }

    state.position = nodes.find(x => x.id === 'start').id
    state.childs = links.filter(x => x.source == state.position).map(x => x.target)

    comments = [
      { auth: 'chatbot', 
        text: nodes.find(x => x.id === 'salutation').question,
        id: nodes.find(x => x.id === 'salutation').id
      },
      { auth: 'chatbot', 
        text: nodes.find(x => x.id === 'start').question,
        id: nodes.find(x => x.id === 'start').id 
      },
      { auth: 'chatbot', options: state.childs.map(child => nodes.filter(x => child == x.id)).map(x => x[0]) }
    ];

  })


	beforeUpdate(() => {
		autoscroll = div && (div.offsetHeight + div.scrollTop) > (div.scrollHeight - 20);
	});

	afterUpdate(() => {
		if (autoscroll) div.scrollTo(0, div.scrollHeight)
	});



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
    border-color: #4a4a4a;
    color: #363636;
    background-color: white;
    border-width: 1px;
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
    border-color: #3273dc;
  }

  .button.disabled {
    border-color: #dbdbdb;
    color: #363636;
    box-shadow: none;
  }

  .is-danger {
    background-color: #f14668;
    border-color: transparent;
    color: #fff;
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

  @-webkit-keyframes spinAround {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(359deg);
    }
  }

  @keyframes spinAround {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(359deg);
    }
  }

  /* line 67, src/sass/app.sass */
  [data-tooltip]:not(.is-loading), [data-tooltip]:not(.is-disabled), [data-tooltip]:not([disabled]) {
    cursor: pointer;
    overflow: visible;
    position: relative;
  }

  /* line 36, src/sass/app.sass */
  [data-tooltip]:not(.is-loading)::before, [data-tooltip]:not(.is-disabled)::before, [data-tooltip]:not([disabled])::before {
    box-sizing: border-box;
    color: white;
    display: inline-block;
    font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
    font-size: 0.75rem;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
    position: absolute;
    visibility: hidden;
    z-index: 1020;
    background: rgba(74, 74, 74, 0.9);
    border-radius: 2px;
    content: attr(data-tooltip);
    padding: 0.5rem 1rem;
    text-overflow: ellipsis;
    white-space: pre-line;
  }

  /* line 22, src/sass/_position.sass */
  [data-tooltip]:not(.is-loading)::before, [data-tooltip]:not(.is-disabled)::before, [data-tooltip]:not([disabled])::before {
    top: 0;
    right: auto;
    bottom: auto;
    left: 50%;
    top: 0;
    margin-top: -5px;
    margin-bottom: auto;
    transform: translate(-50%, -100%);
  }

  [data-tooltip]:not(.is-loading).has-tooltip-right::before, [data-tooltip]:not(.is-disabled).has-tooltip-right::before, [data-tooltip]:not([disabled]).has-tooltip-right::before {
    top: auto;
    right: -5px;
    bottom: 50%;
    left: auto;
    margin-top: auto;
    transform: translate(100%, 50%);
  }

  [data-tooltip]:not(.is-loading).has-tooltip-text-right::before, [data-tooltip]:not(.is-disabled).has-tooltip-text-right::before, [data-tooltip]:not([disabled]).has-tooltip-text-right::before {
    text-align: right;
  }

  [data-tooltip]:not(.is-loading):hover::before, [data-tooltip]:not(.is-loading):hover::after, [data-tooltip]:not(.is-loading).has-tooltip-active::before, [data-tooltip]:not(.is-loading).has-tooltip-active::after, [data-tooltip]:not(.is-disabled):hover::before, [data-tooltip]:not(.is-disabled):hover::after, [data-tooltip]:not(.is-disabled).has-tooltip-active::before, [data-tooltip]:not(.is-disabled).has-tooltip-active::after, [data-tooltip]:not([disabled]):hover::before, [data-tooltip]:not([disabled]):hover::after, [data-tooltip]:not([disabled]).has-tooltip-active::before, [data-tooltip]:not([disabled]).has-tooltip-active::after {
    opacity: 1;
    visibility: visible;
  }

  [data-tooltip]:not(.is-loading).has-tooltip-fade::before, [data-tooltip]:not(.is-loading).has-tooltip-fade::after, [data-tooltip]:not(.is-disabled).has-tooltip-fade::before, [data-tooltip]:not(.is-disabled).has-tooltip-fade::after, [data-tooltip]:not([disabled]).has-tooltip-fade::before, [data-tooltip]:not([disabled]).has-tooltip-fade::after {
    transition: opacity 0.3s linear, visibility 0.3s linear;
  }

  @media screen and (max-width: 768px) {
    /* line 10, src/sass/_position.sass */
    [data-tooltip]:not(.is-loading).has-tooltip-top-mobile.has-tooltip-arrow::after, [data-tooltip]:not(.is-disabled).has-tooltip-top-mobile.has-tooltip-arrow::after, [data-tooltip]:not([disabled]).has-tooltip-top-mobile.has-tooltip-arrow::after {
      top: 0;
      right: auto;
      bottom: auto;
      left: 50%;
      margin-top: -5px;
      margin-right: auto;
      margin-bottom: auto;
      margin-left: -5px;
      border-color: rgba(74, 74, 74, 0.9) transparent transparent transparent;
    }
    /* line 22, src/sass/_position.sass */
    [data-tooltip]:not(.is-loading).has-tooltip-top-mobile::before, [data-tooltip]:not(.is-disabled).has-tooltip-top-mobile::before, [data-tooltip]:not([disabled]).has-tooltip-top-mobile::before {
      top: 0;
      right: auto;
      bottom: auto;
      left: 50%;
      top: 0;
      margin-top: -5px;
      margin-bottom: auto;
      transform: translate(-50%, -100%);
    }
  }

  @media screen and (min-width: 769px), print {
    /* line 10, src/sass/_position.sass */
    [data-tooltip]:not(.is-loading).has-tooltip-top-tablet.has-tooltip-arrow::after, [data-tooltip]:not(.is-disabled).has-tooltip-top-tablet.has-tooltip-arrow::after, [data-tooltip]:not([disabled]).has-tooltip-top-tablet.has-tooltip-arrow::after {
      top: 0;
      right: auto;
      bottom: auto;
      left: 50%;
      margin-top: -5px;
      margin-right: auto;
      margin-bottom: auto;
      margin-left: -5px;
      border-color: rgba(74, 74, 74, 0.9) transparent transparent transparent;
    }
    /* line 22, src/sass/_position.sass */
    [data-tooltip]:not(.is-loading).has-tooltip-top-tablet::before, [data-tooltip]:not(.is-disabled).has-tooltip-top-tablet::before, [data-tooltip]:not([disabled]).has-tooltip-top-tablet::before {
      top: 0;
      right: auto;
      bottom: auto;
      left: 50%;
      top: 0;
      margin-top: -5px;
      margin-bottom: auto;
      transform: translate(-50%, -100%);
    }
  }

  .button.is-rounded {
    border-radius: 290486px;
    padding-left: calc(1em + 0.25em);
    padding-right: calc(1em + 0.25em);
  }

</style>

{#if (nodes.length > 0) && (links.length > 0)}
  <NetworkGraph nodesInput={nodes} linksInput={links}/>
{/if}

<div class="chat">

  <h1 class="title">PIAC Bot</h1>
  <div class="navbar-end">
    <button on:click={() => $networkVisibility = true} class="button">Graphe</button>
    <button on:click={() => editNode()} class="button {editMode ? 'is-danger' : ''}">
      {#if editMode}
        Sauvegarder changements
      {:else}
        Éditer
      {/if}
    </button>
  </div>

  <div class="scrollable" bind:this={div}>
    {#each comments as comment, idx}
      {#if comment.text}
        <article class="otheruser">
          {#if editMode}
            <input bind:value="{comments[idx].text}">
          {:else}
            <span>{@html comment.text}</span>
          {/if}
          {#if comment.tooltip}
            <button class="button has-tooltip-right is-rounded" data-tooltip="{comment.tooltip}">i</button>
          {/if}
        </article>
      {/if}
      {#if comment.options}
        <article>
          <div class="buttons user">
            {#each comment.options as option}
              {#if editMode}
                <input
                  type=checkbox
                  on:change={(e) => selectNode(option, e.target.checked)}
                  >
                  <input 
                    bind:value="{option.text}">
                  <br>
                  {#if state && state.sourceNode == option}
                    <button class="button" on:click={() => createNewChild(idx, option)}>+ option</button>
                    <button class="button " on:click={() => removeChild(idx, option)}>- supprimer</button>
                  {/if}
              {:else}
                <button class="button { option.selected === "selected" ? 'selected' : ''} {option.selected === "unselected" ? 'disabled' : ''} has-tooltip-right"  data-tooltip="{option.tooltip ? option.tooltip : null}" on:click={handleRules(option, idx)}>{option.text}</button>
              {/if}
            {/each}
            {#if editMode}
              &nbsp; &nbsp;
              <button class="button" on:click={() => handleNewOption(idx)}
                >+</button>
            {/if}
          </div>
        </article>
      {/if}
    {/each}
  </div>
</div>
