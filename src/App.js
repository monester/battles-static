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

    const allPretenders = this.props.data.pretenders.join(',')

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
      <div style={{fontSize: 12, position: 'absolute', right: 0, top: 15, width: 100, overflow: 'hidden', whiteSpace: 'nowrap'}} title={serverFront}>
        {serverFront}
      </div>
      <div style={{fontSize: 12, position: 'absolute', right: 0, top: 30, width: 100, overflow: 'hidden', whiteSpace: 'nowrap'}} title={allPretenders}>
        {this.props.data.pretenders.length} Clans: {allPretenders}
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
    const clan_tag = parser.pathname.substring(1).split('/')[1].toUpperCase()
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
      if(! clan_a && this.props.data.pretenders) {
        const text = this.props.data.pretenders.map(i => {
          const tag = i['tag']
          const xp = i['xp']
          let metric = '';
          if (xp === 0 || xp === null) {
            metric = `ELO${i['elo_rating_10']}`
          } else {
            metric =  `XP${xp}`
          }
          return `[${tag},${metric}]`
        })
        title = <span style={{whiteSpace: 'nowrap'}} title={text}>
          {this.props.data.pretenders.length} clans : {text}
          </span>
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


class Province extends React.Component {
  render() {
    const province_name = this.props.data.province_name
    return <div className="province-item">
      <h5>{province_name}</h5>
      <p>
        Прайм: {this.props.data.prime_time} UTC<br/>
        Карта: {this.props.data.arena_name}
      </p>
    </div>
  }
}


class ClanProvinces extends React.Component {
  render() {
    const provinces = this.props.provinces.sort((a, b) => {
      const a_time = a.prime_time.split(':')
      const a_hour = parseInt(a_time[0])
      const a_minute = parseInt(a_time[1])
      const b_time = b.prime_time.split(':')
      const b_hour = parseInt(b_time[0])
      const b_minute = parseInt(b_time[1])
      if(a_hour > b_hour) return 1
      else if(a_hour < b_hour) return -1
      else if(a_minute > b_minute) return 1
      else if(a_minute < b_minute) return -1
      return 0
    }).map(p => <Province data={p} />)
    return <div>
      <h5>Провинции клана</h5>
      <div className="clan-provinces">
        {provinces}
      </div>
    </div>
  }
}


class App extends Component {
  constructor(props) {
    super(props)
    const parser = document.createElement('a')
    parser.href = window.location.href

    const path = parser.pathname.substring(1).split('/')
    const region = path[0]
    const tag = path[1]
    let title;

    if (region === 'ru') {
      title = "Гонка Вооружений. День"
    } else  {
      title = "The Arms Race. Day"
    }
    const start = moment('2018-05-28T03:00:00+00:00')
    const headerGroup = [...Array(14).keys()].map(index => ({
      time: start.clone().add({days: index}),
      duration: 864001000,
      title: `${title} ${index+1} / 14`,
    }))

    this.state = {
      headerGroup: headerGroup,
      scale: 12500,
      region: region,
      tag: tag,
      clan_id: null,
      items: [],
      start: moment(~~(moment()/(15*60*1000))*15*60*1000),
      clan_provinces: [],
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
        if(res.items.length > 0) {
          res.start = res.items[0].start_time
          if (res.start < now) {
            res.start = now - now % 1800000
          }
          // add clan_id to each row to use it in rowCell to set tags for province
          res.items.forEach(e => e['clan_id'] = res.clan_id)
        } else {
          res.start = now
        }
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
          headerGroup={this.state.headerGroup}
        />
        <ClanProvinces provinces={this.state.clan_provinces} />
      </div>
    } else {
      content = <h1 style={{textAlign: 'center'}}><a href="/ru/lecat">Clan LECAT</a></h1>
    }

    return (
      <div>
        <Nav region={this.state.region} clanTag={this.state.tag} clanId={this.state.clan_id} setClan={this.setClan}/>
        {content}
        <p style={{width: '100%', textAlign: 'center', color: 'red'}}>
          <span>Ошибка в таблице? - </span><a href="https://t.me/battlesuniversecc">telegram / @battlesuniversecc</a>
        </p>
      </div>
    );
  }
}

export default App;
