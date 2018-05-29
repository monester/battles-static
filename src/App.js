/* eslint-disable */
import React, { Component } from 'react';
import './App.css';
import { Timeline } from './react-timeline';
import moment from 'moment'
import {API_ROOT} from './api-config'

class Nav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: props.clan && `${props.clan['region']}/${props.clan['tag']}` || ''
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
    let logo, clanTag;
    if(this.props.clan) {
      logo = this.props.clan['emblems']['x32']['portal'];
      clanTag = this.props.clan['tag']
    } else {
      logo = '';
      clanTag = ''
    }

    return <nav className="navbar navbar-expand-md navbar-dark bg-dark flex-md-nowrap p-0 shadow">
      <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="/">
        <img src={logo} width="30" height="30" className="d-inline-block align-top" alt=""/>
        {clanTag}
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
  render() {/* style={{backgroundColor: '#fff', height: '100%', width: '100%'}}>*/
    console.log(this.props.data)
    const start_time = moment(this.props.data.start_time)
    return <div>
      <a style={{fontSize: 12}}
        href={`https://${this.props.data.region}.wargaming.net/globalmap/#province/${this.props.data.id}`}>
        {this.props.data.province_name} {start_time.format('HH:mm')}<br/>
        {this.props.data.arena_name}
      </a>
    </div>
  }
}

class TimeCell extends React.Component {
  render() {
    let title
    if(this.props.data.is_fake) {
      title = 'No opponent'
    } else {
      title = this.props.data.clan_a && this.props.data.clan_a.tag;
      if (this.props.data.clan_b) {
        title = `${title} vs ${this.props.data.clan_b.tag}`
      }
    }
    return <div>{this.props.data.title} {title}</div>
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
    super(props);
    const parser = document.createElement('a')
    parser.href = window.location.href

    const path = parser.pathname.substring(1).split('/')
    this.state = {
      region: path[0],
      tag: path[1],
      clan: null,
      items: [],
      start: moment(~~(moment()/(15*60*1000))*15*60*1000),
    }
  }

  fetchAsync = async (clanTag, region) => {
    const resp = await fetch(`${API_ROOT}/${region}/${clanTag}`)
    return await resp.json()
  }

  componentDidMount() {
    console.log('componentDidMount')
    this.fetchAsync(this.state.tag, this.state.region).then(res => {
      console.log(res)
      const now = moment()
      res.start = res.items[0].start_time
      if (res.start < now) {
        res.start = now - now % 1800000
      }
      this.setState(res)
    })
  }

  setClan = (region, clanTag) => {
    console.log(`Setting clan ${region} / ${clanTag}`)
  }

  render() {
    console.log(this.state.items)
    return (
      <div>
        <Nav title={this.state.clan_tag} clan={this.state.clan} setClan={this.setClan}/>
        <Timeline
          start={this.state.start}
          rowCell={RowCell}
          rowHeight={50}
          timeCell={TimeCell}
          items={this.state.items}
          updateClan={this.updateClan}
        />
      </div>
    );
  }
}

export default App;
