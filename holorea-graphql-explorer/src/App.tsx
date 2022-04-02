import React, { Component } from 'react'
import { GraphQLSchema, parse, DocumentNode } from 'graphql'
import { SchemaLink } from '@apollo/client/link/schema'
// @ts-ignore
import GraphiQL, { Fetcher } from 'graphiql'
// @ts-ignore
import GraphiQLExplorer from 'graphiql-explorer'
//import {initGraphQLClient } from '@vf-ui/graphql-client-holochain'

//import bindSchema, APIOptions from '@valueflows/vf-graphql-holochain'
import bindSchema, { autoConnect } from '@valueflows/vf-graphql-holochain'

import 'graphiql/graphiql.css'
import './App.css'

const DEFAULT_QUERY = `{
  myAgent {
    id
    name
  }
}`

interface Props {}

interface State {
  schema?: GraphQLSchema,
  link?: SchemaLink,
  fetcher?: Fetcher,
  query?: string,
  explorerIsOpen: boolean,
}

class App extends Component<Props, State> {
  _graphiql?: GraphiQL
  state = {
    schema: undefined,
    link: undefined,
    fetcher: undefined,
    query: DEFAULT_QUERY,
    explorerIsOpen: false
  }

  constructor(props: Props) {
    super(props)
    this.connect()
  }

  async connect () {
    //let ops:APIOptions = {} 
    //let ppoop = await initGraphQLClient({})
    let { dnaConfig, conductorUri } = await autoConnect()
    const schema = await bindSchema({ dnaConfig, conductorUri })
    const link = new SchemaLink({ schema })

    this.setState({
      schema,
      link,
      fetcher: ((operation: any) => {
        operation.query = parse(operation.query)
        return link.request(operation)
      }) as Fetcher
    })
  }

  _handleEditQuery = (query?: string, documentAST?: DocumentNode): void => this.setState({ query })

  _handleToggleExplorer = () => {
    this.setState({ explorerIsOpen: !this.state.explorerIsOpen })
  }

  render () {
    const { query, schema, fetcher } = this.state

    const nodes = [(
        <GraphiQLExplorer key="explorer"
          schema={schema}
          query={query}
          onEdit={this._handleEditQuery}
          explorerIsOpen={this.state.explorerIsOpen}
          onToggleExplorer={this._handleToggleExplorer}
        />
      ), (fetcher ? (
        <GraphiQL key="giql-main"
          ref={
            //@ts-ignore
            ref => (this._graphiql = ref)
          }
          fetcher={fetcher}
          schema={schema}
          query={query}
          onEditQuery={this._handleEditQuery}>
          <GraphiQL.Toolbar>
            <GraphiQL.Button
              onClick={() => { if (this._graphiql) this._graphiql.handlePrettifyQuery() }}
              label='Prettify'
              title='Prettify Query (Shift-Ctrl-P)'
            />
            <GraphiQL.Button
              onClick={() => { if (this._graphiql) this._graphiql.handleToggleHistory() }}
              label='History'
              title='Show History'
            />
            <GraphiQL.Button
              onClick={this._handleToggleExplorer}
              label='Explorer'
              title='Toggle Explorer'
            />
          </GraphiQL.Toolbar>
        </GraphiQL>
      ) : null)
    ]

    return (
      <div className='graphiql-container'>{nodes}</div>
    )
  }
}

export default App
