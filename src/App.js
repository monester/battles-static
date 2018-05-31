/* eslint-disable */
import React, { Component } from 'react';
import './App.css';
import { Timeline } from './react-timeline';
import moment from 'moment'
import { InputTagsContainer } from 'react-input-tags';
import {API_ROOT} from './api-config'

class Nav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: props.clanTag && `${props.region}/${props.clanTag}` || ''
    }
  }

  handleChange = (event) => {
    this.setState({searchText: event.target.value});
  };

  handleKeyPress = (event) => {
    if(event.key === 'Enter') {
      let params = this.state.searchText.split('/', 2);
      if(params.length === 2) {
        this.props.setClan(params[0], params[1])
      } else {
        const clanTag = event.target.value
        this.setState({searchText: `ru/${clanTag}`}, () => {
          this.props.setClan('ru', clanTag);
        });
      }
    }
  }

  render() {
    let logo, title = 'Battles';
    if(this.props.clanTag) {
      const clanId = this.props.clanId && this.props.clanId.toString() || '';
      logo = `https://${this.props.region}.wargaming.net/clans/media/clans/emblems/cl_${clanId.substr(clanId.length - 3)}/${this.props.clanId}/emblem_64x64.png`;
      title = this.props.clanTag.toUpperCase()
    } else {
      logo = '';
      title = 'Battles'
    }

    return <nav className="navbar navbar-expand-md navbar-dark bg-dark flex-md-nowrap p-0 shadow">
      <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="/">
        <img src={logo} width="30" height="30" className="d-inline-block align-top" alt=""/> {title}
      </a>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon" />
      </button>
      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <input className="form-control form-control-dark w-100" type="text" placeholder="Search" aria-label="Search" value={this.state.searchText} onChange={this.handleChange} onKeyPress={this.handleKeyPress} />
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap">
            <a className="nav-link" href="/">Sign out</a>
          </li>
        </ul>
      </div>
    </nav>;
  }
}

class RowCell extends React.Component {
  constructor (props) {
    super(props)
    this.state = {tags: this.props.data.tags}
  }

  handleUpdateTags = (tags) => {
    const url = `${API_ROOT}/tags/${this.props.data.region}/${this.props.data.clan_id}/${this.props.data.id}`

    this.setState(prevState => {
      fetch(url, {
        body: JSON.stringify({tags: tags}),
        method: 'POST',
      });
      return {tags: tags}
    })
  }

  render() {/* style={{backgroundColor: '#fff', height: '100%', width: '100%'}}>*/
    // console.log(this.props.data)
    const title = `${this.props.data.province_name} / ${this.props.data.arena_name}`
    const start_time = moment(this.props.data.start_time)
    const serverFront = `${this.props.data.server} / ${this.props.data.front_name}`

    return <div>
      <a style={{fontSize: 12, position: 'absolute', left: 0, top: 0, width: 260, overflow: 'hidden', whiteSpace: 'nowrap'}}
        href={`https://${this.props.data.region}.wargaming.net/globalmap/#province/${this.props.data.id}`} title={title}>
        {title}
      </a>
      <span style={{fontSize: 12, position: 'absolute', right: 0, top: 0, width: 40, overflow: 'hidden', whiteSpace: 'nowrap'}}>
        {start_time.format('HH:mm')}</span>
      <div style={{fontSize: 12, position: 'absolute', left: 0, top: 20, width: 200, overflow: 'hidden', whiteSpace: 'nowrap'}} className="app-tags">
        <InputTagsContainer
          tags={this.state.tags}
          handleUpdateTags={this.handleUpdateTags} inputPlaceholder="tags" />
      </div>
      <div style={{fontSize: 12, position: 'absolute', right: 0, top: 20, width: 100, overflow: 'hidden', whiteSpace: 'nowrap'}} title={serverFront}>
        {serverFront}
      </div>
    </div>
  }
}

class TimeCell extends React.Component {
  render() {
    let title, elo_rating_10

    // refactor this to get this variable only once!!!
    const parser = document.createElement('a')
    parser.href = window.location.href
    const clan_tag = parser.pathname.substring(1).split('/')[1]
    const clan_a = this.props.data.clan_a
    const clan_b = this.props.data.clan_b

    if(this.props.data.is_fake) {
      title = 'No opponent'
    } else {
      if(clan_a && clan_a.tag !== clan_tag) elo_rating_10 = clan_a.elo_rating_10

      title = clan_a && clan_a.tag;
      if(clan_b) {
        if(clan_b.tag !== clan_tag) elo_rating_10 = clan_b.elo_rating_10
        title = `${title} vs ${this.props.data.clan_b.tag}`
      }
    }
    if(elo_rating_10) {
      return <div style={{fontSize:11+'px'}}>
        {this.props.data.title} {moment(this.props.data.time).format('HH:mm')}<br />
        {title}<br/>
        Elo10: {elo_rating_10}
      </div>
    } else {
      return <div style={{fontSize:11+'px'}}>
        {this.props.data.title} {moment(this.props.data.time).format('HH:mm')}<br />
        {title}<br/>
      </div>
    }
  }
}

class OwnedProvinces extends React.Component {
  render() {

  }
}

const min30 = 30*60*1000;
const hour = 3600000;
const day = hour * 24;
const data = [
  {
    province_name: 'xx', id: 'xx',
    prime_time: '18:00',
    times: [{
      time: moment(Math.ceil(moment() / min30) * min30 + min30),
      duration: min30/2, clan_a: null, clan_b: null,
    }, {
      time: moment(Math.ceil(moment() / min30) * min30 + min30 * 1.5),
      duration: min30/2, clan_a: null, clan_b: null,
    }, {
      time: moment(Math.ceil(moment() / min30) * min30 + min30*3),
      duration: min30*1.5, clan_a: null, clan_b: null,
    }]
  }, {
    province_name: 'yy', id: 'yy',
    prime_time: '18:00',
    times: [{
      time: moment(Math.ceil(moment() / min30) * min30 + min30 * 8 - min30 * 0.1),
      duration: min30 / 2, clan_a: null, clan_b: null,
    }, {
      time: moment(Math.ceil(moment() / min30) * min30 + min30 * 8.5),
      duration: min30 / 2, clan_a: null, clan_b: null,
    }, {
      time: moment(Math.ceil(moment() / min30) * min30 + min30 * 9),
      duration: min30, clan_a: null, clan_b: null,
    }, {
      time: moment(Math.ceil(moment() / min30) * min30 + min30 * 12),
      duration: min30, clan_a: null, clan_b: null,
    }]
  }, {
    province_name: 'fort', id: 'fort',
    prime_time: '18:00',
    times: [{
      time: moment(Math.ceil(moment() / min30) * min30 + min30 * 8),
      duration: min30 / 2, clan_a: null, clan_b: null,
    }, {
      time: moment(Math.ceil(moment() / min30) * min30 + min30 * 8.5),
      duration: min30 / 2, clan_a: null, clan_b: null,
    }, {
      time: moment(Math.ceil(moment() / min30) * min30 + min30 * 9),
      duration: min30, clan_a: null, clan_b: null,
    }, {
      time: moment(Math.ceil(moment() / min30) * min30 + min30 * 48),
      duration: min30, clan_a: null, clan_b: null,
    }]
  }
];


class App extends Component {
  constructor(props) {
    super(props)
    const parser = document.createElement('a')
    parser.href = window.location.href

    const path = parser.pathname.substring(1).split('/')
    this.state = {
      scale: 12500,
      region: path[0],
      tag: path[1],
      clan_id: null,
      items: [],
      start: moment(~~(moment()/(15*60*1000))*15*60*1000),
    }
  }

  fetchAsync = async (clanTag, region) => {
    const resp = await fetch(`${API_ROOT}/${region}/${clanTag}`)
    return await resp.json()
  }

  componentDidMount() {
    if(this.state.tag && this.state.region) {
      this.fetchAsync(this.state.tag, this.state.region).then(res => {
        console.log(res)
        const now = moment()
        res.start = res.items[0].start_time
        if (res.start < now) {
          res.start = now - now % 1800000
        }
        res.items.forEach(e => e['clan_id'] = res.clan_id)

        this.setState(res)
      })
    }
  }

  setClan = (region, clanTag) => {
    console.log(`Setting clan ${region} / ${clanTag}`)
    if(location.port !== "") {
      window.location = `${location.protocol}//${location.hostname}:${location.port}/${region}/${clanTag}`
    } else {
      window.location = `${location.protocol}//${location.hostname}/${region}/${clanTag}`
    }

  }

  addTime = (val) => {
    if(val !== undefined) {
      this.setState(prevState => ({start: prevState.start + val * 60000}))
    } else {
      this.setState({start: ~~(moment()/(15*60*1000))*15*60*1000})
    }
  }

  addScale = (val) => {
    if(val !== undefined) {
      this.setState(prevState => ({scale: prevState.scale + val}))
    } else {
      this.setState({scale: 12500})
    }

  }

  render() {
    let content
    if(this.state.tag && this.state.region) {
      content = <div>
        <button onClick={(e) => this.addTime(-30)}>-30 min</button>
        <button onClick={(e) => this.addTime()}>now</button>
        <button onClick={(e) => this.addTime(+30)}>+30 min</button>
        <button onClick={(e) => this.addScale(+600)}>zoom -</button>
        <button onClick={(e) => this.addScale()}>reset zoom</button>
        <button onClick={(e) => this.addScale(-600)}>zoom +</button>
        <Timeline
          scale={this.state.scale}
          start={this.state.start}
          rowCell={RowCell}
          rowHeight={50}
          timeCell={TimeCell}
          items={this.state.items}
          updateClan={this.updateClan}
        />
      </div>
    } else {
      content = <h1 style={{textAlign: 'center'}}><a href="/ru/lecat">Clan LECAT</a></h1>
    }

    return (
      <div>
        <Nav region={this.state.region} clanTag={this.state.tag} clanId={this.state.clan_id} setClan={this.setClan}/>
        {content}
      </div>
    );
  }
}

export default App;
